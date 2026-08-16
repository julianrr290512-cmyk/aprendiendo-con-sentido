import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ExplicacionGeneradaResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormulaCard } from '@/components/math/FormulaCard';
import { GraficaFuncion } from '@/components/math/GraficaFuncion';
import { FormulaAnimator } from '@/components/narrative/FormulaAnimator';
import { dividirFormulaEnTerminos } from '@/components/narrative/terminoFormula';
import { EjercicioCard } from '@/components/exercises/EjercicioCard';
import { AnalogiaCard } from './AnalogiaCard';

interface ExplicacionViewProps {
  temaNombre: string;
  explicacion: ExplicacionGeneradaResult;
}

/**
 * Vista unica y continua de la sesion: resumen + formula principal animada +
 * formulas secundarias + graficas + 3 analogias, seguida de los 2 ejercicios
 * de practica (conceptual y procedimental). Sin deck ni pasos: todo el
 * contenido generado por la IA se muestra de una vez.
 */
export const ExplicacionView = memo(function ExplicacionView({
  temaNombre,
  explicacion,
}: ExplicacionViewProps) {
  const [formulaCentral, ...formulasSecundarias] = explicacion.formulasClave;
  const terminos = useMemo(
    () => (formulaCentral ? dividirFormulaEnTerminos(formulaCentral.latex) : undefined),
    [formulaCentral],
  );

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{temaNombre}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-math-white/90">{explicacion.resumen}</p>

          {terminos && (
            <div className="rounded-lg border border-math-cyan/10 bg-math-navy/40 py-6">
              <FormulaAnimator terminos={terminos} />
            </div>
          )}

          {formulasSecundarias.map((formula) => (
            <FormulaCard
              key={formula.id}
              nombre={formula.nombre}
              latex={formula.latex}
              explicacion={formula.explicacion}
            />
          ))}

          {explicacion.graficas.map((grafica, indice) => (
            <div key={indice} className="rounded-lg border border-math-cyan/10 bg-math-navy/40 p-4">
              <GraficaFuncion grafica={grafica} />
            </div>
          ))}

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-math-cyan">
              Analogías de la vida real
            </p>
            {explicacion.analogias.map((analogia, indice) => (
              <AnalogiaCard key={indice} analogia={analogia} indice={indice} />
            ))}
          </div>
        </CardContent>
      </Card>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h2 className="font-display text-lg font-semibold text-math-white">Ejercicios de práctica</h2>
        {explicacion.ejercicios.map((ejercicio) => (
          <EjercicioCard key={ejercicio.id} ejercicio={ejercicio} />
        ))}
      </motion.div>
    </div>
  );
});
