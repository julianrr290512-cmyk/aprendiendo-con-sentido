import { memo, useCallback, useRef, useState } from 'react';
import type { FaseSimulacion, SimulacionTelemetria } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { KatexRenderer } from '@/components/math/KatexRenderer';
import { SimulacionFracciones } from './simulaciones/SimulacionFracciones';
import { SimulacionAlgebra } from './simulaciones/SimulacionAlgebra';
import { SimulacionGeometria } from './simulaciones/SimulacionGeometria';
import { SimulacionEstadistica } from './simulaciones/SimulacionEstadistica';

interface SimulacionProps {
  fase: FaseSimulacion;
  onCompletar: (telemetria: SimulacionTelemetria) => void;
}

export const Simulacion = memo(function Simulacion({ fase, onCompletar }: SimulacionProps) {
  const inicioRef = useRef(Date.now());
  const [acciones, setAcciones] = useState<string[]>([]);

  const registrarAccion = useCallback((accion: string) => {
    setAcciones((prev) => [...prev, accion]);
  }, []);

  const continuar = useCallback(() => {
    onCompletar({
      nivelId: fase.nivelId,
      categoria: fase.categoria,
      tiempoMs: Date.now() - inicioRef.current,
      intentos: acciones.length,
      acciones,
    });
  }, [acciones, fase.categoria, fase.nivelId, onCompletar]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{fase.titulo}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-math-silver">{fase.instrucciones}</p>

        {fase.formulaLatex && (
          <div className="flex justify-center rounded-md bg-math-navy/50 py-5">
            <KatexRenderer latex={fase.formulaLatex} display />
          </div>
        )}

        {fase.categoria === 'fracciones' && (
          <SimulacionFracciones config={fase.configFracciones} onAccion={registrarAccion} />
        )}
        {fase.categoria === 'algebra' && (
          <SimulacionAlgebra config={fase.configAlgebra} onAccion={registrarAccion} />
        )}
        {fase.categoria === 'geometria' && (
          <SimulacionGeometria config={fase.configGeometria} onAccion={registrarAccion} />
        )}
        {fase.categoria === 'estadistica' && (
          <SimulacionEstadistica config={fase.configEstadistica} onAccion={registrarAccion} />
        )}

        <Button className="w-full" onClick={continuar}>
          Continuar
        </Button>
      </CardContent>
    </Card>
  );
});
