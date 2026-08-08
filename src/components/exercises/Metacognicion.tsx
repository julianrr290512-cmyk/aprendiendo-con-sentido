import { memo, useState } from 'react';
import type { MetacognicionRespuesta } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface MetacognicionProps {
  preguntas: string[];
  onCompletar: (respuestas: MetacognicionRespuesta[]) => void;
}

const NIVELES_CONFIANZA = [1, 2, 3, 4, 5] as const;

export const Metacognicion = memo(function Metacognicion({
  preguntas,
  onCompletar,
}: MetacognicionProps) {
  const [respuestas, setRespuestas] = useState<Record<number, MetacognicionRespuesta>>({});

  const actualizar = (index: number, campo: 'respuesta' | 'nivelConfianza', valor: string | number) => {
    setRespuestas((prev) => ({
      ...prev,
      [index]: {
        pregunta: preguntas[index] ?? '',
        respuesta: campo === 'respuesta' ? String(valor) : (prev[index]?.respuesta ?? ''),
        nivelConfianza:
          campo === 'nivelConfianza'
            ? (Number(valor) as MetacognicionRespuesta['nivelConfianza'])
            : (prev[index]?.nivelConfianza ?? 3),
      },
    }));
  };

  const completo = preguntas.every((_, index) => respuestas[index]?.respuesta.trim());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reflexion sobre tu aprendizaje</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {preguntas.map((pregunta, index) => (
          <div key={pregunta} className="space-y-2">
            <p className="text-sm font-medium">{pregunta}</p>
            <textarea
              value={respuestas[index]?.respuesta ?? ''}
              onChange={(e) => actualizar(index, 'respuesta', e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={2}
            />
            <div className="flex items-center gap-1">
              <span className="mr-2 text-xs text-muted-foreground">Confianza:</span>
              {NIVELES_CONFIANZA.map((nivel) => (
                <button
                  key={nivel}
                  type="button"
                  onClick={() => actualizar(index, 'nivelConfianza', nivel)}
                  className={cn(
                    'h-7 w-7 rounded-full border border-input text-xs',
                    respuestas[index]?.nivelConfianza === nivel && 'bg-primary text-primary-foreground',
                  )}
                >
                  {nivel}
                </button>
              ))}
            </div>
          </div>
        ))}

        <Button
          disabled={!completo}
          onClick={() => onCompletar(Object.values(respuestas))}
        >
          Finalizar reflexion
        </Button>
      </CardContent>
    </Card>
  );
});
