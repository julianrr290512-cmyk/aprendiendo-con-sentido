import { memo, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import type { SimulacionAlgebraConfig, TerminoBalanza } from '@/types';
import { KatexRenderer } from '@/components/math/KatexRenderer';
import { cn } from '@/utils/cn';

const CONFIG_DEFECTO: SimulacionAlgebraConfig = {
  terminosDisponibles: [
    { id: 'vt', etiqueta: 'v · t (20)', simboloLatex: 'v \\cdot t', valor: 20 },
    { id: 'x0', etiqueta: 'x₀ (5)', simboloLatex: 'x_0', valor: 5 },
    { id: 'xt', etiqueta: 'x(t) (25)', simboloLatex: 'x(t)', valor: 25 },
  ],
};

type Lado = 'bandeja' | 'izquierda' | 'derecha';

interface SimulacionAlgebraProps {
  config?: SimulacionAlgebraConfig;
  onAccion?: (accion: string) => void;
}

export const SimulacionAlgebra = memo(function SimulacionAlgebra({
  config = CONFIG_DEFECTO,
  onAccion,
}: SimulacionAlgebraProps) {
  const [ubicaciones, setUbicaciones] = useState<Record<string, Lado>>(() =>
    Object.fromEntries(config.terminosDisponibles.map((t) => [t.id, 'bandeja' as Lado])),
  );
  const panIzquierdoRef = useRef<HTMLDivElement>(null);
  const panDerechoRef = useRef<HTMLDivElement>(null);

  const porLado = useMemo(() => {
    const grupos: Record<Lado, TerminoBalanza[]> = { bandeja: [], izquierda: [], derecha: [] };
    for (const termino of config.terminosDisponibles) {
      grupos[ubicaciones[termino.id] ?? 'bandeja'].push(termino);
    }
    return grupos;
  }, [config.terminosDisponibles, ubicaciones]);

  const sumaIzquierda = porLado.izquierda.reduce((s, t) => s + t.valor, 0);
  const sumaDerecha = porLado.derecha.reduce((s, t) => s + t.valor, 0);
  const diferencia = sumaIzquierda - sumaDerecha;
  const anguloInclinacion = Math.max(-12, Math.min(12, -diferencia * 1.5));
  const enEquilibrio = diferencia === 0 && (porLado.izquierda.length > 0 || porLado.derecha.length > 0);

  function soltar(id: string, info: PanInfo) {
    const punto = { x: info.point.x, y: info.point.y };
    const rectIzq = panIzquierdoRef.current?.getBoundingClientRect();
    const rectDer = panDerechoRef.current?.getBoundingClientRect();

    let destino: Lado = 'bandeja';
    if (rectIzq && dentroDe(punto, rectIzq)) destino = 'izquierda';
    else if (rectDer && dentroDe(punto, rectDer)) destino = 'derecha';

    setUbicaciones((prev) => ({ ...prev, [id]: destino }));
    onAccion?.(`mover-${id}-${destino}`);
  }

  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-wide text-math-silver">
        Arrastra cada termino a un lado de la balanza para equilibrarla
      </p>

      <div className="relative flex flex-col items-center pt-6">
        <motion.div
          className="flex w-full max-w-md items-end justify-between"
          animate={{ rotate: anguloInclinacion }}
          transition={{ type: 'spring', stiffness: 90, damping: 12 }}
          style={{ transformOrigin: 'center top' }}
        >
          <div
            ref={panIzquierdoRef}
            className={cn(
              'flex min-h-[92px] w-40 flex-wrap content-start gap-1.5 rounded-lg border-2 border-dashed p-2',
              enEquilibrio ? 'border-math-success/50 bg-math-success/10' : 'border-math-cyan/25 bg-math-navy/60',
            )}
          >
            {porLado.izquierda.map((t) => (
              <Chip key={t.id} termino={t} onDragEnd={(info) => soltar(t.id, info)} />
            ))}
          </div>

          <div className="mb-8 h-16 w-1 rounded-full bg-math-silver/30" />

          <div
            ref={panDerechoRef}
            className={cn(
              'flex min-h-[92px] w-40 flex-wrap content-start gap-1.5 rounded-lg border-2 border-dashed p-2',
              enEquilibrio ? 'border-math-success/50 bg-math-success/10' : 'border-math-cyan/25 bg-math-navy/60',
            )}
          >
            {porLado.derecha.map((t) => (
              <Chip key={t.id} termino={t} onDragEnd={(info) => soltar(t.id, info)} />
            ))}
          </div>
        </motion.div>

        <div className="mt-2 h-10 w-1.5 rounded-full bg-math-silver/40" />
        <div className="h-1.5 w-56 rounded-full bg-math-silver/40" />
      </div>

      <p className={cn('text-center text-sm font-medium', enEquilibrio ? 'text-math-success' : 'text-math-silver')}>
        {enEquilibrio
          ? '¡Equilibrada! Ambos lados suman lo mismo.'
          : `Izquierda: ${sumaIzquierda} · Derecha: ${sumaDerecha}`}
      </p>

      {porLado.bandeja.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 rounded-lg border border-math-cyan/10 bg-math-midnight/50 p-3">
          {porLado.bandeja.map((t) => (
            <Chip key={t.id} termino={t} onDragEnd={(info) => soltar(t.id, info)} />
          ))}
        </div>
      )}
    </div>
  );
});

function dentroDe(punto: { x: number; y: number }, rect: DOMRect): boolean {
  return punto.x >= rect.left && punto.x <= rect.right && punto.y >= rect.top && punto.y <= rect.bottom;
}

function Chip({ termino, onDragEnd }: { termino: TerminoBalanza; onDragEnd: (info: PanInfo) => void }) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragSnapToOrigin
      onDragEnd={(_evento, info) => onDragEnd(info)}
      whileDrag={{ scale: 1.1, zIndex: 20 }}
      aria-label={termino.etiqueta}
      className="flex cursor-grab items-center gap-1 rounded-full border border-math-gold/40 bg-math-gold/15 px-3 py-1.5 text-xs font-semibold text-math-gold active:cursor-grabbing"
    >
      <KatexRenderer latex={termino.simboloLatex} />
    </motion.div>
  );
}
