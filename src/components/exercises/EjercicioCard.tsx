import { memo, useState } from 'react';
import type { Ejercicio } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { KatexRenderer } from '@/components/math/KatexRenderer';
import { cn } from '@/utils/cn';

interface EjercicioCardProps {
  ejercicio: Ejercicio;
  onResponder: (respuestaDada: string, esCorrecta: boolean) => void;
}

export const EjercicioCard = memo(function EjercicioCard({
  ejercicio,
  onResponder,
}: EjercicioCardProps) {
  const [respuesta, setRespuesta] = useState('');
  const [enviado, setEnviado] = useState(false);

  const evaluarOpcionMultiple = (opcionId: string, esCorrecta: boolean) => {
    if (enviado) return;
    setEnviado(true);
    setRespuesta(opcionId);
    onResponder(opcionId, esCorrecta);
  };

  const evaluarAbierta = () => {
    if (enviado || !respuesta.trim()) return;
    const esCorrecta =
      respuesta.trim().toLowerCase() === ejercicio.respuestaEsperada?.trim().toLowerCase();
    setEnviado(true);
    onResponder(respuesta, esCorrecta);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{ejercicio.enunciado}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {ejercicio.enunciadoLatex && (
          <div className="flex justify-center rounded-md bg-muted/50 py-4">
            <KatexRenderer latex={ejercicio.enunciadoLatex} display />
          </div>
        )}

        {ejercicio.tipo === 'opcion-multiple' && ejercicio.opciones && (
          <div className="grid gap-2">
            {ejercicio.opciones.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                disabled={enviado}
                onClick={() => evaluarOpcionMultiple(opcion.id, opcion.esCorrecta)}
                className={cn(
                  'rounded-md border border-input px-4 py-3 text-left text-sm transition-colors',
                  enviado && respuesta === opcion.id && opcion.esCorrecta && 'border-green-500 bg-green-500/10',
                  enviado && respuesta === opcion.id && !opcion.esCorrecta && 'border-destructive bg-destructive/10',
                  !enviado && 'hover:bg-accent',
                )}
              >
                {opcion.texto}
              </button>
            ))}
          </div>
        )}

        {(ejercicio.tipo === 'respuesta-abierta' || ejercicio.tipo === 'formula') && (
          <div className="flex gap-2">
            <input
              type="text"
              value={respuesta}
              disabled={enviado}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Escribe tu respuesta..."
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button onClick={evaluarAbierta} disabled={enviado}>
              Enviar
            </Button>
          </div>
        )}

        {enviado && (
          <p className="text-sm text-muted-foreground">
            {respuesta === ejercicio.respuestaEsperada ||
            ejercicio.opciones?.find((o) => o.id === respuesta)?.esCorrecta
              ? ejercicio.retroalimentacionCorrecta
              : ejercicio.retroalimentacionIncorrecta}
          </p>
        )}
      </CardContent>
    </Card>
  );
});
