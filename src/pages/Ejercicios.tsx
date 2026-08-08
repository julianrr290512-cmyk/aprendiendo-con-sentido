import { memo, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ejerciciosFallback, mapaTransferenciaFallback } from '@/data/contenidoNivel';
import type { MetacognicionRespuesta, RespuestaEjercicio } from '@/types';
import { useProgressStore } from '@/store/progressStore';
import { EjercicioCard } from '@/components/exercises/EjercicioCard';
import { MapaTransferencia } from '@/components/exercises/MapaTransferencia';
import { Metacognicion } from '@/components/exercises/Metacognicion';
import { rutas } from '@/router/routes';

const PREGUNTAS_METACOGNICION = [
  '¿Que fue lo mas dificil de este nivel?',
  '¿Como podrias aplicar lo aprendido en otro contexto?',
];

function EjerciciosPage() {
  const { nivelId } = useParams<{ nivelId: string }>();
  const navigate = useNavigate();
  const registrarResultadoNivel = useProgressStore((state) => state.registrarResultadoNivel);
  const fasesCompletadas = useProgressStore(
    (state) => state.fasesCompletadasPorNivel[nivelId ?? ''] ?? [],
  );

  const [inicio] = useState(() => Date.now());
  const [respuestas, setRespuestas] = useState<RespuestaEjercicio[]>([]);
  const [etapa, setEtapa] = useState<'ejercicios' | 'transferencia' | 'metacognicion'>(
    'ejercicios',
  );

  const ejercicios = useMemo(
    () => (nivelId ? (ejerciciosFallback[nivelId] ?? []) : []),
    [nivelId],
  );
  const mapaTransferencia = useMemo(
    () => (nivelId ? (mapaTransferenciaFallback[nivelId] ?? []) : []),
    [nivelId],
  );

  const responderEjercicio = (
    ejercicioId: string,
    respuestaDada: string,
    esCorrecta: boolean,
  ) => {
    setRespuestas((prev) => [
      ...prev,
      { ejercicioId, respuestaDada, esCorrecta, tiempoRespuestaMs: 0, intentos: 1 },
    ]);
  };

  const finalizar = (metacognicion: MetacognicionRespuesta[]) => {
    if (!nivelId) return;
    const puntajeMaximo = ejercicios.reduce((acc, ej) => acc + ej.puntaje, 0);
    const puntajeTotal = ejercicios.reduce((acc, ej) => {
      const respuesta = respuestas.find((r) => r.ejercicioId === ej.id);
      return acc + (respuesta?.esCorrecta ? ej.puntaje : 0);
    }, 0);

    registrarResultadoNivel({
      nivelId,
      puntajeTotal,
      puntajeMaximo,
      porcentaje: puntajeMaximo ? Math.round((puntajeTotal / puntajeMaximo) * 100) : 0,
      respuestas,
      fasesCompletadas,
      metacognicion,
      fechaCompletado: new Date().toISOString(),
      tiempoTotalMs: Date.now() - inicio,
    });

    navigate(rutas.resultados(nivelId));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-16">
      {etapa === 'ejercicios' && (
        <div className="space-y-6">
          {ejercicios.map((ejercicio) => (
            <EjercicioCard
              key={ejercicio.id}
              ejercicio={ejercicio}
              onResponder={(respuestaDada, esCorrecta) =>
                responderEjercicio(ejercicio.id, respuestaDada, esCorrecta)
              }
            />
          ))}
          {respuestas.length >= ejercicios.length && ejercicios.length > 0 && (
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
        <Metacognicion preguntas={PREGUNTAS_METACOGNICION} onCompletar={finalizar} />
      )}
    </div>
  );
}

export default memo(EjerciciosPage);
