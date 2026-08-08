import { memo } from 'react';
import { motion } from 'framer-motion';
import type { Nivel } from '@/types';
import { cn } from '@/utils/cn';
import { CONFIG_PORTAL, type NivelTier } from './nivelPortalConfig';

interface NivelPortalProps {
  tier: NivelTier;
  nivel: Nivel | undefined;
  estado: 'idle' | 'entrando' | 'desvanecido';
  onEnter: (nivel: Nivel) => void;
  index: number;
}

export const NivelPortal = memo(function NivelPortal({ tier, nivel, estado, onEnter, index }: NivelPortalProps) {
  const config = CONFIG_PORTAL[tier];
  const disponible = Boolean(nivel);

  return (
    <motion.button
      type="button"
      disabled={!disponible}
      onClick={() => nivel && onEnter(nivel)}
      className={cn(
        'group relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl border p-8 text-center',
        disponible ? 'cursor-pointer' : 'cursor-not-allowed',
      )}
      style={{
        borderColor: disponible ? `${config.color}40` : 'rgba(100,116,139,0.2)',
        background: disponible
          ? `radial-gradient(circle at 50% 30%, ${config.color}1a, rgba(255,255,255,0.92) 70%)`
          : 'rgba(241,245,249,0.6)',
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={
        estado === 'desvanecido'
          ? { opacity: 0, scale: 0.92 }
          : estado === 'entrando'
            ? { opacity: 1, scale: 1.35, zIndex: 10 }
            : { opacity: disponible ? 1 : 0.4, y: 0, scale: 1 }
      }
      transition={{ duration: estado === 'entrando' ? 0.5 : 0.4, delay: estado === 'idle' ? index * 0.08 : 0, ease: 'easeOut' }}
      whileHover={disponible && estado === 'idle' ? { y: -6 } : undefined}
    >
      {/* Anillo de energia del portal: intensidad de pulso segun la dificultad. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-2xl"
        style={{ boxShadow: `inset 0 0 60px ${config.color}30` }}
        animate={
          disponible
            ? config.pulso === 'suave'
              ? { opacity: [0.5, 0.8, 0.5] }
              : config.pulso === 'medio'
                ? { opacity: [0.4, 0.9, 0.4], scale: [1, 1.02, 1] }
                : { opacity: [0.4, 1, 0.4], scale: [1, 1.05, 1] }
            : undefined
        }
        transition={{
          duration: config.pulso === 'suave' ? 3.5 : config.pulso === 'medio' ? 2.2 : 1.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div
        className="flex h-16 w-16 items-center justify-center rounded-full border-2 font-math text-2xl"
        style={{ borderColor: config.color, color: config.color }}
      >
        ∞
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold text-math-white">{config.etiqueta}</h3>
        {nivel && <p className="mt-0.5 text-xs text-math-silver">{nivel.nombre}</p>}
      </div>

      <p className="text-sm text-math-silver">{config.descripcion}</p>

      <div className="mt-1 flex flex-col gap-1 text-xs text-math-silver/80">
        <span>📝 {config.preguntas}</span>
        <span>⏱ {config.tiempoMin} min aprox.</span>
      </div>

      {!disponible && (
        <span className="mt-1 rounded-full border border-math-silver/20 px-3 py-1 text-[10px] uppercase tracking-wide text-math-silver/60">
          Próximamente
        </span>
      )}
    </motion.button>
  );
});
