import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FaseTipo, ProgresoTema, ResultadoNivel, SimulacionTelemetria } from '@/types';

const ESTRELLAS_INICIALES = 3;

interface ProgressState {
  resultadosPorNivel: Record<string, ResultadoNivel>;
  progresoPorTema: Record<string, ProgresoTema>;
  fasesCompletadasPorNivel: Record<string, FaseTipo[]>;
  /** Hipotesis de prediccion (texto libre) que el estudiante escribio, por nivel. */
  prediccionesPorNivel: Record<string, string>;
  /** Reflexion final de la fase de formalizacion, por nivel. */
  reflexionesPorNivel: Record<string, string>;
  /** Estrellas restantes tras usar pistas en la fase de exploracion (max 3, -1 por pista). */
  estrellasExploracionPorNivel: Record<string, number>;
  telemetriaSimulacionPorNivel: Record<string, SimulacionTelemetria>;
  registrarFaseCompletada: (nivelId: string, fase: FaseTipo) => void;
  registrarResultadoNivel: (resultado: ResultadoNivel) => void;
  obtenerProgresoTema: (temaId: string) => ProgresoTema | undefined;
  actualizarProgresoTema: (progreso: ProgresoTema) => void;
  guardarPrediccion: (nivelId: string, texto: string) => void;
  guardarReflexion: (nivelId: string, texto: string) => void;
  descontarEstrellaExploracion: (nivelId: string) => void;
  registrarTelemetriaSimulacion: (telemetria: SimulacionTelemetria) => void;
  reiniciarProgreso: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      resultadosPorNivel: {},
      progresoPorTema: {},
      fasesCompletadasPorNivel: {},
      prediccionesPorNivel: {},
      reflexionesPorNivel: {},
      estrellasExploracionPorNivel: {},
      telemetriaSimulacionPorNivel: {},

      registrarFaseCompletada: (nivelId, fase) =>
        set((state) => {
          const actuales = state.fasesCompletadasPorNivel[nivelId] ?? [];
          if (actuales.includes(fase)) return state;
          return {
            fasesCompletadasPorNivel: {
              ...state.fasesCompletadasPorNivel,
              [nivelId]: [...actuales, fase],
            },
          };
        }),

      registrarResultadoNivel: (resultado) =>
        set((state) => ({
          resultadosPorNivel: {
            ...state.resultadosPorNivel,
            [resultado.nivelId]: resultado,
          },
        })),

      obtenerProgresoTema: (temaId) => get().progresoPorTema[temaId],

      actualizarProgresoTema: (progreso) =>
        set((state) => ({
          progresoPorTema: { ...state.progresoPorTema, [progreso.temaId]: progreso },
        })),

      guardarPrediccion: (nivelId, texto) =>
        set((state) => ({
          prediccionesPorNivel: { ...state.prediccionesPorNivel, [nivelId]: texto },
        })),

      guardarReflexion: (nivelId, texto) =>
        set((state) => ({
          reflexionesPorNivel: { ...state.reflexionesPorNivel, [nivelId]: texto },
        })),

      descontarEstrellaExploracion: (nivelId) =>
        set((state) => {
          const actuales = state.estrellasExploracionPorNivel[nivelId] ?? ESTRELLAS_INICIALES;
          return {
            estrellasExploracionPorNivel: {
              ...state.estrellasExploracionPorNivel,
              [nivelId]: Math.max(0, actuales - 1),
            },
          };
        }),

      registrarTelemetriaSimulacion: (telemetria) =>
        set((state) => ({
          telemetriaSimulacionPorNivel: {
            ...state.telemetriaSimulacionPorNivel,
            [telemetria.nivelId]: telemetria,
          },
        })),

      reiniciarProgreso: () =>
        set({
          resultadosPorNivel: {},
          progresoPorTema: {},
          fasesCompletadasPorNivel: {},
          prediccionesPorNivel: {},
          reflexionesPorNivel: {},
          estrellasExploracionPorNivel: {},
          telemetriaSimulacionPorNivel: {},
        }),
    }),
    { name: 'acs-progress-store' },
  ),
);

export const ESTRELLAS_EXPLORACION_INICIALES = ESTRELLAS_INICIALES;
