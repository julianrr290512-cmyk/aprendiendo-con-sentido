import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { SimulacionEstadisticaConfig } from '@/types';
import { cn } from '@/utils/cn';

const DATASET_DEFECTO: SimulacionEstadisticaConfig = {
  etiquetaDataset: 'Precipitación mensual en Medellín',
  unidad: 'mm',
  categorias: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  valores: [70, 90, 130, 160, 180, 120, 95, 110, 150, 190, 170, 100],
};

type Estadistico = 'media' | 'mediana' | 'moda';

function calcularMedia(valores: number[]): number {
  return valores.reduce((suma, v) => suma + v, 0) / valores.length;
}

function calcularMediana(valores: number[]): number {
  const ordenados = [...valores].sort((a, b) => a - b);
  const mitad = Math.floor(ordenados.length / 2);
  return ordenados.length % 2 === 0
    ? (ordenados[mitad - 1]! + ordenados[mitad]!) / 2
    : ordenados[mitad]!;
}

function calcularModa(valores: number[]): number {
  const conteo = new Map<number, number>();
  for (const v of valores) conteo.set(v, (conteo.get(v) ?? 0) + 1);
  let moda = valores[0] ?? 0;
  let maxConteo = 0;
  for (const [valor, cuenta] of conteo) {
    if (cuenta > maxConteo) {
      maxConteo = cuenta;
      moda = valor;
    }
  }
  return moda;
}

const ETIQUETAS_ESTADISTICO: Record<Estadistico, string> = {
  media: 'Media',
  mediana: 'Mediana',
  moda: 'Moda',
};

interface SimulacionEstadisticaProps {
  config?: SimulacionEstadisticaConfig;
  onAccion?: (accion: string) => void;
}

const ALTO_GRAFICA = 180;

export const SimulacionEstadistica = memo(function SimulacionEstadistica({
  config = DATASET_DEFECTO,
  onAccion,
}: SimulacionEstadisticaProps) {
  const [estadisticoActivo, setEstadisticoActivo] = useState<Estadistico | null>(null);

  const { media, mediana, moda, maximo } = useMemo(
    () => ({
      media: calcularMedia(config.valores),
      mediana: calcularMediana(config.valores),
      moda: calcularModa(config.valores),
      maximo: Math.max(...config.valores, 1),
    }),
    [config.valores],
  );

  const valorActivo = estadisticoActivo === 'media' ? media : estadisticoActivo === 'mediana' ? mediana : estadisticoActivo === 'moda' ? moda : null;

  const alternar = (estadistico: Estadistico) => {
    setEstadisticoActivo((prev) => (prev === estadistico ? null : estadistico));
    onAccion?.(`toggle-${estadistico}`);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-wide text-math-silver">
        {config.etiquetaDataset} ({config.unidad})
      </p>

      <div className="relative rounded-lg border border-math-cyan/10 bg-math-navy/60 p-4">
        {/* Lineas guia horizontales (gridlines): un paso fuera de la superficie, finas, solidas. */}
        <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-col justify-between" style={{ height: ALTO_GRAFICA }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-px w-full bg-math-silver/10" />
          ))}
        </div>

        {estadisticoActivo && valorActivo !== null && (
          <motion.div
            className="pointer-events-none absolute inset-x-4 z-10 flex items-center gap-2"
            style={{ bottom: `calc(1rem + ${(valorActivo / maximo) * ALTO_GRAFICA}px)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="h-0.5 w-full border-t-2 border-dashed border-math-gold" />
            <span className="absolute right-0 -top-5 whitespace-nowrap rounded bg-math-gold/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-math-gold">
              {ETIQUETAS_ESTADISTICO[estadisticoActivo]}: {valorActivo.toFixed(1)}
            </span>
          </motion.div>
        )}

        <div className="relative z-0 flex items-end justify-between gap-1.5" style={{ height: ALTO_GRAFICA }}>
          {config.categorias.map((categoria, indice) => {
            const valor = config.valores[indice] ?? 0;
            const alturaPx = Math.max((valor / maximo) * ALTO_GRAFICA, 3);
            return (
              <div key={categoria} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="font-mono text-[10px] text-math-silver">{valor}</span>
                <motion.div
                  className="w-full max-w-6 rounded-t-[4px] bg-math-cyan"
                  initial={{ height: 0 }}
                  animate={{ height: alturaPx }}
                  transition={{ duration: 0.4, delay: indice * 0.03, ease: 'easeOut' }}
                />
                <span className="text-[10px] text-math-silver">{categoria}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(ETIQUETAS_ESTADISTICO) as Estadistico[]).map((estadistico) => (
          <button
            key={estadistico}
            type="button"
            onClick={() => alternar(estadistico)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              estadisticoActivo === estadistico
                ? 'border-math-gold/50 bg-math-gold/15 text-math-gold'
                : 'border-math-cyan/20 text-math-silver hover:border-math-cyan/40 hover:text-math-cyan',
            )}
          >
            {ETIQUETAS_ESTADISTICO[estadistico]}
          </button>
        ))}
      </div>
    </div>
  );
});
