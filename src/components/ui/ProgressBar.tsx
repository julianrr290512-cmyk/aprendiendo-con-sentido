import { memo } from 'react';
import { motion } from 'framer-motion';
import type { FaseTipo } from '@/types';
import { cn } from '@/utils/cn';

export type FaseProgresoEstado = 'pendiente' | 'activa' | 'completada';

export interface FaseProgreso {
  tipo: FaseTipo;
  estado: FaseProgresoEstado;
}

interface ConfigFase {
  etiqueta: string;
  icono: string;
}

const FASES_CONFIG: Record<FaseTipo, ConfigFase> = {
  prediccion: { etiqueta: 'Predicción', icono: '🔮' },
  simulacion: { etiqueta: 'Simulación', icono: '🧪' },
  exploracion: { etiqueta: 'Exploración', icono: '🧭' },
  formalizacion: { etiqueta: 'Formalización', icono: '📐' },
};

const ESTILOS_CIRCULO: Record<FaseProgresoEstado, string> = {
  completada: 'border-math-cyan bg-math-cyan/15 text-math-cyan',
  activa: 'border-math-gold bg-math-gold/15 text-math-gold shadow-[0_0_16px_rgba(217,119,6,0.3)]',
  pendiente: 'border-math-silver/30 bg-math-midnight text-math-silver/60',
};

const ETIQUETAS_ESTADO: Record<FaseProgresoEstado, string> = {
  completada: 'Completada',
  activa: 'En curso',
  pendiente: 'Pendiente',
};

interface ProgressBarProps {
  fases: FaseProgreso[];
  className?: string;
}

/**
 * Barra de progreso segmentada por las 4 fases del ciclo POE (Prediccion, Simulacion,
 * Exploracion, Formalizacion), con relleno cyan->gold entre segmentos completados,
 * porcentaje flotante sobre la fase activa y tooltip por segmento al hover.
 */
export const ProgressBar = memo(function ProgressBar({ fases, className }: ProgressBarProps) {
  const completadas = fases.filter((fase) => fase.estado === 'completada').length;
  const porcentaje = fases.length ? Math.round((completadas / fases.length) * 100) : 0;
  const indiceActiva = fases.findIndex((fase) => fase.estado === 'activa');

  return (
    <div className={cn('relative w-full pt-7', className)}>
      {indiceActiva !== -1 && fases.length > 1 && (
        <motion.div
          className="absolute -top-1 -translate-x-1/2 rounded-full border border-math-gold/25 bg-math-midnight px-2 py-0.5 font-mono text-xs font-semibold text-math-gold shadow-[0_2px_10px_rgba(217,119,6,0.25)]"
          style={{ left: `${(indiceActiva / (fases.length - 1)) * 100}%` }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {porcentaje}%
        </motion.div>
      )}

      <div className="flex items-center">
        {fases.map((fase, indice) => {
          const config = FASES_CONFIG[fase.tipo];
          const esUltima = indice === fases.length - 1;

          return (
            <div key={fase.tipo} className={cn('flex items-center', !esUltima && 'flex-1')}>
              <div className="group relative flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 text-base transition-colors duration-300',
                    ESTILOS_CIRCULO[fase.estado],
                  )}
                  aria-label={`${config.etiqueta}: ${ETIQUETAS_ESTADO[fase.estado]}`}
                >
                  <span aria-hidden="true">{config.icono}</span>
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wide text-math-silver">
                  {config.etiqueta}
                </span>

                <div
                  role="tooltip"
                  className="pointer-events-none absolute -top-10 z-10 whitespace-nowrap rounded-md border border-math-cyan/15 bg-math-midnight px-2 py-1 text-xs text-math-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
                >
                  {config.etiqueta} · {ETIQUETAS_ESTADO[fase.estado]}
                </div>
              </div>

              {!esUltima && (
                <div className="mx-1 h-1 flex-1 overflow-hidden rounded-full bg-math-midnight">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-math-cyan to-math-gold"
                    initial={false}
                    animate={{ width: fase.estado === 'completada' ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
