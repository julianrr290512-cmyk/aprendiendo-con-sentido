import { memo } from 'react';
import type { FuenteContenido } from '@/types';
import { Badge, type BadgeVariant } from './Badge';

const ETIQUETAS: Record<FuenteContenido, string> = {
  api: 'Generado por IA',
  local: 'Contenido base',
};

const VARIANTES: Record<FuenteContenido, BadgeVariant> = {
  api: 'success',
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
          ? 'No se pudo conectar con la IA; se muestra contenido base incluido en la app.'
          : undefined
      }
    >
      {ETIQUETAS[fuente]}
    </Badge>
  );
});
