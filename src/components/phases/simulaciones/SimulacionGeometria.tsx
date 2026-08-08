import { memo, useCallback, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { motion } from 'framer-motion';
import type { SimulacionGeometriaConfig } from '@/types';
import { cn } from '@/utils/cn';

const CONFIG_DEFECTO: SimulacionGeometriaConfig = {
  instrucciones: 'Coloca puntos, une dos con una línea o dibuja una circunferencia. Las medidas se calculan solas.',
};

type Herramienta = 'punto' | 'linea' | 'circulo';

interface Punto {
  id: string;
  x: number;
  y: number;
  etiqueta: string;
}

interface Linea {
  id: string;
  a: Punto;
  b: Punto;
  distancia: number;
}

interface Circulo {
  id: string;
  centro: Punto;
  radio: number;
}

const ANCHO = 420;
const ALTO = 280;
const ETIQUETAS = 'ABCDEFGHIJ';

function distancia(a: Punto, b: Punto): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function anguloEntre(a: Punto, vertice: Punto, b: Punto): number {
  const v1 = { x: a.x - vertice.x, y: a.y - vertice.y };
  const v2 = { x: b.x - vertice.x, y: b.y - vertice.y };
  const producto = v1.x * v2.x + v1.y * v2.y;
  const magnitudes = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (magnitudes === 0) return 0;
  return (Math.acos(Math.min(1, Math.max(-1, producto / magnitudes))) * 180) / Math.PI;
}

interface SimulacionGeometriaProps {
  config?: SimulacionGeometriaConfig;
  onAccion?: (accion: string) => void;
}

let idContador = 0;

export const SimulacionGeometria = memo(function SimulacionGeometria({
  config = CONFIG_DEFECTO,
  onAccion,
}: SimulacionGeometriaProps) {
  const [herramienta, setHerramienta] = useState<Herramienta>('punto');
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [circulos, setCirculos] = useState<Circulo[]>([]);
  const [pendiente, setPendiente] = useState<Punto | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const escalaCoordenadas = useCallback((evento: ReactMouseEvent<SVGSVGElement>): { x: number; y: number } => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((evento.clientX - rect.left) / rect.width) * ANCHO,
      y: ((evento.clientY - rect.top) / rect.height) * ALTO,
    };
  }, []);

  const manejarClick = (evento: ReactMouseEvent<SVGSVGElement>) => {
    const { x, y } = escalaCoordenadas(evento);
    const nuevoPunto: Punto = { id: `p${idContador++}`, x, y, etiqueta: ETIQUETAS[puntos.length % ETIQUETAS.length] ?? '?' };

    if (herramienta === 'punto') {
      setPuntos((prev) => [...prev, nuevoPunto]);
      onAccion?.('colocar-punto');
      return;
    }

    if (!pendiente) {
      setPendiente(nuevoPunto);
      setPuntos((prev) => [...prev, nuevoPunto]);
      onAccion?.(`${herramienta}-inicio`);
      return;
    }

    if (herramienta === 'linea') {
      setPuntos((prev) => [...prev, nuevoPunto]);
      setLineas((prev) => [...prev, { id: `l${idContador++}`, a: pendiente, b: nuevoPunto, distancia: distancia(pendiente, nuevoPunto) }]);
      onAccion?.('linea-completa');
    } else if (herramienta === 'circulo') {
      setCirculos((prev) => [...prev, { id: `c${idContador++}`, centro: pendiente, radio: distancia(pendiente, nuevoPunto) }]);
      onAccion?.('circulo-completo');
    }
    setPendiente(null);
  };

  const ultimoAngulo =
    herramienta === 'punto' && puntos.length >= 3
      ? anguloEntre(puntos[puntos.length - 3]!, puntos[puntos.length - 2]!, puntos[puntos.length - 1]!)
      : null;

  const limpiar = () => {
    setPuntos([]);
    setLineas([]);
    setCirculos([]);
    setPendiente(null);
    onAccion?.('limpiar');
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-math-silver">{config.instrucciones}</p>

      <div className="flex flex-wrap items-center gap-2">
        {(['punto', 'linea', 'circulo'] as Herramienta[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setHerramienta(t);
              setPendiente(null);
            }}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
              herramienta === t
                ? 'border-math-cyan/50 bg-math-cyan/15 text-math-cyan'
                : 'border-math-silver/20 text-math-silver hover:border-math-cyan/30',
            )}
          >
            {t === 'circulo' ? 'Circunferencia' : t}
          </button>
        ))}
        <button
          type="button"
          onClick={limpiar}
          className="ml-auto rounded-full border border-math-error/30 px-3 py-1.5 text-xs font-medium text-math-error hover:bg-math-error/10"
        >
          Limpiar
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        onClick={manejarClick}
        className="h-[220px] w-full cursor-crosshair rounded-lg border border-math-cyan/15 bg-math-navy/70"
      >
        {circulos.map((c) => (
          <circle key={c.id} cx={c.centro.x} cy={c.centro.y} r={c.radio} fill="rgba(217,119,6,0.08)" stroke="#d97706" strokeWidth={1.5} />
        ))}
        {lineas.map((l) => (
          <g key={l.id}>
            <line x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y} stroke="#0891b2" strokeWidth={2} />
            <text
              x={(l.a.x + l.b.x) / 2}
              y={(l.a.y + l.b.y) / 2 - 6}
              fill="#0891b2"
              fontSize={11}
              textAnchor="middle"
              className="font-mono"
            >
              {l.distancia.toFixed(0)}px
            </text>
          </g>
        ))}
        {puntos.map((p) => (
          <motion.g key={p.id} initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <circle cx={p.x} cy={p.y} r={4} fill="#0f172a" stroke="#ffffff" strokeWidth={2} />
            <text x={p.x + 8} y={p.y - 6} fill="#64748b" fontSize={11}>
              {p.etiqueta}
            </text>
          </motion.g>
        ))}
      </svg>

      <div className="flex flex-wrap gap-3 text-xs text-math-silver">
        {lineas.length === 0 && circulos.length === 0 && !ultimoAngulo && (
          <span>Aún no hay medidas: dibuja algo en el lienzo.</span>
        )}
        {lineas.map((l) => (
          <span key={l.id} className="rounded-full bg-math-cyan/10 px-2.5 py-1 text-math-cyan">
            {l.a.etiqueta}{l.b.etiqueta} = {l.distancia.toFixed(0)}px
          </span>
        ))}
        {circulos.map((c) => (
          <span key={c.id} className="rounded-full bg-math-gold/10 px-2.5 py-1 text-math-gold">
            radio {c.centro.etiqueta} = {c.radio.toFixed(0)}px
          </span>
        ))}
        {ultimoAngulo !== null && (
          <span className="rounded-full bg-math-success/10 px-2.5 py-1 text-math-success">
            ángulo ≈ {ultimoAngulo.toFixed(0)}°
          </span>
        )}
      </div>
    </div>
  );
});
