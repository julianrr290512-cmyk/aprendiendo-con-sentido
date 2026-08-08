import { memo, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { FaseTipo, FasePrediccion, SimulacionTelemetria } from '@/types';
import { gradosFallback, nivelesFallback, temasFallback } from '@/data/temas';
import {
  fasesExploracionFallback,
  fasesFormalizacionFallback,
  fasesSimulacionFallback,
} from '@/data/contenidoNivel';
import { useContenidoCurricular } from '@/hooks/useContenidoCurricular';
import { usePreguntaPrediccion, useEscenariosExploracion } from '@/hooks/useFaseContent';
import { useProgressStore } from '@/store/progressStore';
import { PageTransition } from '@/components/PageTransition';
import { Prediccion } from '@/components/phases/Prediccion';
import { Simulacion } from '@/components/phases/Simulacion';
import { Exploracion } from '@/components/phases/Exploracion';
import { Formalizacion } from '@/components/phases/Formalizacion';
import { ProgressBar, type FaseProgreso } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { rutas } from '@/router/routes';
import type { GenerarFaseParams } from '@/services/faseGenerator';

const ORDEN_FASES: FaseTipo[] = ['prediccion', 'simulacion', 'exploracion', 'formalizacion'];
const MIN_PALABRAS_PREDICCION = 20;

function FasesPage() {
  const { nivelId } = useParams<{ nivelId: string }>();
  const navigate = useNavigate();
  const registrarFaseCompletada = useProgressStore((state) => state.registrarFaseCompletada);
  const guardarPrediccion = useProgressStore((state) => state.guardarPrediccion);
  const guardarReflexion = useProgressStore((state) => state.guardarReflexion);
  const registrarTelemetriaSimulacion = useProgressStore((state) => state.registrarTelemetriaSimulacion);
  const prediccionGuardada = useProgressStore((state) => (nivelId ? state.prediccionesPorNivel[nivelId] : undefined));
  const [indice, setIndice] = useState(0);

  const nivel = nivelesFallback.find((n) => n.id === nivelId);
  const tema = temasFallback.find((t) => t.id === nivel?.temaId);
  const grado = gradosFallback.find((g) => g.id === tema?.gradoId);

  const { dba } = useContenidoCurricular(tema?.areaId ?? null, grado?.numero ?? null);

  const parametrosFase: GenerarFaseParams | null = useMemo(() => {
    if (!nivel || !tema || !grado) return null;
    return {
      temaId: tema.id,
      temaNombre: tema.nombre,
      areaId: tema.areaId,
      grado: grado.numero,
      dificultad: nivel.dificultad,
      dbaTexto: dba?.dba ?? [],
    };
  }, [nivel, tema, grado, dba]);

  const faseTipo = ORDEN_FASES[indice];

  const preguntaPrediccion = usePreguntaPrediccion(faseTipo === 'prediccion' ? parametrosFase : null);
  const escenariosExploracion = useEscenariosExploracion(faseTipo === 'exploracion' ? parametrosFase : null);

  const avanzar = () => {
    if (nivelId && faseTipo) registrarFaseCompletada(nivelId, faseTipo);
    if (indice + 1 >= ORDEN_FASES.length) {
      navigate(rutas.ejercicios(nivelId ?? ''));
      return;
    }
    setIndice((prev) => prev + 1);
  };

  const fasesProgreso: FaseProgreso[] = useMemo(
    () =>
      ORDEN_FASES.map((tipo, i) => ({
        tipo,
        estado: i < indice ? 'completada' : i === indice ? 'activa' : 'pendiente',
      })),
    [indice],
  );

  if (!nivel || !tema || !nivelId) {
    return (
      <PageTransition className="p-6 text-center text-muted-foreground">
        Fase no disponible.
      </PageTransition>
    );
  }

  return (
    <PageTransition className="relative mx-auto max-w-2xl space-y-6 px-6 py-16">
      <ProgressBar fases={fasesProgreso} />

      {faseTipo === 'prediccion' &&
        (preguntaPrediccion.isLoading || !preguntaPrediccion.data ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <Prediccion
            fase={construirFasePrediccion(nivelId, preguntaPrediccion.data)}
            onCompletar={(texto) => {
              guardarPrediccion(nivelId, texto);
              avanzar();
            }}
          />
        ))}

      {faseTipo === 'simulacion' &&
        (() => {
          const fase = fasesSimulacionFallback[nivelId];
          if (!fase) return <p className="text-center text-sm text-math-silver">Simulación no disponible.</p>;
          return (
            <Simulacion
              fase={fase}
              onCompletar={(telemetria: SimulacionTelemetria) => {
                registrarTelemetriaSimulacion(telemetria);
                avanzar();
              }}
            />
          );
        })()}

      {faseTipo === 'exploracion' &&
        (() => {
          const base = fasesExploracionFallback[nivelId];
          if (escenariosExploracion.isLoading || !escenariosExploracion.data || !base) {
            return <Skeleton className="h-96 w-full" />;
          }
          return (
            <Exploracion
              fase={{ ...base, escenarios: escenariosExploracion.data.escenarios }}
              onCompletar={avanzar}
            />
          );
        })()}

      {faseTipo === 'formalizacion' &&
        (() => {
          const fase = fasesFormalizacionFallback[nivelId];
          if (!fase) return <p className="text-center text-sm text-math-silver">Formalización no disponible.</p>;
          return (
            <Formalizacion
              fase={fase}
              prediccionEstudiante={prediccionGuardada}
              dba={dba?.dba ?? []}
              dbaFuente={dba?.fuente ?? 'local'}
              onCompletar={(reflexion) => {
                guardarReflexion(nivelId, reflexion);
                avanzar();
              }}
            />
          );
        })()}
    </PageTransition>
  );
}

function construirFasePrediccion(
  nivelId: string,
  resultado: { pregunta: string; contexto?: string; minPalabras: number },
): FasePrediccion {
  return {
    id: `fase-prediccion-${nivelId}`,
    tipo: 'prediccion',
    nivelId,
    titulo: 'Predicción',
    instrucciones: 'Antes de ver el concepto formal, escribe tu propia hipótesis.',
    completada: false,
    ordenIndex: 0,
    pregunta: resultado.pregunta,
    contexto: resultado.contexto,
    minPalabras: resultado.minPalabras || MIN_PALABRAS_PREDICCION,
    tiempoSugeridoSeg: 180,
  };
}

export default memo(FasesPage);
