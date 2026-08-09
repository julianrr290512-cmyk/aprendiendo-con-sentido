import { memo, useState } from 'react';
import type { Ejercicio, RespuestaEjercicio } from '@/types';
import { EjercicioCard } from '@/components/exercises/EjercicioCard';
import { Button } from '@/components/ui/Button';

interface EjerciciosDeckStepProps {
  ejercicios: Ejercicio[];
  onFinalizar: (respuestas: RespuestaEjercicio[]) => void;
}

/**
 * Ultimo paso del deck continuo: los 5 ejercicios de la sesion (progresion de
 * taxonomia de Bloom, los ultimos de transferencia), luego "Finalizar".
 */
export const EjerciciosDeckStep = memo(function EjerciciosDeckStep({
  ejercicios,
  onFinalizar,
}: EjerciciosDeckStepProps) {
  const [respuestas, setRespuestas] = useState<RespuestaEjercicio[]>([]);

  const responderEjercicio = (ejercicioId: string, respuestaDada: string, esCorrecta: boolean) => {
    setRespuestas((prev) => [
      ...prev,
      { ejercicioId, respuestaDada, esCorrecta, tiempoRespuestaMs: 0, intentos: 1 },
    ]);
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {ejercicios.length === 0 && (
        <p className="text-center text-sm text-math-silver">
          No hay ejercicios disponibles para este tema todavia.
        </p>
      )}
      {ejercicios.map((ejercicio) => (
        <EjercicioCard
          key={ejercicio.id}
          ejercicio={ejercicio}
          onResponder={(respuestaDada, esCorrecta) =>
            responderEjercicio(ejercicio.id, respuestaDada, esCorrecta)
          }
        />
      ))}
      {ejercicios.length > 0 && respuestas.length >= ejercicios.length && (
        <Button className="w-full" onClick={() => onFinalizar(respuestas)}>
          Ver resultados
        </Button>
      )}
    </div>
  );
});
