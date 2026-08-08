import { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SkeletonText, SkeletonBadge } from '@/components/ui/Skeleton';
import { FuenteContenidoBadge } from '@/components/ui/FuenteContenidoBadge';
import type { EstandaresResult } from '@/types';

interface EstandarSidePanelProps {
  estandares: EstandaresResult | undefined;
  cargando: boolean;
  className?: string;
}

export const EstandarSidePanel = memo(function EstandarSidePanel({
  estandares,
  cargando,
  className,
}: EstandarSidePanelProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card variant="formula" className="lg:sticky lg:top-24">
        <CardHeader className="flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Estándar Básico de Competencias</CardTitle>
          {cargando ? <SkeletonBadge /> : estandares && <FuenteContenidoBadge fuente={estandares.fuente} />}
        </CardHeader>
        <CardContent className="space-y-4">
          {cargando ? (
            <SkeletonText lineas={5} />
          ) : estandares && estandares.estandares.length > 0 ? (
            <>
              <p className="text-xs uppercase tracking-wide text-math-silver">
                Grupo de grados {estandares.grupoGrados}
              </p>
              <ul className="space-y-3">
                {estandares.estandares.map((est, i) => (
                  <li key={i} className="border-l-2 border-math-cyan/30 pl-3 text-sm text-math-silver">
                    <p className="text-xs font-semibold uppercase tracking-wide text-math-cyan">
                      {est.pensamiento}
                    </p>
                    {est.enunciado}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-math-silver">
              Sin estándares disponibles para este grado todavía.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});
