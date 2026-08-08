import { memo } from 'react';
import type { FuenteContenido } from '@/types';
import { Badge, type BadgeVariant } from './Badge';

const ETIQUETAS: Record<FuenteContenido, string> = {
  api: 'Contenido oficial MEN',
  web: 'Contenido oficial MEN',
  local: 'Contenido base',
};

const VARIANTES: Record<FuenteContenido, BadgeVariant> = {
  api: 'success',
  web: 'success',
  local: 'default',
};

interface FuenteContenidoBadgeProps {
  fuente: FuenteContenido;
  className?: string;
}

export const FuenteContenidoBadge = memo(function FuenteContenidoBadge({
  fuente,
  className,
}: FuenteContenidoBadgeProps) {
  return (
    <Badge
      variant={VARIANTES[fuente]}
      className={className}
      title={
        fuente === 'local'
          ? 'No se pudo confirmar contenido en vivo del MEN; se muestra el set de datos local incluido en la app.'
          : undefined
      }
    >
      {ETIQUETAS[fuente]}
    </Badge>
  );
});
