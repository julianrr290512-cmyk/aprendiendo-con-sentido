import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AreaId, SlideNarrativo } from '@/types';
import { KatexRenderer } from '@/components/math/KatexRenderer';
import { Button } from '@/components/ui/Button';
import { FormulaAnimator } from './FormulaAnimator';
import { dividirFormulaEnTerminos } from './terminoFormula';
import { AnalogyCard } from './AnalogyCard';
import { useNarrativeSound } from './narrativeSoundEngine';
import { cn } from '@/utils/cn';

const PALETA_TERMINOS = ['#0891b2', '#d97706', '#16a34a', '#db2777', '#0284c7', '#64748b'];

interface TokenContenido {
  texto: string;
  esFormula: boolean;
}

/** Divide el contenido en palabras, preservando fragmentos $latex$ como un solo token. */
function tokenizarContenido(contenido: string): TokenContenido[] {
  const partes = contenido.split(/(\$[^$]+\$)/g).filter(Boolean);
  return partes.flatMap((parte): TokenContenido[] => {
    if (parte.startsWith('$') && parte.endsWith('$')) {
      return [{ texto: parte.slice(1, -1), esFormula: true }];
    }
    return parte
      .split(/\s+/)
      .filter(Boolean)
      .map((palabra) => ({ texto: palabra, esFormula: false }));
  });
}

const TypewriterTexto = memo(function TypewriterTexto({ contenido }: { contenido: string }) {
  const tokens = useMemo(() => tokenizarContenido(contenido), [contenido]);

  return (
    <p className="max-w-2xl text-center text-lg leading-relaxed text-math-white sm:text-xl">
      {tokens.map((token, indice) => (
        <motion.span
          key={`${indice}-${token.texto}`}
          className="mr-[0.35em] inline-block"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: indice * 0.045 }}
        >
          {token.esFormula ? <KatexRenderer latex={token.texto} /> : token.texto}
        </motion.span>
      ))}
    </p>
  );
});

const CONFETTI_SIMBOLOS = ['∑', '∫', 'π', '√', '∞', '=', 'Δ', '★'];

/** El padre le pasa key={slideActual.id} para forzar un remount (y un nuevo burst) por slide. */
const ConfettiRevelacion = memo(function ConfettiRevelacion() {
  const piezas = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        simbolo: CONFETTI_SIMBOLOS[i % CONFETTI_SIMBOLOS.length] ?? '∑',
        left: `${Math.round((i * 41) % 100)}%`,
        retraso: (i % 8) * 0.05,
        color: PALETA_TERMINOS[i % PALETA_TERMINOS.length] ?? '#0891b2',
        rotacionFinal: (i % 2 === 0 ? 1 : -1) * (120 + (i % 5) * 40),
      })),
    [],
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {piezas.map((pieza) => (
        <motion.span
          key={pieza.id}
          className="absolute top-0 font-math text-2xl"
          style={{ left: pieza.left, color: pieza.color }}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: pieza.rotacionFinal }}
          transition={{ duration: 2.6, delay: pieza.retraso, ease: 'easeIn' }}
        >
          {pieza.simbolo}
        </motion.span>
      ))}
    </div>
  );
});

interface NarrativeEngineProps {
  slides: SlideNarrativo[];
  onCompletado: () => void;
  /** Determina que pareja de analogia mostrar en slides tipo 'analogia'. */
  areaId?: AreaId;
  className?: string;
}

/**
 * Presentacion tipo mini-documental: avanza slide a slide con controles estilo
 * YouTube (barra segmentada, prev/next, autoplay, contador, flechas de teclado)
 * y un efecto de entrada distinto segun el tipo de slide.
 */
export const NarrativeEngine = memo(function NarrativeEngine({
  slides,
  onCompletado,
  areaId,
  className,
}: NarrativeEngineProps) {
  const [indice, setIndice] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const { reproducir } = useNarrativeSound();
  const completadoRef = useRef(false);

  const slideActual = slides[indice];
  const esUltimo = indice === slides.length - 1;

  const irA = useCallback(
    (siguiente: number) => {
      if (siguiente < 0) return;
      if (siguiente >= slides.length) {
        if (!completadoRef.current) {
          completadoRef.current = true;
          onCompletado();
        }
        return;
      }
      setIndice(siguiente);
    },
    [onCompletado, slides.length],
  );

  const avanzar = useCallback(() => irA(indice + 1), [indice, irA]);
  const retroceder = useCallback(() => irA(indice - 1), [indice, irA]);

  // Sonido propio del slide al entrar.
  useEffect(() => {
    if (slideActual?.sonido) reproducir(slideActual.sonido);
  }, [slideActual, reproducir]);

  // Avance automatico: solo si autoplay esta activo, el slide define duracion,
  // y no es una pregunta (que exige interaccion explicita).
  useEffect(() => {
    if (!autoplay || !slideActual?.duracionAuto || slideActual.tipo === 'pregunta') return undefined;
    const timer = window.setTimeout(avanzar, slideActual.duracionAuto);
    return () => window.clearTimeout(timer);
  }, [autoplay, slideActual, avanzar]);

  // Flechas de teclado.
  useEffect(() => {
    function manejarTecla(evento: KeyboardEvent) {
      if (evento.key === 'ArrowRight') avanzar();
      if (evento.key === 'ArrowLeft') retroceder();
    }
    window.addEventListener('keydown', manejarTecla);
    return () => window.removeEventListener('keydown', manejarTecla);
  }, [avanzar, retroceder]);

  const terminosFormula = useMemo(() => {
    if (!slideActual || slideActual.tipo !== 'formula') return undefined;
    const latex = slideActual.formulaDestacada ?? slideActual.contenido;
    return latex ? dividirFormulaEnTerminos(latex) : undefined;
  }, [slideActual]);

  if (!slideActual) return null;

  return (
    <div className={cn('relative flex min-h-[70vh] flex-col', className)}>
      {slideActual.imagenFondo && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-20 blur-sm"
          style={{ backgroundImage: `url(${slideActual.imagenFondo})` }}
        />
      )}

      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slideActual.id}
            className="flex w-full flex-col items-center gap-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4 }}
          >
            <motion.h2
              className="text-center font-display text-2xl font-bold text-math-white sm:text-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {slideActual.titulo}
            </motion.h2>

            {slideActual.tipo === 'revelacion' && <ConfettiRevelacion key={slideActual.id} />}

            {slideActual.tipo === 'historia' && <TypewriterTexto contenido={slideActual.contenido} />}

            {slideActual.tipo === 'formula' && (
              <div className="w-full">
                <FormulaAnimator terminos={terminosFormula} />
                {slideActual.contenido && (
                  <p className="mt-4 text-center text-sm text-math-silver">{slideActual.contenido}</p>
                )}
              </div>
            )}

            {slideActual.tipo === 'analogia' && (
              <div className="w-full max-w-3xl space-y-4">
                <p className="text-center text-base text-math-silver">{slideActual.contenido}</p>
                <AnalogyCard areaId={areaId} />
              </div>
            )}

            {slideActual.tipo === 'pregunta' && (
              <div className="flex flex-col items-center gap-6">
                <p className="max-w-xl text-center text-xl font-medium text-math-white">
                  {slideActual.contenido}
                </p>
                <Button onClick={avanzar}>Continuar</Button>
              </div>
            )}

            {slideActual.tipo === 'revelacion' && (
              <motion.p
                className="max-w-xl text-center text-lg text-math-white"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4, type: 'spring' }}
              >
                {slideActual.contenido}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative px-6 pb-6">
        <div className="flex gap-1.5">
          {slides.map((slide, i) => (
            <div key={slide.id} className="h-1 flex-1 overflow-hidden rounded-full bg-math-midnight">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-math-cyan to-math-gold"
                initial={false}
                animate={
                  i < indice
                    ? { width: '100%' }
                    : i > indice
                      ? { width: '0%' }
                      : { width: autoplay && slide.duracionAuto && slide.tipo !== 'pregunta' ? '100%' : '0%' }
                }
                transition={
                  i === indice && autoplay && slide.duracionAuto && slide.tipo !== 'pregunta'
                    ? { duration: slide.duracionAuto / 1000, ease: 'linear' }
                    : { duration: 0.25 }
                }
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={retroceder}
            disabled={indice === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-math-cyan/20 text-math-silver transition-colors hover:border-math-cyan/50 hover:text-math-cyan disabled:opacity-30"
            aria-label="Slide anterior"
          >
            ‹
          </button>

          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-math-silver">
              Slide {indice + 1} de {slides.length}
            </span>
            <button
              type="button"
              onClick={() => setAutoplay((prev) => !prev)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                autoplay
                  ? 'border-math-cyan/40 text-math-cyan'
                  : 'border-math-silver/20 text-math-silver',
              )}
              aria-pressed={autoplay}
            >
              {autoplay ? '⏸ Autoplay' : '▶ Autoplay'}
            </button>
          </div>

          <button
            type="button"
            onClick={avanzar}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-math-cyan/20 text-math-silver transition-colors hover:border-math-cyan/50 hover:text-math-cyan"
            aria-label={esUltimo ? 'Finalizar' : 'Siguiente slide'}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
});
