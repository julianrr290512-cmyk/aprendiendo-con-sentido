import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AreaId, SesionUsuario } from '@/types';

interface SetTemaParams {
  temaId: string;
  temaNombre: string;
}

interface SessionState {
  sesion: SesionUsuario;
  setArea: (areaId: AreaId) => void;
  /** Fija el tema elegido por el docente (id determinista + nombre legible, siempre texto libre). */
  setTema: (params: SetTemaParams) => void;
  toggleSonido: () => void;
  setVolumen: (volumen: number) => void;
  reiniciarSesion: () => void;
}

function crearSesionInicial(): SesionUsuario {
  const prefiereMenosMovimiento =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  return {
    id: crypto.randomUUID(),
    nombre: 'Estudiante',
    areaActualId: null,
    temaActualId: null,
    temaNombreActual: null,
    // Quien prefiere menos estimulo de movimiento suele preferir tambien
    // arrancar sin sonido; sigue siendo un toggle explicito, no un bloqueo.
    sonidoHabilitado: !prefiereMenosMovimiento,
    volumen: 0.6,
    fechaInicio: new Date().toISOString(),
  };
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sesion: crearSesionInicial(),
      setArea: (areaId) =>
        set((state) => ({ sesion: { ...state.sesion, areaActualId: areaId } })),
      setTema: ({ temaId, temaNombre }) =>
        set((state) => ({
          sesion: { ...state.sesion, temaActualId: temaId, temaNombreActual: temaNombre },
        })),
      toggleSonido: () =>
        set((state) => ({
          sesion: { ...state.sesion, sonidoHabilitado: !state.sesion.sonidoHabilitado },
        })),
      setVolumen: (volumen) =>
        set((state) => ({
          sesion: { ...state.sesion, volumen: Math.min(1, Math.max(0, volumen)) },
        })),
      reiniciarSesion: () => set({ sesion: crearSesionInicial() }),
    }),
    { name: 'acs-session-store' },
  ),
);
