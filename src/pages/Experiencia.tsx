import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type {
  EscenarioExploracion,
  FaseExploracion,
  FaseFormalizacion,
  FasePrediccion,
  FormalizacionGeneradaResult,
  PasoDeck,
  PreguntaItem,
  RespuestaEjercicio,
} from '@/types';
import {
  usePreguntaPrediccion,
  useEscenariosExploracion,
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

function construirFasePrediccion(temaId: string, preguntas: PreguntaItem[]): FasePrediccion {
  return {
    id: `fase-prediccion-${temaId}`,
    tipo: 'prediccion',
    temaId,
    titulo: 'Predicción',
    instrucciones: 'Antes de ver el concepto formal, escribe tu propia hipótesis.',
    completada: false,
    ordenIndex: 0,
    preguntas,
  };
}

function construirFaseExploracion(temaId: string, escenarios: EscenarioExploracion[]): FaseExploracion {
  return {
    id: `fase-exploracion-${temaId}`,
    tipo: 'exploracion',
    temaId,
    titulo: 'Exploración',
    instrucciones: 'Analiza cada escenario real y explica tu razonamiento antes de ver la explicación.',
    completada: false,
    ordenIndex: 1,
    escenarios,
  };
}

function construirFaseFormalizacion(temaId: string, resultado: FormalizacionGeneradaResult): FaseFormalizacion {
  return {
    id: `fase-formalizacion-${temaId}`,
    tipo: 'formalizacion',
    temaId,
    titulo: 'Formalización',
    instrucciones: 'Revisa el concepto formal de esta sesión.',
    completada: false,
    ordenIndex: 2,
    resumen: resultado.resumen,
    formulasClave: resultado.formulasClave,
    analogia: resultado.analogia,
    grafica: resultado.grafica,
  };
}

function ExperienciaPage() {
  const { temaId } = useParams<{ temaId: string }>();
  const navigate = useNavigate();
  const inicioRef = useRef(Date.now());

  const sesion = useSessionStore((state) => state.sesion);
  const registrarFaseCompletada = useProgressStore((state) => state.registrarFaseCompletada);
  const guardarPredicciones = useProgressStore((state) => state.guardarPredicciones);
  const registrarResultadoSesion = useProgressStore((state) => state.registrarResultadoSesion);
  const fasesCompletadas = useProgressStore(
    (state) => state.fasesCompletadasPorTema[temaId ?? ''] ?? [],
  );

  const contextoCompleto =
    Boolean(temaId) && Boolean(sesion.areaActualId) && Boolean(sesion.temaNombreActual);

  useEffect(() => {
    if (!contextoCompleto) navigate('/');
  }, [contextoCompleto, navigate]);

  const parametrosFase: GenerarFaseParams | null = useMemo(() => {
    if (!contextoCompleto || !sesion.areaActualId || !temaId) return null;
    return {
      temaId,
      temaNombre: sesion.temaNombreActual as string,
      areaId: sesion.areaActualId,
    };
  }, [contextoCompleto, sesion, temaId]);

  const prediccion = usePreguntaPrediccion(parametrosFase);
  const exploracion = useEscenariosExploracion(parametrosFase);
  const formalizacion = useFormalizacionGenerada(parametrosFase);
  const ejercicios = useEjerciciosGenerados(parametrosFase);

  const cargandoSiguiente =
    prediccion.isLoading || exploracion.isLoading || formalizacion.isLoading || ejercicios.isLoading;

  const pasos: PasoDeck[] = useMemo(() => {
    if (!temaId) return [];
    const lista: PasoDeck[] = [];

    if (prediccion.data) {
      lista.push({
        id: 'paso-prediccion',
        categoria: 'prediccion',
        fase: construirFasePrediccion(temaId, prediccion.data.preguntas),
      });
    }
    if (exploracion.data) {
      lista.push({
        id: 'paso-exploracion',
        categoria: 'exploracion',
        fase: construirFaseExploracion(temaId, exploracion.data.escenarios),
      });
    }
    if (formalizacion.data) {
      lista.push({
        id: 'paso-formalizacion',
        categoria: 'formalizacion',
        fase: construirFaseFormalizacion(temaId, formalizacion.data),
      });
    }
    if (ejercicios.data) {
      lista.push({
        id: 'paso-ejercicios',
        categoria: 'ejercicios',
        ejercicios: ejercicios.data.ejercicios,
      });
    }
    return lista;
  }, [temaId, prediccion.data, exploracion.data, formalizacion.data, ejercicios.data]);

  const onCompletarPrediccion = useCallback(
    (textos: string[]) => {
      if (!temaId) return;
      guardarPredicciones(temaId, textos);
      registrarFaseCompletada(temaId, 'prediccion');
    },
    [temaId, guardarPredicciones, registrarFaseCompletada],
  );

  const onCompletarExploracion = useCallback(() => {
    if (!temaId) return;
    registrarFaseCompletada(temaId, 'exploracion');
  }, [temaId, registrarFaseCompletada]);

  const onCompletarFormalizacion = useCallback(() => {
    if (!temaId) return;
    registrarFaseCompletada(temaId, 'formalizacion');
  }, [temaId, registrarFaseCompletada]);

  const onCompletarEjercicios = useCallback(
    (respuestas: RespuestaEjercicio[]) => {
      if (!temaId) return;
      const lista = ejercicios.data?.ejercicios ?? [];
      const puntajeMaximo = lista.reduce((acc, ej) => acc + ej.puntaje, 0);
      const puntajeTotal = lista.reduce((acc, ej) => {
        const respuesta = respuestas.find((r) => r.ejercicioId === ej.id);
        return acc + (respuesta?.esCorrecta ? ej.puntaje : 0);
      }, 0);

      registrarResultadoSesion({
        temaId,
        puntajeTotal,
        puntajeMaximo,
        porcentaje: puntajeMaximo ? Math.round((puntajeTotal / puntajeMaximo) * 100) : 0,
        respuestas,
        fasesCompletadas,
        fechaCompletado: new Date().toISOString(),
        tiempoTotalMs: Date.now() - inicioRef.current,
      });
    },
    [temaId, ejercicios.data, fasesCompletadas, registrarResultadoSesion],
  );

  const onCompletadoTotal = useCallback(() => {
    if (!temaId) return;
    navigate(rutas.resultados(temaId));
  }, [temaId, navigate]);

  if (!contextoCompleto) return null;

  return (
    <PageTransition className="relative min-h-screen">
      <div className="relative flex items-center justify-between p-4">
        {prediccion.data && <FuenteContenidoBadge fuente={prediccion.data.fuente} />}
        <div className="ml-auto">
          <SoundPlayer />
        </div>
      </div>

      {prediccion.isLoading || !prediccion.data ? (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <ExperienciaContinua
          pasos={pasos}
          cargandoSiguiente={cargandoSiguiente}
          onCompletarPrediccion={onCompletarPrediccion}
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
