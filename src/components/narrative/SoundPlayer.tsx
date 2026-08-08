import { memo, useEffect, useMemo, useState } from 'react';
import { desbloquearAudioContext, useNarrativeSound } from './narrativeSoundEngine';
import { cn } from '@/utils/cn';

interface SoundPlayerProps {
  className?: string;
}

/** Toggle de sonido + slider de volumen global, para el header de la narrativa. */
export const SoundPlayer = memo(function SoundPlayer({ className }: SoundPlayerProps) {
  const { sonidoHabilitado, volumen, toggleSonido, setVolumen, reproducir } = useNarrativeSound();
  const [prefiereMenosMovimiento] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );

  // Desbloquea el AudioContext en la primera interaccion del usuario (requerido por Safari/Chrome).
  useEffect(() => {
    function desbloquear() {
      desbloquearAudioContext();
      window.removeEventListener('pointerdown', desbloquear);
    }
    window.addEventListener('pointerdown', desbloquear, { once: true });
    return () => window.removeEventListener('pointerdown', desbloquear);
  }, []);

  const etiquetaVolumen = useMemo(() => `${Math.round(volumen * 100)}%`, [volumen]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={() => {
          toggleSonido();
          if (!sonidoHabilitado) reproducir('acierto');
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-math-silver transition-colors hover:text-math-cyan"
        aria-label={sonidoHabilitado ? 'Silenciar sonido' : 'Activar sonido'}
        title={
          prefiereMenosMovimiento
            ? 'Tu sistema prefiere menos estimulo; el sonido inicia apagado pero puedes activarlo.'
            : undefined
        }
      >
        {sonidoHabilitado ? '🔊' : '🔇'}
      </button>

      {sonidoHabilitado && (
        <label className="flex items-center gap-2 text-xs text-math-silver">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volumen}
            onChange={(evento) => setVolumen(Number(evento.target.value))}
            className="h-1 w-20 cursor-pointer accent-math-cyan"
            aria-label="Volumen de la narrativa"
          />
          <span className="w-9 font-mono">{etiquetaVolumen}</span>
        </label>
      )}
    </div>
  );
});
