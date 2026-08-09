import { memo, useMemo } from 'react';
import type { GraficaFuncion as GraficaFuncionData } from '@/types';
import { muestrearFuncion } from '@/utils/mathExpr';

interface GraficaFuncionProps {
  grafica: GraficaFuncionData;
  className?: string;
}

const ANCHO = 320;
const ALTO = 200;
const PADDING = 28;

/**
 * Graficador propio en SVG: sin dependencias externas. Muestrea la expresion
 * (evaluada de forma segura por mathExpr.ts) y dibuja ejes + curva escalados
 * al rango de datos.
 */
export const GraficaFuncion = memo(function GraficaFuncion({ grafica, className }: GraficaFuncionProps) {
  const puntos = useMemo(
    () => muestrearFuncion(grafica.expresion, grafica.rangoX),
    [grafica.expresion, grafica.rangoX],
  );

  const escalado = useMemo(() => {
    if (puntos.length === 0) return null;

    const xs = puntos.map((p) => p.x);
    const ys = puntos.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    let minY = Math.min(...ys, 0);
    let maxY = Math.max(...ys, 0);
    if (minY === maxY) {
      minY -= 1;
      maxY += 1;
    }

    const anchoUtil = ANCHO - PADDING * 2;
    const altoUtil = ALTO - PADDING * 2;
    const escalarX = (x: number) => PADDING + ((x - minX) / (maxX - minX || 1)) * anchoUtil;
    const escalarY = (y: number) => PADDING + altoUtil - ((y - minY) / (maxY - minY || 1)) * altoUtil;

    const puntosSvg = puntos.map((p) => `${escalarX(p.x).toFixed(1)},${escalarY(p.y).toFixed(1)}`).join(' ');
    const yCero = escalarY(0);
    const xCero = escalarX(0);

    return { puntosSvg, yCero, xCero, minX, maxX, minY, maxY };
  }, [puntos]);

  if (!escalado) {
    return (
      <p className="text-center text-sm text-math-silver">No fue posible graficar esta expresión.</p>
    );
  }

  return (
    <div className={className}>
      {grafica.titulo && (
        <p className="mb-2 text-center text-sm font-medium text-math-white">{grafica.titulo}</p>
      )}
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="w-full" role="img" aria-label={grafica.titulo ?? 'Gráfica de la función'}>
        {/* Ejes */}
        <line x1={PADDING} y1={escalado.yCero} x2={ANCHO - PADDING} y2={escalado.yCero} stroke="#334155" strokeWidth={1} />
        <line x1={escalado.xCero} y1={PADDING} x2={escalado.xCero} y2={ALTO - PADDING} stroke="#334155" strokeWidth={1} />

        {/* Curva */}
        <polyline points={escalado.puntosSvg} fill="none" stroke="#0891b2" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-math-silver/70">
        <span>{grafica.etiquetaX ?? 'x'}: [{escalado.minX.toFixed(1)}, {escalado.maxX.toFixed(1)}]</span>
        <span>{grafica.etiquetaY ?? 'y'}: [{escalado.minY.toFixed(1)}, {escalado.maxY.toFixed(1)}]</span>
      </div>
    </div>
  );
});
