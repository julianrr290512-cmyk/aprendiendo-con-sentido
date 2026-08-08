import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AreaId, SesionUsuario } from '@/types';

interface SessionState {
  sesion: SesionUsuario;
  setArea: (areaId: AreaId) => void;
  setGrado: (gradoId: string) => void;
  setTema: (temaId: string) => void;
  setNivel: (nivelId: string) => void;
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
    nivelActualId: null,
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
      setTema: (temaId) =>
        set((state) => ({ sesion: { ...state.sesion, temaActualId: temaId } })),
      setNivel: (nivelId) =>
        set((state) => ({ sesion: { ...state.sesion, nivelActualId: nivelId } })),
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
