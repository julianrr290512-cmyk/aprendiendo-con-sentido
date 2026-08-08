import { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FaseFormalizacion, FuenteContenido } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FormulaCard } from '@/components/ui/FormulaCard';
import { FormulaAnimator } from '@/components/narrative/FormulaAnimator';
import { dividirFormulaEnTerminos } from '@/components/narrative/terminoFormula';
import { useNarrativeSound } from '@/components/narrative/narrativeSoundEngine';

interface FormalizacionProps {
  fase: FaseFormalizacion;
  prediccionEstudiante?: string;
  dba: string[];
  dbaFuente: FuenteContenido;
  onCompletar: (reflexion: string) => void;
}

export const Formalizacion = memo(function Formalizacion({
  fase,
  prediccionEstudiante,
  dba,
  dbaFuente,
  onCompletar,
}: FormalizacionProps) {
  const [reflexion, setReflexion] = useState('');
  const [formalizado, setFormalizado] = useState(false);
  const { reproducir } = useNarrativeSound();

  const formulaCentral = fase.formulasClave[0];
  const terminos = useMemo(
    () => (formulaCentral ? dividirFormulaEnTerminos(formulaCentral.latex) : undefined),
    [formulaCentral],
  );

  const confirmar = () => {
    if (!reflexion.trim()) return;
    setFormalizado(true);
    reproducir('logro');
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>{fase.titulo}</CardTitle>
        <AnimatePresence>
          {formalizado && (
            <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
              <Badge variant="success">Concepto formalizado ✓</Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <CardContent className="space-y-6">
        <p className="text-sm text-math-silver">{fase.instrucciones}</p>

        {dba.length > 0 && (
          <FormulaCard
            tipo="dba"
            titulo="Derecho Básico de Aprendizaje"
            contenido={dba.join(' ')}
            metadata={dbaFuente === 'local' ? 'Contenido base' : 'Contenido oficial MEN'}
          />
        )}

        <p className="text-sm text-math-white/90">{fase.resumen}</p>

        {terminos && (
          <div className="rounded-lg border border-math-cyan/10 bg-math-navy/40 py-6">
            <FormulaAnimator terminos={terminos} />
          </div>
        )}

        {prediccionEstudiante && (
          <div className="space-y-3 rounded-lg border border-math-gold/15 bg-math-gold/5 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-math-gold">Tu hipótesis</p>
              <p className="mt-1 text-sm text-math-white">{prediccionEstudiante}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-math-cyan">El concepto formal dice</p>
              <p className="mt-1 text-sm text-math-white">{fase.resumen}</p>
            </div>
            <p className="text-sm font-medium text-math-silver">
              ¿En qué coincidiste? ¿Qué puedes ajustar en tu comprensión?
            </p>
          </div>
        )}

        {!formalizado ? (
          <div className="space-y-2">
            <label htmlFor="reflexion-formalizacion" className="text-sm font-medium text-math-white">
              Escribe qué aprendiste
            </label>
            <textarea
              id="reflexion-formalizacion"
              value={reflexion}
              onChange={(evento) => setReflexion(evento.target.value)}
              rows={3}
              placeholder="Ajusté mi hipótesis porque..."
              className="w-full resize-none rounded-md border border-math-cyan/15 bg-math-midnight/80 px-3 py-2.5 text-sm text-math-white outline-none transition-colors placeholder:text-math-silver/40 focus:border-math-cyan/50"
            />
            <Button className="w-full" onClick={confirmar} disabled={!reflexion.trim()}>
              Confirmar aprendizaje
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={() => onCompletar(reflexion.trim())}>
            Ir a ejercicios
          </Button>
        )}
      </CardContent>
    </Card>
  );
});
