import { memo, useEffect, useMemo } from 'react';
import type { MotionValue } from 'framer-motion';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const SIMBOLOS = ['∑', '∫', 'π', '√', '∞', 'Δ', 'θ', '≈', 'x²', 'f(x)'];

interface SimboloFlotante {
  id: number;
  simbolo: string;
  top: string;
  left: string;
  duracion: number;
  retraso: number;
  escala: number;
  profundidad: number;
}

function generarSimbolos(cantidad: number): SimboloFlotante[] {
  return Array.from({ length: cantidad }, (_, id) => ({
    id,
    simbolo: SIMBOLOS[id % SIMBOLOS.length] ?? '∑',
    top: `${Math.round((id * 37) % 100)}%`,
    left: `${Math.round((id * 53) % 100)}%`,
    duracion: 5 + (id % 4),
    retraso: (id % 5) * 0.4,
    escala: 0.8 + ((id % 3) * 0.2),
    // Simbolos "mas cerca" de la camara (profundidad alta) se mueven mas con el parallax.
    profundidad: 0.4 + ((id % 5) * 0.15),
  }));
}

interface FloatingSymbolProps {
  item: SimboloFlotante;
  parallaxX: MotionValue<number>;
  parallaxY: MotionValue<number>;
  parallax: boolean;
}

/** Componente propio para poder usar useTransform de forma incondicional por simbolo. */
const FloatingSymbol = memo(function FloatingSymbol({
  item,
  parallaxX,
  parallaxY,
  parallax,
}: FloatingSymbolProps) {
  const x = useTransform(parallaxX, (v) => v * item.profundidad * 18);
  const y = useTransform(parallaxY, (v) => v * item.profundidad * 18);

  return (
    <motion.div
      className="absolute"
      style={{ top: item.top, left: item.left, x: parallax ? x : 0, y: parallax ? y : 0 }}
    >
      <motion.span
        className="block font-math text-3xl text-primary/[0.14] select-none"
        style={{ scale: item.escala }}
        animate={{ y: [0, -20, 0] }}
        transition={{
          duration: item.duracion,
          delay: item.retraso,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {item.simbolo}
      </motion.span>
    </motion.div>
  );
});

interface MathBackgroundProps {
  cantidad?: number;
  className?: string;
  /** Desplaza sutilmente los simbolos con el mouse. Se mantiene activo por defecto: es la
   *  misma instancia persistente que se ve en todas las paginas, y el efecto es discreto. */
  parallax?: boolean;
}

export const MathBackground = memo(function MathBackground({
  cantidad = 12,
  className,
  parallax = true,
}: MathBackgroundProps) {
  const simbolos = useMemo(() => generarSimbolos(cantidad), [cantidad]);

  const puntero = useMotionValue({ x: 0, y: 0 });
  const parallaxX = useSpring(useTransform(puntero, (p: { x: number; y: number }) => p.x), {
    stiffness: 40,
    damping: 20,
  });
  const parallaxY = useSpring(useTransform(puntero, (p: { x: number; y: number }) => p.y), {
    stiffness: 40,
    damping: 20,
  });

  useEffect(() => {
    if (!parallax) return;

    function manejarMovimiento(evento: PointerEvent) {
      const ancho = window.innerWidth || 1;
      const alto = window.innerHeight || 1;
      puntero.set({
        x: (evento.clientX / ancho - 0.5) * 2,
        y: (evento.clientY / alto - 0.5) * 2,
      });
    }

    window.addEventListener('pointermove', manejarMovimiento, { passive: true });
    return () => window.removeEventListener('pointermove', manejarMovimiento);
  }, [parallax, puntero]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`}
    >
      {simbolos.map((item) => (
        <FloatingSymbol
          key={item.id}
          item={item}
          parallaxX={parallaxX}
          parallaxY={parallaxY}
          parallax={parallax}
        />
      ))}
    </div>
  );
});
