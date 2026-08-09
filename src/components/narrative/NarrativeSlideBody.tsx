import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { SlideNarrativo } from '@/types';
import { KatexRenderer } from '@/components/math/KatexRenderer';
import { Button } from '@/components/ui/Button';
import { FormulaAnimator } from './FormulaAnimator';
import { dividirFormulaEnTerminos } from './terminoFormula';

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

/** El padre le pasa key={slide.id} para forzar un remount (y un nuevo burst) por slide. */
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

interface NarrativeSlideBodyProps {
  slide: SlideNarrativo;
  /** Solo se usa en slides tipo 'pregunta', que exigen interaccion explicita para avanzar. */
  onContinuar: () => void;
}

/**
 * Cuerpo visual de un slide narrativo (titulo + contenido segun tipo), sin
 * barra de progreso ni flechas propias: esas las provee el deck contenedor
 * (ExperienciaContinua), que trata cada slide como un paso mas de su indice
 * unico junto con las demas fases pedagogicas.
 */
export const NarrativeSlideBody = memo(function NarrativeSlideBody({
  slide,
  onContinuar,
}: NarrativeSlideBodyProps) {
  const terminosFormula = useMemo(() => {
    if (slide.tipo !== 'formula') return undefined;
    const latex = slide.formulaDestacada ?? slide.contenido;
    return latex ? dividirFormulaEnTerminos(latex) : undefined;
  }, [slide]);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <motion.h2
        className="text-center font-display text-2xl font-bold text-math-white sm:text-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {slide.titulo}
      </motion.h2>

      {slide.tipo === 'revelacion' && <ConfettiRevelacion key={slide.id} />}

      {slide.tipo === 'historia' && <TypewriterTexto contenido={slide.contenido} />}

      {slide.tipo === 'formula' && (
        <div className="w-full">
          <FormulaAnimator terminos={terminosFormula} />
          {slide.contenido && (
            <p className="mt-4 text-center text-sm text-math-silver">{slide.contenido}</p>
          )}
        </div>
      )}

      {slide.tipo === 'analogia' && <TypewriterTexto contenido={slide.contenido} />}

      {slide.tipo === 'pregunta' && (
        <div className="flex flex-col items-center gap-6">
          <p className="max-w-xl text-center text-xl font-medium text-math-white">{slide.contenido}</p>
          <Button onClick={onContinuar}>Continuar</Button>
        </div>
      )}

      {slide.tipo === 'revelacion' && (
        <motion.p
          className="max-w-xl text-center text-lg text-math-white"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4, type: 'spring' }}
        >
          {slide.contenido}
        </motion.p>
      )}
    </div>
  );
});
