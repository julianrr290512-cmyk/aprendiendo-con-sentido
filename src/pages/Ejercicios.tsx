import { memo, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mapaTransferenciaFallback } from '@/data/contenidoNivel';
import { gradosFallback, nivelesFallback, temasFallback } from '@/data/temas';
import type { MetacognicionRespuesta, RespuestaEjercicio } from '@/types';
import { useProgressStore } from '@/store/progressStore';
import { useEjerciciosGenerados } from '@/hooks/useFaseContent';
import type { GenerarEjerciciosParams } from '@/services/ejercicioGenerator';
import { EjercicioCard } from '@/components/exercises/EjercicioCard';
import { MapaTransferencia } from '@/components/exercises/MapaTransferencia';
import { Metacognicion } from '@/components/exercises/Metacognicion';
import { Skeleton } from '@/components/ui/Skeleton';
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

  const nivel = useMemo(() => nivelesFallback.find((n) => n.id === nivelId), [nivelId]);
  const tema = useMemo(() => temasFallback.find((t) => t.id === nivel?.temaId), [nivel]);
  const grado = useMemo(() => gradosFallback.find((g) => g.id === tema?.gradoId), [tema]);

  const parametrosEjercicios: GenerarEjerciciosParams | null = useMemo(() => {
    if (!nivelId || !nivel || !tema || !grado) return null;
    return {
      nivelId,
      temaNombre: tema.nombre,
      areaId: tema.areaId,
      dificultad: nivel.dificultad,
    };
  }, [nivelId, nivel, tema, grado]);

  const ejerciciosGenerados = useEjerciciosGenerados(parametrosEjercicios);
  const ejercicios = useMemo(
    () => ejerciciosGenerados.data?.ejercicios ?? [],
    [ejerciciosGenerados.data],
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
      {etapa === 'ejercicios' && ejerciciosGenerados.isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {etapa === 'ejercicios' && !ejerciciosGenerados.isLoading && (
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
        <Metacognicion preguntas={PREGUNTAS_METACOGNICION} onCompletar={finalizar} />
      )}
    </div>
  );
}

export default memo(EjerciciosPage);
