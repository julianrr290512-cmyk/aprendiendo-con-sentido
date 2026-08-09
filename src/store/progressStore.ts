import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FaseTipo, ResultadoSesion } from '@/types';

const ESTRELLAS_INICIALES = 3;

interface ProgressState {
  resultadosPorTema: Record<string, ResultadoSesion>;
  fasesCompletadasPorTema: Record<string, FaseTipo[]>;
  /** Hipotesis de prediccion (texto libre) que el estudiante escribio, por tema. */
  prediccionesPorTema: Record<string, string[]>;
  /** Estrellas restantes tras usar pistas en la fase de exploracion (max 3, -1 por pista). */
  estrellasExploracionPorTema: Record<string, number>;
  registrarFaseCompletada: (temaId: string, fase: FaseTipo) => void;
  registrarResultadoSesion: (resultado: ResultadoSesion) => void;
  guardarPredicciones: (temaId: string, textos: string[]) => void;
  descontarEstrellaExploracion: (temaId: string) => void;
  reiniciarProgreso: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      resultadosPorTema: {},
      fasesCompletadasPorTema: {},
      prediccionesPorTema: {},
      estrellasExploracionPorTema: {},

      registrarFaseCompletada: (temaId, fase) =>
        set((state) => {
          const actuales = state.fasesCompletadasPorTema[temaId] ?? [];
          if (actuales.includes(fase)) return state;
          return {
            fasesCompletadasPorTema: {
              ...state.fasesCompletadasPorTema,
              [temaId]: [...actuales, fase],
            },
          };
        }),

      registrarResultadoSesion: (resultado) =>
        set((state) => ({
          resultadosPorTema: {
            ...state.resultadosPorTema,
            [resultado.temaId]: resultado,
          },
        })),

      guardarPredicciones: (temaId, textos) =>
        set((state) => ({
          prediccionesPorTema: { ...state.prediccionesPorTema, [temaId]: textos },
        })),

      descontarEstrellaExploracion: (temaId) =>
        set((state) => {
          const actuales = state.estrellasExploracionPorTema[temaId] ?? ESTRELLAS_INICIALES;
          return {
            estrellasExploracionPorTema: {
              ...state.estrellasExploracionPorTema,
              [temaId]: Math.max(0, actuales - 1),
            },
          };
        }),

      reiniciarProgreso: () =>
        set({
          resultadosPorTema: {},
          fasesCompletadasPorTema: {},
          prediccionesPorTema: {},
          estrellasExploracionPorTema: {},
        }),
    }),
    { name: 'acs-progress-store' },
  ),
);

export const ESTRELLAS_EXPLORACION_INICIALES = ESTRELLAS_INICIALES;
