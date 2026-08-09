import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type {
  EscenarioExploracion,
  FaseExploracion,
  FaseFormalizacion,
  FasePrediccion,
  FaseSimulacion,
  FormalizacionGeneradaResult,
  MetacognicionRespuesta,
  PasoDeck,
  PreguntaPrediccionResult,
  RespuestaEjercicio,
  SimulacionGeneradaResult,
  SimulacionTelemetria,
} from '@/types';
import { mapaTransferenciaFallback } from '@/data/contenidoNivel';
import { useContenidoCurricular } from '@/hooks/useContenidoCurricular';
import { useNarrativeSlides } from '@/hooks/useNarrativeSlides';
import {
  usePreguntaPrediccion,
  useEscenariosExploracion,
  useSimulacionGenerada,
  useFormalizacionGenerada,
  useEjerciciosGenerados,
} from '@/hooks/useFaseContent';
import { useSessionStore } from '@/store/sessionStore';
import { useProgressStore } from '@/store/progressStore';
import { PageTransition } from '@/components/PageTransition';
import { ExperienciaContinua } from '@/components/experience/ExperienciaContinua';
import { SoundPlayer } from '@/components/narrative/SoundPlayer';
import { FuenteContenidoBadge } from '@/components/ui/FuenteContenidoBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { rutas } from '@/router/routes';
import type { GenerarFaseParams } from '@/services/faseGenerator';

const PREGUNTAS_METACOGNICION = [
  '¿Que fue lo mas dificil de este nivel?',
  '¿Como podrias aplicar lo aprendido en otro contexto?',
];

function construirFasePrediccion(nivelId: string, resultado: PreguntaPrediccionResult): FasePrediccion {
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
    minPalabras: resultado.minPalabras,
    tiempoSugeridoSeg: 180,
  };
}

function construirFaseSimulacion(nivelId: string, resultado: SimulacionGeneradaResult): FaseSimulacion {
  return {
    id: `fase-simulacion-${nivelId}`,
    tipo: 'simulacion',
    nivelId,
    titulo: 'Simulación',
    instrucciones: 'Interactúa con la simulación para construir intuición antes de la teoría.',
    completada: false,
    ordenIndex: 1,
    categoria: resultado.categoria,
    formulaLatex: resultado.formulaLatex,
    configFracciones: resultado.configFracciones,
    configAlgebra: resultado.configAlgebra,
    configGeometria: resultado.configGeometria,
    configEstadistica: resultado.configEstadistica,
  };
}

function construirFaseExploracion(nivelId: string, escenarios: EscenarioExploracion[]): FaseExploracion {
  return {
    id: `fase-exploracion-${nivelId}`,
    tipo: 'exploracion',
    nivelId,
    titulo: 'Exploración',
    instrucciones: 'Analiza cada escenario real y explica tu razonamiento antes de ver la explicación.',
    completada: false,
    ordenIndex: 2,
    escenarios,
  };
}

function construirFaseFormalizacion(nivelId: string, resultado: FormalizacionGeneradaResult): FaseFormalizacion {
  return {
    id: `fase-formalizacion-${nivelId}`,
    tipo: 'formalizacion',
    nivelId,
    titulo: 'Formalización',
    instrucciones: 'Revisa las fórmulas clave de esta sesión.',
    completada: false,
    ordenIndex: 3,
    resumen: resultado.resumen,
    formulasClave: resultado.formulasClave,
  };
}

function ExperienciaPage() {
  const { nivelId } = useParams<{ nivelId: string }>();
  const navigate = useNavigate();
  const inicioRef = useRef(Date.now());

  const sesion = useSessionStore((state) => state.sesion);
  const registrarFaseCompletada = useProgressStore((state) => state.registrarFaseCompletada);
  const guardarPrediccion = useProgressStore((state) => state.guardarPrediccion);
  const guardarReflexion = useProgressStore((state) => state.guardarReflexion);
  const registrarTelemetriaSimulacion = useProgressStore((state) => state.registrarTelemetriaSimulacion);
  const registrarResultadoNivel = useProgressStore((state) => state.registrarResultadoNivel);
  const fasesCompletadas = useProgressStore(
    (state) => state.fasesCompletadasPorNivel[nivelId ?? ''] ?? [],
  );

  const contextoCompleto =
    Boolean(nivelId) &&
    Boolean(sesion.areaActualId) &&
    sesion.gradoNumeroActual !== null &&
    Boolean(sesion.temaNombreActual) &&
    Boolean(sesion.dificultadActual);

  useEffect(() => {
    if (!contextoCompleto) navigate('/');
  }, [contextoCompleto, navigate]);

  const { dba, estandares } = useContenidoCurricular(sesion.areaActualId, sesion.gradoNumeroActual);

  const parametrosFase: GenerarFaseParams | null = useMemo(() => {
    if (!contextoCompleto || !sesion.areaActualId || sesion.gradoNumeroActual === null) return null;
    return {
      temaId: nivelId as string,
      temaNombre: sesion.temaNombreActual as string,
      areaId: sesion.areaActualId,
      grado: sesion.gradoNumeroActual,
      dificultad: sesion.dificultadActual as GenerarFaseParams['dificultad'],
      dbaTexto: dba?.dba ?? [],
    };
  }, [contextoCompleto, sesion, nivelId, dba]);

  const parametrosNarrativa = useMemo(() => {
    if (!parametrosFase) return null;
    return {
      temaId: parametrosFase.temaId,
      temaNombre: parametrosFase.temaNombre,
      areaId: parametrosFase.areaId,
      grado: parametrosFase.grado,
      nivelNombre: sesion.dificultadActual ?? '',
      dificultad: parametrosFase.dificultad,
      dbaTexto: parametrosFase.dbaTexto,
      estandarTexto: estandares?.estandares[0]?.enunciado ?? '',
    };
  }, [parametrosFase, sesion.dificultadActual, estandares]);

  const narrativa = useNarrativeSlides(parametrosNarrativa);
  const prediccion = usePreguntaPrediccion(parametrosFase);
  const simulacion = useSimulacionGenerada(parametrosFase);
  const exploracion = useEscenariosExploracion(parametrosFase);
  const formalizacion = useFormalizacionGenerada(parametrosFase);
  const ejerciciosParams = useMemo(
    () =>
      parametrosFase && nivelId
        ? {
            nivelId,
            temaNombre: parametrosFase.temaNombre,
            areaId: parametrosFase.areaId,
            dificultad: parametrosFase.dificultad,
          }
        : null,
    [parametrosFase, nivelId],
  );
  const ejercicios = useEjerciciosGenerados(ejerciciosParams);

  const cargandoSiguiente =
    narrativa.isLoading ||
    prediccion.isLoading ||
    simulacion.isLoading ||
    exploracion.isLoading ||
    formalizacion.isLoading ||
    ejercicios.isLoading;

  const pasos: PasoDeck[] = useMemo(() => {
    if (!nivelId) return [];
    const lista: PasoDeck[] = [];

    (narrativa.data?.slides ?? []).forEach((slide) => {
      lista.push({ id: slide.id, categoria: 'introduccion', slide });
    });
    if (prediccion.data) {
      lista.push({
        id: 'paso-prediccion',
        categoria: 'prediccion',
        fase: construirFasePrediccion(nivelId, prediccion.data),
      });
    }
    if (simulacion.data) {
      lista.push({
        id: 'paso-simulacion',
        categoria: 'simulacion',
        fase: construirFaseSimulacion(nivelId, simulacion.data),
      });
    }
    if (exploracion.data) {
      lista.push({
        id: 'paso-exploracion',
        categoria: 'exploracion',
        fase: construirFaseExploracion(nivelId, exploracion.data.escenarios),
      });
    }
    if (formalizacion.data) {
      lista.push({
        id: 'paso-formalizacion',
        categoria: 'formalizacion',
        fase: construirFaseFormalizacion(nivelId, formalizacion.data),
      });
    }
    if (ejercicios.data) {
      lista.push({
        id: 'paso-ejercicios',
        categoria: 'ejercicios',
        ejercicios: ejercicios.data.ejercicios,
        mapaTransferencia: mapaTransferenciaFallback[nivelId] ?? [],
        preguntasMetacognicion: PREGUNTAS_METACOGNICION,
      });
    }
    return lista;
  }, [nivelId, narrativa.data, prediccion.data, simulacion.data, exploracion.data, formalizacion.data, ejercicios.data]);

  const onCompletarPrediccion = useCallback(
    (texto: string) => {
      if (!nivelId) return;
      guardarPrediccion(nivelId, texto);
      registrarFaseCompletada(nivelId, 'prediccion');
    },
    [nivelId, guardarPrediccion, registrarFaseCompletada],
  );

  const onCompletarSimulacion = useCallback(
    (telemetria: SimulacionTelemetria) => {
      if (!nivelId) return;
      registrarTelemetriaSimulacion(telemetria);
      registrarFaseCompletada(nivelId, 'simulacion');
    },
    [nivelId, registrarTelemetriaSimulacion, registrarFaseCompletada],
  );

  const onCompletarExploracion = useCallback(() => {
    if (!nivelId) return;
    registrarFaseCompletada(nivelId, 'exploracion');
  }, [nivelId, registrarFaseCompletada]);

  const onCompletarFormalizacion = useCallback(
    (reflexion: string) => {
      if (!nivelId) return;
      guardarReflexion(nivelId, reflexion);
      registrarFaseCompletada(nivelId, 'formalizacion');
    },
    [nivelId, guardarReflexion, registrarFaseCompletada],
  );

  const onCompletarEjercicios = useCallback(
    (respuestas: RespuestaEjercicio[], metacognicion: MetacognicionRespuesta[]) => {
      if (!nivelId) return;
      const lista = ejercicios.data?.ejercicios ?? [];
      const puntajeMaximo = lista.reduce((acc, ej) => acc + ej.puntaje, 0);
      const puntajeTotal = lista.reduce((acc, ej) => {
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
        tiempoTotalMs: Date.now() - inicioRef.current,
      });
    },
    [nivelId, ejercicios.data, fasesCompletadas, registrarResultadoNivel],
  );

  const onCompletadoTotal = useCallback(() => {
    if (!nivelId) return;
    navigate(rutas.resultados(nivelId));
  }, [nivelId, navigate]);

  if (!contextoCompleto) return null;

  return (
    <PageTransition className="relative min-h-screen">
      <div className="relative flex items-center justify-between p-4">
        {narrativa.data && <FuenteContenidoBadge fuente={narrativa.data.fuente} />}
        <div className="ml-auto">
          <SoundPlayer />
        </div>
      </div>

      {narrativa.isLoading || !narrativa.data ? (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <ExperienciaContinua
          pasos={pasos}
          cargandoSiguiente={cargandoSiguiente}
          dba={dba?.dba ?? []}
          dbaFuente={dba?.fuente ?? 'local'}
          onCompletarPrediccion={onCompletarPrediccion}
          onCompletarSimulacion={onCompletarSimulacion}
          onCompletarExploracion={onCompletarExploracion}
          onCompletarFormalizacion={onCompletarFormalizacion}
          onCompletarEjercicios={onCompletarEjercicios}
          onCompletadoTotal={onCompletadoTotal}
        />
      )}
    </PageTransition>
  );
}

export default memo(ExperienciaPage);
