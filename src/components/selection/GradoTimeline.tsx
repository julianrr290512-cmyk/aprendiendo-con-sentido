import { memo } from 'react';
import { motion } from 'framer-motion';
import { useProgressStore } from '@/store/progressStore';
import { cn } from '@/utils/cn';
import type { Grado } from '@/types';

const TODOS_LOS_GRADOS = Array.from({ length: 11 }, (_, i) => i + 1);

interface NodoGrado {
  numero: number;
  grado: Grado | undefined;
  disponible: boolean;
  completado: boolean;
}

interface GradoTimelineProps {
  grados: Grado[];
  colorAcento: string;
  onSelect: (grado: Grado) => void;
}

export const GradoTimeline = memo(function GradoTimeline({
  grados,
  colorAcento,
  onSelect,
}: GradoTimelineProps) {
  const progresoPorTema = useProgressStore((state) => state.progresoPorTema);

  const nodos: NodoGrado[] = TODOS_LOS_GRADOS.map((numero) => {
    const grado = grados.find((g) => g.numero === numero);
    const completado = grado
      ? grado.temasIds.some((temaId) => progresoPorTema[temaId]?.porcentajeAvance === 100)
      : false;
    return { numero, grado, disponible: Boolean(grado), completado };
  });

  return (
    <div className="-mx-6 overflow-x-auto scroll-smooth px-6 pb-2">
      <div className="flex min-w-max items-end gap-3 sm:min-w-0 sm:justify-between">
        {nodos.map((nodo, indice) => {
          const altura = 14 + Math.round((nodo.numero / 11) * 26);

          return (
            <motion.button
              key={nodo.numero}
              type="button"
              disabled={!nodo.disponible}
              onClick={() => nodo.grado && onSelect(nodo.grado)}
              className={cn(
                'group flex w-16 shrink-0 flex-col items-center gap-2 rounded-lg py-2 transition-colors',
                nodo.disponible ? 'cursor-pointer' : 'cursor-not-allowed opacity-35',
              )}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: nodo.disponible ? 1 : 0.35, x: 0 }}
              transition={{ duration: 0.35, delay: indice * 0.04, ease: 'easeOut' }}
              whileHover={nodo.disponible ? { y: -4 } : undefined}
              whileTap={nodo.disponible ? { scale: 0.95 } : undefined}
            >
              {/* Barra de "complejidad visual": crece con el numero de grado. */}
              <div className="flex h-8 items-end">
                <div
                  className="w-1.5 rounded-full bg-math-midnight transition-colors group-hover:opacity-80"
                  style={{ height: altura, backgroundColor: nodo.disponible ? colorAcento : undefined }}
                />
              </div>

              <div
                className={cn(
                  'relative flex h-11 w-11 items-center justify-center rounded-full border-2 font-mono text-sm font-semibold',
                  nodo.completado
                    ? 'border-math-gold bg-math-gold/15 text-math-gold shadow-[0_0_14px_rgba(217,119,6,0.3)]'
                    : 'border-math-silver/25 bg-math-midnight text-math-white',
                )}
                style={
                  nodo.disponible && !nodo.completado ? { borderColor: colorAcento, color: colorAcento } : undefined
                }
              >
                {nodo.numero}°
                {nodo.completado && (
                  <span
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-math-gold text-[10px] text-white"
                    aria-label="Grado completado"
                  >
                    ✓
                  </span>
                )}
              </div>

              <span className="text-[10px] text-math-silver">
                {nodo.disponible ? 'Grado' : 'Próx.'}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});
