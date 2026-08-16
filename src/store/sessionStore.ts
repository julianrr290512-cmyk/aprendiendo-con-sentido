import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AreaId, GradoId, SesionUsuario } from '@/types';

interface SetTemaParams {
  temaId: string;
  temaNombre: string;
  /** Enfoque libre que el usuario escribio, como contexto adicional para la IA. */
  descripcion: string;
}

interface SessionState {
  sesion: SesionUsuario;
  setArea: (areaId: AreaId) => void;
  setGrado: (gradoId: GradoId) => void;
  /** Fija el tema elegido (id determinista + nombre legible + descripcion, siempre texto libre). */
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
    gradoActualId: null,
    temaActualId: null,
    temaNombreActual: null,
    descripcionActual: null,
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
      setGrado: (gradoId) =>
        set((state) => ({ sesion: { ...state.sesion, gradoActualId: gradoId } })),
      setTema: ({ temaId, temaNombre, descripcion }) =>
        set((state) => ({
          sesion: {
            ...state.sesion,
            temaActualId: temaId,
            temaNombreActual: temaNombre,
            descripcionActual: descripcion,
          },
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
