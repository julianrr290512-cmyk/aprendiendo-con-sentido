import { useCallback, useRef } from 'react';
import { useSessionStore } from '@/store/sessionStore';

const audioCache = new Map<string, HTMLAudioElement>();

function cargarAudio(src: string): HTMLAudioElement {
  const existente = audioCache.get(src);
  if (existente) return existente;
  const audio = new Audio(src);
  audio.preload = 'auto';
  audioCache.set(src, audio);
  return audio;
}

export function useSound() {
  const sonidoHabilitado = useSessionStore((state) => state.sesion.sonidoHabilitado);
  const currentRef = useRef<HTMLAudioElement | null>(null);

  const reproducir = useCallback(
    (src: string, opciones?: { loop?: boolean; volumen?: number }) => {
      if (!sonidoHabilitado) return;
      const audio = cargarAudio(src);
      audio.loop = opciones?.loop ?? false;
      audio.volume = opciones?.volumen ?? 1;
      audio.currentTime = 0;
      void audio.play().catch(() => {
        /* reproduccion bloqueada por el navegador hasta interaccion del usuario */
      });
      currentRef.current = audio;
    },
    [sonidoHabilitado],
  );

  const detener = useCallback(() => {
    currentRef.current?.pause();
  }, []);

  return { reproducir, detener, sonidoHabilitado };
}
