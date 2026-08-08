import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { SkeletonText } from '@/components/ui/Skeleton';
import { FuenteContenidoBadge } from '@/components/ui/FuenteContenidoBadge';
import { Button } from '@/components/ui/Button';
import type { DBAResult, Tema } from '@/types';
import { cn } from '@/utils/cn';

interface TemaExpandableCardProps {
  tema: Tema;
  expandido: boolean;
  dba: DBAResult | undefined;
  cargandoDba: boolean;
  onToggle: () => void;
  onExplorar: () => void;
  index: number;
}

export const TemaExpandableCard = memo(function TemaExpandableCard({
  tema,
  expandido,
  dba,
  cargandoDba,
  onToggle,
  onExplorar,
  index,
}: TemaExpandableCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card variant={expandido ? 'elevated' : 'default'} className="overflow-hidden">
        <button
          type="button"
          onClick={onToggle}
          className="w-full text-left"
          aria-expanded={expandido}
        >
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>{tema.nombre}</CardTitle>
              <CardDescription className="mt-1">{tema.descripcion}</CardDescription>
            </div>
            <motion.span
              animate={{ rotate: expandido ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="mt-1 shrink-0 text-math-cyan"
              aria-hidden="true"
            >
              ▾
            </motion.span>
          </CardHeader>
        </button>

        <CardContent className={cn(!expandido && 'pb-4 pt-0')}>
          <p className="text-xs text-math-silver">Duración estimada: {tema.duracionEstimadaMin} min</p>

          <AnimatePresence initial={false}>
            {expandido && (
              <motion.div
                key="detalle"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-md border border-math-cyan/10 bg-math-navy/60 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-math-silver">
                      Derechos Básicos de Aprendizaje
                    </span>
                    {dba && <FuenteContenidoBadge fuente={dba.fuente} />}
                  </div>

                  {cargandoDba ? (
                    <SkeletonText lineas={3} />
                  ) : dba && dba.dba.length > 0 ? (
                    <ul className="space-y-1.5 text-sm text-math-silver">
                      {dba.dba.slice(0, 4).map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-math-cyan">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-math-silver">Sin DBA disponibles para este grado.</p>
                  )}
                </div>

                <Button size="sm" className="mt-4 w-full" onClick={onExplorar}>
                  Ver niveles
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
});
