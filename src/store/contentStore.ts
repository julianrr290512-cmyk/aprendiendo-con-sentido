import { create } from 'zustand';
import type { Area, DBA, Estandar, Grado, Nivel, Tema } from '@/types';

interface ContentState {
  areas: Area[];
  grados: Record<string, Grado>;
  temas: Record<string, Tema>;
  niveles: Record<string, Nivel>;
  dbaPorId: Record<string, DBA>;
  estandaresPorId: Record<string, Estandar>;
  setAreas: (areas: Area[]) => void;
  upsertGrados: (grados: Grado[]) => void;
  upsertTemas: (temas: Tema[]) => void;
  upsertNiveles: (niveles: Nivel[]) => void;
  upsertDba: (dba: DBA[]) => void;
  upsertEstandares: (estandares: Estandar[]) => void;
}

function porId<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

export const useContentStore = create<ContentState>()((set) => ({
  areas: [],
  grados: {},
  temas: {},
  niveles: {},
  dbaPorId: {},
  estandaresPorId: {},

  setAreas: (areas) => set({ areas }),
  upsertGrados: (grados) =>
    set((state) => ({ grados: { ...state.grados, ...porId(grados) } })),
  upsertTemas: (temas) =>
    set((state) => ({ temas: { ...state.temas, ...porId(temas) } })),
  upsertNiveles: (niveles) =>
    set((state) => ({ niveles: { ...state.niveles, ...porId(niveles) } })),
  upsertDba: (dba) =>
    set((state) => ({ dbaPorId: { ...state.dbaPorId, ...porId(dba) } })),
  upsertEstandares: (estandares) =>
    set((state) => ({
      estandaresPorId: { ...state.estandaresPorId, ...porId(estandares) },
    })),
}));
