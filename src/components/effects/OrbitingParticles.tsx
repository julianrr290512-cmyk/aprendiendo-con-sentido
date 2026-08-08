import { memo, useEffect, useRef } from 'react';

const SIMBOLOS = ['∑', 'π', '√', '∞', '=', 'Δ'];

interface Orbita {
  simbolo: string;
  radio: number;
  angulo: number;
  velocidad: number;
  tamano: number;
}

interface OrbitingParticlesProps {
  className?: string;
  cantidad?: number;
}

/**
 * Simbolos matematicos orbitando en canvas alrededor del CTA de Inicio. Se usa canvas (no DOM)
 * porque son muchas particulas animadas cada frame; un <canvas> evita recalcular layout/estilo
 * por elemento y mantiene el costo en un unico draw call por frame.
 */
export const OrbitingParticles = memo(function OrbitingParticles({
  className,
  cantidad = 10,
}: OrbitingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let ancho = 0;
    let alto = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function redimensionar() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      ancho = rect.width;
      alto = rect.height;
      canvas.width = ancho * dpr;
      canvas.height = alto * dpr;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    redimensionar();
    window.addEventListener('resize', redimensionar);

    const orbitas: Orbita[] = Array.from({ length: cantidad }, (_, i) => ({
      simbolo: SIMBOLOS[i % SIMBOLOS.length] ?? '∑',
      radio: 70 + (i % 4) * 22,
      angulo: (i / cantidad) * Math.PI * 2,
      velocidad: 0.0025 + (i % 3) * 0.001,
      tamano: 12 + (i % 3) * 4,
    }));

    let frame = 0;
    let activo = true;

    function dibujar() {
      if (!ctx || !activo) return;
      ctx.clearRect(0, 0, ancho, alto);
      const cx = ancho / 2;
      const cy = alto / 2;

      for (const orbita of orbitas) {
        orbita.angulo += orbita.velocidad;
        const x = cx + Math.cos(orbita.angulo) * orbita.radio;
        const y = cy + Math.sin(orbita.angulo) * orbita.radio * 0.55;
        const profundidad = (Math.sin(orbita.angulo) + 1) / 2;

        ctx.globalAlpha = 0.25 + profundidad * 0.5;
        ctx.font = `${orbita.tamano}px "STIX Two Math", serif`;
        ctx.fillStyle = '#0891b2';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(orbita.simbolo, x, y);
      }
      ctx.globalAlpha = 1;

      frame = window.requestAnimationFrame(dibujar);
    }

    frame = window.requestAnimationFrame(dibujar);

    return () => {
      activo = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', redimensionar);
    };
  }, [cantidad]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  );
});
