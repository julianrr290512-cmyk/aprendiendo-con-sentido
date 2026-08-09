import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { AreaId } from '@/types';
import { temaSugerenciasFallback } from '@/data/temaSugerencias';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { slugify } from '@/utils/slugify';

interface BuscadorTemaProps {
  areaId: AreaId;
  onSeleccionar: (temaNombre: string) => void;
}

/**
 * Buscador de tema con autosugerencias (semillas curadas por area) y texto
 * libre siempre permitido: el docente puede escribir cualquier tema dentro
 * del area, no esta limitado a la lista. Sin distincion por grado: el nivel
 * objetivo de toda la app es fijo (colegio de desempeño superior).
 */
export const BuscadorTema = memo(function BuscadorTema({ areaId, onSeleccionar }: BuscadorTemaProps) {
  const [busqueda, setBusqueda] = useState('');
  const busquedaDebounced = useDebouncedValue(busqueda, 200);

  const sugerenciasBase = useMemo(
    () => temaSugerenciasFallback.filter((sugerencia) => sugerencia.areaId === areaId),
    [areaId],
  );

  const sugerenciasFiltradas = useMemo(() => {
    const termino = slugify(busquedaDebounced);
    if (!termino) return sugerenciasBase;
    return sugerenciasBase.filter((s) => slugify(s.texto).includes(termino));
  }, [sugerenciasBase, busquedaDebounced]);

  const textoLibreValido = busqueda.trim().length >= 3;
  const coincideExacto = sugerenciasFiltradas.some(
    (s) => slugify(s.texto) === slugify(busqueda.trim()),
  );

  return (
    <div className="space-y-3">
      <input
        type="search"
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
        placeholder="Busca un tema o escribe el tuyo (ej. Factorización por agrupación)..."
        className="w-full rounded-lg border border-math-cyan/15 bg-math-midnight/80 px-4 py-2.5 text-sm text-math-white placeholder:text-math-silver/50 outline-none transition-colors focus:border-math-cyan/50"
      />

      <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
        {textoLibreValido && !coincideExacto && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => onSeleccionar(busqueda.trim())}
            className="flex w-full items-center gap-2 rounded-lg border border-math-gold/30 bg-math-gold/5 px-4 py-3 text-left text-sm text-math-white transition-colors hover:border-math-gold/60"
          >
            <span aria-hidden="true">✏️</span>
            Usar «{busqueda.trim()}» como tema
          </motion.button>
        )}

        {sugerenciasFiltradas.map((sugerencia, indice) => (
          <motion.button
            key={sugerencia.texto}
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: indice * 0.03 }}
            onClick={() => onSeleccionar(sugerencia.texto)}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-math-cyan/10 bg-math-navy/40 px-4 py-3 text-left text-sm text-math-white transition-colors hover:border-math-cyan/40"
          >
            <span>{sugerencia.texto}</span>
          </motion.button>
        ))}

        {sugerenciasFiltradas.length === 0 && !textoLibreValido && (
          <p className="rounded-lg border border-math-cyan/10 bg-math-midnight/60 p-4 text-center text-sm text-math-silver">
            Escribe al menos 3 letras para buscar o crear un tema.
          </p>
        )}
      </div>
    </div>
  );
});
