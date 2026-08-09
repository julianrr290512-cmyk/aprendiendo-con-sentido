import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type {
  CategoriaPasoDeck,
  FuenteContenido,
  MetacognicionRespuesta,
  PasoDeck,
  RespuestaEjercicio,
  SimulacionTelemetria,
} from '@/types';
import { NarrativeSlideBody } from '@/components/narrative/NarrativeSlideBody';
import { Prediccion } from '@/components/phases/Prediccion';
import { Simulacion } from '@/components/phases/Simulacion';
import { Exploracion } from '@/components/phases/Exploracion';
import { Formalizacion } from '@/components/phases/Formalizacion';
import { EjerciciosDeckStep } from './EjerciciosDeckStep';
import { ProgressBar, type FaseProgreso, type FaseProgresoEstado } from '@/components/ui/ProgressBar';
import { useNarrativeSound } from '@/components/narrative/narrativeSoundEngine';
import { cn } from '@/utils/cn';

const ORDEN_CATEGORIAS: CategoriaPasoDeck[] = [
  'introduccion',
  'prediccion',
  'simulacion',
  'exploracion',
  'formalizacion',
  'ejercicios',
];

interface ExperienciaContinuaProps {
  pasos: PasoDeck[];
  /** true si algun paso pedagogico posterior todavia se esta generando con IA. */
  cargandoSiguiente: boolean;
  dba: string[];
  dbaFuente: FuenteContenido;
  onCompletarPrediccion: (texto: string) => void;
  onCompletarSimulacion: (telemetria: SimulacionTelemetria) => void;
  onCompletarExploracion: () => void;
  onCompletarFormalizacion: (reflexion: string) => void;
  onCompletarEjercicios: (
    respuestas: RespuestaEjercicio[],
    metacognicion: MetacognicionRespuesta[],
  ) => void;
  onCompletadoTotal: () => void;
  className?: string;
}

/**
 * Deck continuo tipo presentacion interactiva: un unico indice avanza por
 * la intro narrativa y las 5 fases pedagogicas (Prediccion, Simulacion,
 * Exploracion, Formalizacion, Ejercicios), reusando los componentes de fase
 * existentes sin modificarlos. Reemplaza la navegacion por paginas/rutas que
 * tenian antes Presentacion/Fases/Ejercicios.
 */
export const ExperienciaContinua = memo(function ExperienciaContinua({
  pasos,
  cargandoSiguiente,
  dba,
  dbaFuente,
  onCompletarPrediccion,
  onCompletarSimulacion,
  onCompletarExploracion,
  onCompletarFormalizacion,
  onCompletarEjercicios,
  onCompletadoTotal,
  className,
}: ExperienciaContinuaProps) {
  const [indice, setIndice] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [esperandoSiguiente, setEsperandoSiguiente] = useState(false);
  const [prediccionTexto, setPrediccionTexto] = useState<string | undefined>(undefined);
  const { reproducir } = useNarrativeSound();
  const completadoRef = useRef(false);

  const pasoActual = pasos[indice];
  const esIntroduccion = pasoActual?.categoria === 'introduccion';

  const irA = useCallback(
    (siguiente: number) => {
      if (siguiente < 0) return;
      if (siguiente >= pasos.length) {
        if (cargandoSiguiente) {
          setEsperandoSiguiente(true);
          return;
        }
        if (!completadoRef.current) {
          completadoRef.current = true;
          onCompletadoTotal();
        }
        return;
      }
      setEsperandoSiguiente(false);
      setIndice(siguiente);
    },
    [pasos.length, cargandoSiguiente, onCompletadoTotal],
  );

  // Si el usuario termino el ultimo paso disponible pero el siguiente aun se
  // esta generando, avanza automaticamente en cuanto aparezca en `pasos`.
  useEffect(() => {
    if (esperandoSiguiente && indice + 1 < pasos.length) {
      setEsperandoSiguiente(false);
      setIndice(indice + 1);
    }
  }, [esperandoSiguiente, indice, pasos.length]);

  const avanzar = useCallback(() => irA(indice + 1), [indice, irA]);
  const retroceder = useCallback(() => irA(indice - 1), [indice, irA]);

  useEffect(() => {
    if (pasoActual?.categoria === 'introduccion' && pasoActual.slide.sonido) {
      reproducir(pasoActual.slide.sonido);
    }
  }, [pasoActual, reproducir]);

  useEffect(() => {
    if (
      !autoplay ||
      pasoActual?.categoria !== 'introduccion' ||
      !pasoActual.slide.duracionAuto ||
      pasoActual.slide.tipo === 'pregunta'
    ) {
      return undefined;
    }
    const timer = window.setTimeout(avanzar, pasoActual.slide.duracionAuto);
    return () => window.clearTimeout(timer);
  }, [autoplay, pasoActual, avanzar]);

  useEffect(() => {
    if (!esIntroduccion) return undefined;
    function manejarTecla(evento: KeyboardEvent) {
      if (evento.key === 'ArrowRight') avanzar();
      if (evento.key === 'ArrowLeft') retroceder();
    }
    window.addEventListener('keydown', manejarTecla);
    return () => window.removeEventListener('keydown', manejarTecla);
  }, [avanzar, retroceder, esIntroduccion]);

  const fasesProgreso: FaseProgreso[] = useMemo(() => {
    return ORDEN_CATEGORIAS.filter((categoria) => pasos.some((paso) => paso.categoria === categoria)).map(
      (categoria) => {
        const indices = pasos.reduce<number[]>(
          (acc, paso, i) => (paso.categoria === categoria ? [...acc, i] : acc),
          [],
        );
        const primero = Math.min(...indices);
        const ultimo = Math.max(...indices);
        const estado: FaseProgresoEstado =
          indice > ultimo ? 'completada' : indice >= primero ? 'activa' : 'pendiente';
        return { tipo: categoria, estado };
      },
    );
  }, [pasos, indice]);

  if (!pasoActual) return null;

  return (
    <div className={cn('relative flex min-h-[70vh] flex-col', className)}>
      <div className="px-6 pt-6">
        <ProgressBar fases={fasesProgreso} />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={pasoActual.id}
            className="w-full"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4 }}
          >
            {pasoActual.categoria === 'introduccion' && (
              <NarrativeSlideBody slide={pasoActual.slide} onContinuar={avanzar} />
            )}

            {pasoActual.categoria === 'prediccion' && (
              <Prediccion
                fase={pasoActual.fase}
                onCompletar={(texto) => {
                  setPrediccionTexto(texto);
                  onCompletarPrediccion(texto);
                  avanzar();
                }}
              />
            )}

            {pasoActual.categoria === 'simulacion' && (
              <Simulacion
                fase={pasoActual.fase}
                onCompletar={(telemetria) => {
                  onCompletarSimulacion(telemetria);
                  avanzar();
                }}
              />
            )}

            {pasoActual.categoria === 'exploracion' && (
              <Exploracion
                fase={pasoActual.fase}
                onCompletar={() => {
                  onCompletarExploracion();
                  avanzar();
                }}
              />
            )}

            {pasoActual.categoria === 'formalizacion' && (
              <Formalizacion
                fase={pasoActual.fase}
                prediccionEstudiante={prediccionTexto}
                dba={dba}
                dbaFuente={dbaFuente}
                onCompletar={(reflexion) => {
                  onCompletarFormalizacion(reflexion);
                  avanzar();
                }}
              />
            )}

            {pasoActual.categoria === 'ejercicios' && (
              <EjerciciosDeckStep
                ejercicios={pasoActual.ejercicios}
                mapaTransferencia={pasoActual.mapaTransferencia}
                preguntasMetacognicion={pasoActual.preguntasMetacognicion}
                onFinalizar={(respuestas, metacognicion) => {
                  onCompletarEjercicios(respuestas, metacognicion);
                  avanzar();
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {esperandoSiguiente && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center"
          >
            <div className="flex items-center gap-2 rounded-full border border-math-cyan/20 bg-math-midnight/95 px-4 py-2 text-xs text-math-silver shadow-lg">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-math-cyan/30 border-t-math-cyan" />
              Preparando el siguiente paso...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {esIntroduccion && (
        <div className="relative px-6 pb-6">
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={retroceder}
              disabled={indice === 0}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-math-cyan/20 text-math-silver transition-colors hover:border-math-cyan/50 hover:text-math-cyan disabled:opacity-30"
              aria-label="Paso anterior"
            >
              ‹
            </button>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setAutoplay((prev) => !prev)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  autoplay ? 'border-math-cyan/40 text-math-cyan' : 'border-math-silver/20 text-math-silver',
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
              aria-label="Siguiente paso"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
