import { useCallback } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import type { SlideSonido } from '@/types';

export type EfectoSonido = SlideSonido | 'acierto' | 'error' | 'transicion';

let contexto: AudioContext | null = null;

function obtenerContexto(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextCtor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  contexto ??= new AudioContextCtor();
  if (contexto.state === 'suspended') void contexto.resume();
  return contexto;
}

/** Desbloquea el AudioContext en la primera interaccion del usuario (requerido por Safari/Chrome). */
export function desbloquearAudioContext(): void {
  obtenerContexto();
}

/** Envolvente ADSR simplificada: ataque rapido, decaimiento exponencial suave. */
function aplicarEnvolvente(gain: GainNode, inicio: number, pico: number, duracion: number) {
  gain.gain.setValueAtTime(0.0001, inicio);
  gain.gain.exponentialRampToValueAtTime(pico, inicio + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);
}

function tono(
  ctx: AudioContext,
  destino: GainNode,
  frecuenciaInicial: number,
  frecuenciaFinal: number,
  inicio: number,
  duracion: number,
  volumenPico: number,
  tipo: OscillatorType = 'sine',
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(frecuenciaInicial, inicio);
  osc.frequency.exponentialRampToValueAtTime(Math.max(frecuenciaFinal, 1), inicio + duracion);
  aplicarEnvolvente(gain, inicio, volumenPico, duracion);
  osc.connect(gain);
  gain.connect(destino);
  osc.start(inicio);
  osc.stop(inicio + duracion + 0.05);
}

/**
 * Genera cada efecto programaticamente con Web Audio API (sin assets de audio).
 * `volumenMaestro` escala el pico de cada envolvente; 0 equivale a silencio.
 */
function generarEfecto(tipoEfecto: EfectoSonido, volumenMaestro: number) {
  const ctx = obtenerContexto();
  if (!ctx || volumenMaestro <= 0) return;

  const salida = ctx.createGain();
  salida.gain.value = volumenMaestro;
  salida.connect(ctx.destination);
  const ahora = ctx.currentTime;

  switch (tipoEfecto) {
    case 'intro':
      // Oscilador senoidal ascendente 440 -> 880Hz, 0.5s
      tono(ctx, salida, 440, 880, ahora, 0.5, 0.3);
      break;

    case 'descubrimiento': {
      // Arpegio C-E-G-C, 0.8s
      const notas = [261.63, 329.63, 392.0, 523.25];
      const duracionNota = 0.8 / notas.length;
      notas.forEach((freq, i) => {
        tono(ctx, salida, freq, freq, ahora + i * duracionNota, duracionNota * 1.4, 0.25);
      });
      break;
    }

    case 'logro': {
      // Acorde mayor C-E-G simultaneo, mas sostenido que "descubrimiento"
      [261.63, 329.63, 392.0].forEach((freq) => {
        tono(ctx, salida, freq, freq, ahora, 0.6, 0.22);
      });
      break;
    }

    case 'acierto':
      // Doble beep positivo corto
      tono(ctx, salida, 660, 660, ahora, 0.1, 0.3, 'triangle');
      tono(ctx, salida, 880, 880, ahora + 0.12, 0.14, 0.3, 'triangle');
      break;

    case 'error':
      // Buzzer suave descendente
      tono(ctx, salida, 220, 110, ahora, 0.4, 0.25, 'sawtooth');
      break;

    case 'tension': {
      // Tono grave sostenido con tremolo lento: crea anticipacion
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 130.81;
      lfo.frequency.value = 6;
      lfoGain.gain.value = 0.08;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      aplicarEnvolvente(gain, ahora, 0.18, 0.6);
      osc.connect(gain);
      gain.connect(salida);
      osc.start(ahora);
      lfo.start(ahora);
      osc.stop(ahora + 0.65);
      lfo.stop(ahora + 0.65);
      break;
    }

    case 'transicion': {
      // Whoosh: ruido filtrado con ganancia decreciente
      const duracion = 0.35;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * duracion, ctx.sampleRate);
      const datos = buffer.getChannelData(0);
      for (let i = 0; i < datos.length; i++) {
        datos[i] = (Math.random() * 2 - 1) * (1 - i / datos.length);
      }
      const fuente = ctx.createBufferSource();
      fuente.buffer = buffer;
      const filtro = ctx.createBiquadFilter();
      filtro.type = 'bandpass';
      filtro.frequency.setValueAtTime(1800, ahora);
      filtro.frequency.exponentialRampToValueAtTime(300, ahora + duracion);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ahora);
      gain.gain.exponentialRampToValueAtTime(0.001, ahora + duracion);
      fuente.connect(filtro);
      filtro.connect(gain);
      gain.connect(salida);
      fuente.start(ahora);
      break;
    }
  }
}

/** Hook compartido: cualquier componente de la narrativa lo usa para disparar efectos. */
export function useNarrativeSound() {
  const sonidoHabilitado = useSessionStore((state) => state.sesion.sonidoHabilitado);
  const volumen = useSessionStore((state) => state.sesion.volumen ?? 0.6);
  const toggleSonido = useSessionStore((state) => state.toggleSonido);
  const setVolumen = useSessionStore((state) => state.setVolumen);

  const reproducir = useCallback(
    (tipo: EfectoSonido) => {
      if (!sonidoHabilitado) return;
      generarEfecto(tipo, volumen);
    },
    [sonidoHabilitado, volumen],
  );

  return { reproducir, sonidoHabilitado, volumen, toggleSonido, setVolumen };
}
