import { memo, useState } from 'react';
import type { Ejercicio, MapaTransferenciaItem, MetacognicionRespuesta, RespuestaEjercicio } from '@/types';
import { EjercicioCard } from '@/components/exercises/EjercicioCard';
import { MapaTransferencia } from '@/components/exercises/MapaTransferencia';
import { Metacognicion } from '@/components/exercises/Metacognicion';

interface EjerciciosDeckStepProps {
  ejercicios: Ejercicio[];
  mapaTransferencia: MapaTransferenciaItem[];
  preguntasMetacognicion: string[];
  onFinalizar: (respuestas: RespuestaEjercicio[], metacognicion: MetacognicionRespuesta[]) => void;
}

/**
 * Ultimo paso del deck continuo: ejercicios -> mapa de transferencia ->
 * metacognicion, con su propia mini-etapa interna (igual que antes tenia
 * como pagina propia en Ejercicios.tsx), pero ahora recibe los datos ya
 * listos por props en vez de leerlos de router/store directamente.
 */
export const EjerciciosDeckStep = memo(function EjerciciosDeckStep({
  ejercicios,
  mapaTransferencia,
  preguntasMetacognicion,
  onFinalizar,
}: EjerciciosDeckStepProps) {
  const [respuestas, setRespuestas] = useState<RespuestaEjercicio[]>([]);
  const [etapa, setEtapa] = useState<'ejercicios' | 'transferencia' | 'metacognicion'>('ejercicios');

  const responderEjercicio = (ejercicioId: string, respuestaDada: string, esCorrecta: boolean) => {
    setRespuestas((prev) => [
      ...prev,
      { ejercicioId, respuestaDada, esCorrecta, tiempoRespuestaMs: 0, intentos: 1 },
    ]);
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {etapa === 'ejercicios' && (
        <div className="space-y-6">
          {ejercicios.length === 0 && (
            <p className="text-center text-sm text-math-silver">
              No hay ejercicios disponibles para este nivel todavia.
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
          {respuestas.length >= ejercicios.length && (
            <button
              type="button"
              className="w-full rounded-md bg-primary py-2 text-sm text-primary-foreground"
              onClick={() => setEtapa('transferencia')}
            >
              Continuar
            </button>
          )}
        </div>
      )}

      {etapa === 'transferencia' && (
        <div className="space-y-6">
          <MapaTransferencia items={mapaTransferencia} />
          <button
            type="button"
            className="w-full rounded-md bg-primary py-2 text-sm text-primary-foreground"
            onClick={() => setEtapa('metacognicion')}
          >
            Continuar
          </button>
        </div>
      )}

      {etapa === 'metacognicion' && (
        <Metacognicion
          preguntas={preguntasMetacognicion}
          onCompletar={(metacognicion) => onFinalizar(respuestas, metacognicion)}
        />
      )}
    </div>
  );
});
