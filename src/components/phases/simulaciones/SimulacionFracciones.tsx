import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { SimulacionFraccionesConfig } from '@/types';
import { cn } from '@/utils/cn';

const CONFIG_DEFECTO: SimulacionFraccionesConfig = { numeroPartes: 8, formaBase: 'barra' };

function mcd(a: number, b: number): number {
  return b === 0 ? a : mcd(b, a % b);
}

interface SimulacionFraccionesProps {
  config?: SimulacionFraccionesConfig;
  onAccion?: (accion: string) => void;
}

export const SimulacionFracciones = memo(function SimulacionFracciones({
  config = CONFIG_DEFECTO,
  onAccion,
}: SimulacionFraccionesProps) {
  const total = Math.max(config.numeroPartes, 2);
  const [coloreadas, setColoreadas] = useState<Set<number>>(new Set());
  const [fraccionEscrita, setFraccionEscrita] = useState('');

  const alternarParte = (indice: number) => {
    setColoreadas((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(indice)) siguiente.delete(indice);
      else siguiente.add(indice);
      return siguiente;
    });
    onAccion?.(`toggle-parte-${indice}`);
  };

  const fraccionSimplificada = useMemo(() => {
    const n = coloreadas.size;
    if (n === 0) return null;
    const divisor = mcd(n, total);
    return { num: n / divisor, den: total / divisor };
  }, [coloreadas, total]);

  const coincide =
    fraccionEscrita.trim().length > 0 &&
    fraccionSimplificada !== null &&
    fraccionEscrita.replace(/\s/g, '') === `${coloreadas.size}/${total}`;

  return (
    <div className="space-y-5">
      <p className="text-xs uppercase tracking-wide text-math-silver">
        Toca las partes para colorearlas ({total} partes iguales)
      </p>

      {config.formaBase === 'circulo' ? (
        <FiguraCirculo total={total} coloreadas={coloreadas} onToggle={alternarParte} />
      ) : (
        <FiguraBarra total={total} coloreadas={coloreadas} onToggle={alternarParte} />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-math-silver">
          Coloreaste {coloreadas.size} de {total}. Escribe la fracción:
        </span>
        <input
          type="text"
          value={fraccionEscrita}
          onChange={(evento) => setFraccionEscrita(evento.target.value)}
          placeholder={`ej. ${coloreadas.size || 1}/${total}`}
          className="w-28 rounded-md border border-math-cyan/15 bg-math-midnight/80 px-3 py-1.5 text-sm text-math-white outline-none focus:border-math-cyan/50"
        />
      </div>

      {fraccionEscrita.trim().length > 0 && (
        <p className={cn('text-sm', coincide ? 'text-math-success' : 'text-math-gold')}>
          {coincide
            ? `¡Correcto! ${coloreadas.size}/${total} coincide con lo que coloreaste.`
            : `Revisa: coloreaste ${coloreadas.size} de ${total} partes.`}
        </p>
      )}
    </div>
  );
});

interface FiguraProps {
  total: number;
  coloreadas: Set<number>;
  onToggle: (indice: number) => void;
}

const FiguraBarra = memo(function FiguraBarra({ total, coloreadas, onToggle }: FiguraProps) {
  return (
    <svg viewBox={`0 0 ${total * 40} 60`} className="h-16 w-full max-w-xl">
      {Array.from({ length: total }, (_, i) => (
        <motion.rect
          key={i}
          x={i * 40 + 1}
          y={1}
          width={38}
          height={58}
          rx={4}
          className="cursor-pointer"
          fill={coloreadas.has(i) ? '#0891b2' : 'rgba(226,232,240,0.7)'}
          stroke="rgba(8,145,178,0.35)"
          strokeWidth={1.5}
          whileTap={{ opacity: 0.7 }}
          onClick={() => onToggle(i)}
        />
      ))}
    </svg>
  );
});

const FiguraCirculo = memo(function FiguraCirculo({ total, coloreadas, onToggle }: FiguraProps) {
  const radio = 70;
  const cx = 80;
  const cy = 80;

  const sectores = Array.from({ length: total }, (_, i) => {
    const anguloInicio = (i / total) * Math.PI * 2 - Math.PI / 2;
    const anguloFin = ((i + 1) / total) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + radio * Math.cos(anguloInicio);
    const y1 = cy + radio * Math.sin(anguloInicio);
    const x2 = cx + radio * Math.cos(anguloFin);
    const y2 = cy + radio * Math.sin(anguloFin);
    const largeArc = anguloFin - anguloInicio > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radio} ${radio} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  });

  return (
    <svg viewBox="0 0 160 160" className="mx-auto h-40 w-40">
      {sectores.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          className="cursor-pointer"
          fill={coloreadas.has(i) ? '#0891b2' : 'rgba(226,232,240,0.7)'}
          stroke="#ffffff"
          strokeWidth={2}
          whileTap={{ opacity: 0.7 }}
          onClick={() => onToggle(i)}
        />
      ))}
    </svg>
  );
});
