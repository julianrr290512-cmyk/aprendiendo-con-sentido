import { memo, useState } from 'react';
import type { Ejercicio, NivelBloom } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { KatexRenderer } from '@/components/math/KatexRenderer';
import { cn } from '@/utils/cn';

interface EjercicioCardProps {
  ejercicio: Ejercicio;
  onResponder: (respuestaDada: string, esCorrecta: boolean) => void;
}

const ETIQUETA_BLOOM: Record<NivelBloom, string> = {
  comprender: 'Comprender',
  aplicar: 'Aplicar',
  analizar: 'Analizar',
  evaluar: 'Evaluar',
  crear: 'Crear',
};

export const EjercicioCard = memo(function EjercicioCard({
  ejercicio,
  onResponder,
}: EjercicioCardProps) {
  const [respuesta, setRespuesta] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [esCorrecta, setEsCorrecta] = useState(false);

  const evaluarOpcionMultiple = (opcionId: string, correcta: boolean) => {
    if (enviado) return;
    setEnviado(true);
    setRespuesta(opcionId);
    setEsCorrecta(correcta);
    onResponder(opcionId, correcta);
  };

  const evaluarAbierta = () => {
    if (enviado || !respuesta.trim()) return;
    // Sin respuesta esperada (preguntas abiertas de analisis/evaluacion/creacion):
    // se acredita por participacion, ya que no hay una unica respuesta correcta.
    const correcta = ejercicio.respuestaEsperada
      ? respuesta.trim().toLowerCase() === ejercicio.respuestaEsperada.trim().toLowerCase()
      : true;
    setEnviado(true);
    setEsCorrecta(correcta);
    onResponder(respuesta, correcta);
  };

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="cyan">{ETIQUETA_BLOOM[ejercicio.nivelBloom]}</Badge>
          {ejercicio.esTransferencia && <Badge variant="gold">Transferencia</Badge>}
        </div>
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

        {ejercicio.tipo === 'formula' && (
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

        {ejercicio.tipo === 'respuesta-abierta' && (
          <div className="space-y-2">
            <textarea
              value={respuesta}
              disabled={enviado}
              onChange={(e) => setRespuesta(e.target.value)}
              rows={4}
              placeholder="Escribe tu respuesta y tu razonamiento..."
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button className="w-full" onClick={evaluarAbierta} disabled={enviado}>
              Enviar
            </Button>
          </div>
        )}

        {enviado && (
          <p className="text-sm text-muted-foreground">
            {esCorrecta ? ejercicio.retroalimentacionCorrecta : ejercicio.retroalimentacionIncorrecta}
          </p>
        )}
      </CardContent>
    </Card>
  );
});
