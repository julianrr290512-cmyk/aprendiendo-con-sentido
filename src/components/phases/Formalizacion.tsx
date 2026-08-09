import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { FaseFormalizacion } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormulaCard } from '@/components/math/FormulaCard';
import { GraficaFuncion } from '@/components/math/GraficaFuncion';
import { FormulaAnimator } from '@/components/narrative/FormulaAnimator';
import { dividirFormulaEnTerminos } from '@/components/narrative/terminoFormula';

interface FormalizacionProps {
  fase: FaseFormalizacion;
  prediccionesEstudiante?: string[];
  onCompletar: () => void;
}

export const Formalizacion = memo(function Formalizacion({
  fase,
  prediccionesEstudiante,
  onCompletar,
}: FormalizacionProps) {
  const [formulaCentral, ...formulasSecundarias] = fase.formulasClave;
  const terminos = useMemo(
    () => (formulaCentral ? dividirFormulaEnTerminos(formulaCentral.latex) : undefined),
    [formulaCentral],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{fase.titulo}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <p className="text-sm text-math-white/90">{fase.resumen}</p>

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

        {fase.grafica && (
          <div className="rounded-lg border border-math-cyan/10 bg-math-navy/40 p-4">
            <GraficaFuncion grafica={fase.grafica} />
          </div>
        )}

        <div className="space-y-2 rounded-lg border border-math-gold/15 bg-math-gold/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-math-gold">Analogía</p>
          <p className="text-sm text-math-white">{fase.analogia}</p>
        </div>

        {prediccionesEstudiante && prediccionesEstudiante.length > 0 && (
          <div className="space-y-3 rounded-lg border border-math-cyan/15 bg-math-navy/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-math-cyan">
              Tus hipótesis vs. el concepto formal
            </p>
            {prediccionesEstudiante.map((prediccion, indice) => (
              <p key={indice} className="text-sm text-math-white">
                <span className="text-math-silver">{indice + 1}.</span> {prediccion}
              </p>
            ))}
            <p className="text-sm font-medium text-math-silver">
              ¿En qué coincidiste? ¿Qué puedes ajustar en tu comprensión?
            </p>
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Button className="w-full" onClick={onCompletar}>
            Ir a ejercicios
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
});
