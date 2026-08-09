import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CategoriaPasoDeck, PasoDeck, RespuestaEjercicio } from '@/types';
import { Prediccion } from '@/components/phases/Prediccion';
import { Exploracion } from '@/components/phases/Exploracion';
import { Formalizacion } from '@/components/phases/Formalizacion';
import { EjerciciosDeckStep } from './EjerciciosDeckStep';
import { ProgressBar, type FaseProgreso, type FaseProgresoEstado } from '@/components/ui/ProgressBar';
import { cn } from '@/utils/cn';

const ORDEN_CATEGORIAS: CategoriaPasoDeck[] = ['prediccion', 'exploracion', 'formalizacion', 'ejercicios'];

interface ExperienciaContinuaProps {
  pasos: PasoDeck[];
  /** true si algun paso pedagogico posterior todavia se esta generando con IA. */
  cargandoSiguiente: boolean;
  onCompletarPrediccion: (textos: string[]) => void;
  onCompletarExploracion: () => void;
  onCompletarFormalizacion: () => void;
  onCompletarEjercicios: (respuestas: RespuestaEjercicio[]) => void;
  onCompletadoTotal: () => void;
  className?: string;
}

/**
 * Deck continuo tipo presentacion interactiva: un unico indice avanza por
 * las 4 fases pedagogicas (Prediccion, Exploracion, Formalizacion,
 * Ejercicios), reusando los componentes de fase existentes.
 */
export const ExperienciaContinua = memo(function ExperienciaContinua({
  pasos,
  cargandoSiguiente,
  onCompletarPrediccion,
  onCompletarExploracion,
  onCompletarFormalizacion,
  onCompletarEjercicios,
  onCompletadoTotal,
  className,
}: ExperienciaContinuaProps) {
  const [indice, setIndice] = useState(0);
  const [esperandoSiguiente, setEsperandoSiguiente] = useState(false);
  const [prediccionesTexto, setPrediccionesTexto] = useState<string[] | undefined>(undefined);
  const completadoRef = useRef(false);

  const pasoActual = pasos[indice];

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
            {pasoActual.categoria === 'prediccion' && (
              <Prediccion
                fase={pasoActual.fase}
                onCompletar={(textos) => {
                  setPrediccionesTexto(textos);
                  onCompletarPrediccion(textos);
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
                prediccionesEstudiante={prediccionesTexto}
                onCompletar={() => {
                  onCompletarFormalizacion();
                  avanzar();
                }}
              />
            )}

            {pasoActual.categoria === 'ejercicios' && (
              <EjerciciosDeckStep
                ejercicios={pasoActual.ejercicios}
                onFinalizar={(respuestas) => {
                  onCompletarEjercicios(respuestas);
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
    </div>
  );
});
