import { memo, useCallback, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Area } from '@/types';
import { AreaIcon } from '@/components/icons/AreaIcon';
import { AREA_SIMBOLO, type AreaIconName } from '@/components/icons/areaSimbolos';
import { cn } from '@/utils/cn';

interface Particula {
  id: number;
  dx: number;
  dy: number;
  rotacion: number;
}

let particulaId = 0;

function generarExplosion(): Particula[] {
  return Array.from({ length: 8 }, () => {
    const angulo = Math.random() * Math.PI * 2;
    const distancia = 40 + Math.random() * 40;
    return {
      id: particulaId++,
      dx: Math.cos(angulo) * distancia,
      dy: Math.sin(angulo) * distancia,
      rotacion: (Math.random() - 0.5) * 180,
    };
  });
}

interface AreaCardProps {
  area: Area;
  index: number;
  estadoSeleccion: 'idle' | 'seleccionada' | 'desvanecida';
  onSelect: (area: Area) => void;
  onHoverPrefetch: () => void;
}

export const AreaCard = memo(function AreaCard({
  area,
  index,
  estadoSeleccion,
  onSelect,
  onHoverPrefetch,
}: AreaCardProps) {
  const [particulas, setParticulas] = useState<Particula[]>([]);
  const prefetchTimer = useRef<number | undefined>(undefined);
  const icono = (area.icono as AreaIconName) ?? 'sigma';

  const manejarHover = useCallback(() => {
    setParticulas(generarExplosion());
    prefetchTimer.current = window.setTimeout(onHoverPrefetch, 200);
  }, [onHoverPrefetch]);

  const manejarSalida = useCallback(() => {
    window.clearTimeout(prefetchTimer.current);
  }, []);

  const estiloAcento = useMemo(
    () => ({ '--acento': area.color }) as CSSProperties,
    [area.color],
  );

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(area)}
      onMouseEnter={manejarHover}
      onMouseLeave={manejarSalida}
      className={cn(
        'group relative flex flex-col items-start gap-3 overflow-visible rounded-lg border p-6 text-left',
        'border-[rgba(8,145,178,0.15)] bg-[rgba(255,255,255,0.85)] backdrop-blur-[20px]',
        'shadow-[0_4px_16px_rgba(15,23,42,0.08)] transition-colors duration-300',
      )}
      style={estiloAcento}
      initial={{ opacity: 0, y: 24 }}
      animate={
        estadoSeleccion === 'desvanecida'
          ? { opacity: 0, scale: 0.9, y: 0 }
          : estadoSeleccion === 'seleccionada'
            ? { opacity: 1, scale: 1.06, y: 0, zIndex: 10 }
            : { opacity: 1, scale: 1, y: 0 }
      }
      whileHover={estadoSeleccion === 'idle' ? { y: -6, borderColor: 'var(--acento)' } : undefined}
      transition={{ duration: 0.4, delay: estadoSeleccion === 'idle' ? index * 0.06 : 0, ease: 'easeOut' }}
    >
      {/* Explosion de particulas detras de la card al hacer hover */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-visible">
        <AnimatePresence>
          {particulas.map((p) => (
            <motion.span
              key={p.id}
              className="absolute font-math text-lg"
              style={{ color: area.color }}
              initial={{ opacity: 0.9, x: 0, y: 0, scale: 0.6, rotate: 0 }}
              animate={{ opacity: 0, x: p.dx, y: p.dy, scale: 1, rotate: p.rotacion }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              onAnimationComplete={() =>
                setParticulas((prev) => prev.filter((item) => item.id !== p.id))
              }
            >
              {AREA_SIMBOLO[icono]}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <div
        className="flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300"
        style={{ borderColor: `${area.color}55`, color: area.color, backgroundColor: `${area.color}15` }}
      >
        <AreaIcon nombre={icono} className="h-5 w-5" />
      </div>

      <h3 className="font-display text-lg font-semibold text-math-white">{area.nombre}</h3>
      <p className="text-sm text-math-silver">{area.descripcion}</p>

      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ backgroundColor: area.color }}
      />
    </motion.button>
  );
});
