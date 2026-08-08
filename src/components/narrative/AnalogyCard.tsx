import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { AreaId } from '@/types';
import { ANALOGIAS_PRESET, type Analogia } from './analogiasPreset';
import { cn } from '@/utils/cn';

interface AnalogyCardProps {
  analogia?: Analogia;
  areaId?: AreaId;
  className?: string;
}

/**
 * Split screen "concepto matematico | vida real". La imagen de la mitad real
 * viene de Unsplash Source (sin API key); si la carga falla, se degrada a un
 * placeholder con el icono de la analogia para no dejar un hueco vacio.
 */
export const AnalogyCard = memo(function AnalogyCard({ analogia, areaId, className }: AnalogyCardProps) {
  const datos = analogia ?? ANALOGIAS_PRESET[areaId ?? 'matematicas'];
  const [imagenFallo, setImagenFallo] = useState(false);

  const urlImagen = useMemo(
    () => `https://source.unsplash.com/800x400/?mathematics,${encodeURIComponent(datos.keywordImagen)}`,
    [datos.keywordImagen],
  );

  return (
    <div
      className={cn(
        'relative grid overflow-hidden rounded-xl border border-math-cyan/15 sm:grid-cols-2',
        className,
      )}
    >
      <motion.div
        className="flex flex-col justify-center gap-3 bg-[rgba(255,255,255,0.9)] p-6"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-4xl" aria-hidden="true">
          {datos.icono}
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-math-cyan">Concepto matemático</p>
        <h3 className="font-display text-xl font-semibold text-math-white">{datos.tituloConcepto}</h3>
        <p className="text-sm text-math-silver">{datos.descripcionConcepto}</p>
      </motion.div>

      {/*
        Panel de foto con scrim: intencionalmente oscuro sin importar el tema de la app
        (patron estandar de overlay-sobre-imagen para legibilidad), por eso no usa los
        tokens math-* aqui.
      */}
      <motion.div
        className="relative flex min-h-[220px] flex-col justify-end gap-1 p-6 text-white"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {!imagenFallo ? (
          <img
            src={urlImagen}
            alt={datos.tituloReal}
            onError={() => setImagenFallo(true)}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-6xl"
            style={{ background: 'linear-gradient(135deg, rgba(8,145,178,0.35), rgba(217,119,6,0.3))' }}
            aria-hidden="true"
          >
            {datos.icono}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

        <p className="relative text-xs font-semibold uppercase tracking-wide text-[#ffd60a]">Vida real</p>
        <h3 className="relative font-display text-xl font-semibold">{datos.tituloReal}</h3>
        <p className="relative text-sm text-white/90">{datos.descripcionReal}</p>
      </motion.div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-math-cyan/40 bg-math-navy text-math-cyan sm:flex"
      >
        ↔
      </span>
    </div>
  );
});
