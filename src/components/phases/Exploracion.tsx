import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { FaseExploracion } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useProgressStore, ESTRELLAS_EXPLORACION_INICIALES } from '@/store/progressStore';
import { useNarrativeSound } from '@/components/narrative/narrativeSoundEngine';
import { cn } from '@/utils/cn';

interface ExploracionProps {
  fase: FaseExploracion;
  onCompletar: () => void;
}

const TIEMPO_LIMITE_DEFECTO = 90;

export const Exploracion = memo(function Exploracion({ fase, onCompletar }: ExploracionProps) {
  const [indiceEscenario, setIndiceEscenario] = useState(0);
  const escenario = fase.escenarios[indiceEscenario];

  if (!escenario) return null;

  const esUltimo = indiceEscenario === fase.escenarios.length - 1;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>{fase.titulo}</CardTitle>
          <p className="mt-1 text-sm text-math-silver">
            Escenario {indiceEscenario + 1} de {fase.escenarios.length}
          </p>
        </div>
        <EstrellasIndicador temaId={fase.temaId} />
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          <EscenarioTarjeta
            key={escenario.id}
            escenario={escenario}
            temaId={fase.temaId}
            onSiguiente={() => {
              if (esUltimo) onCompletar();
              else setIndiceEscenario((prev) => prev + 1);
            }}
            esUltimo={esUltimo}
          />
        </AnimatePresence>
      </CardContent>
    </Card>
  );
});

function EstrellasIndicador({ temaId }: { temaId: string }) {
  const estrellas = useProgressStore(
    (state) => state.estrellasExploracionPorTema[temaId] ?? ESTRELLAS_EXPLORACION_INICIALES,
  );
  return (
    <div className="flex shrink-0 gap-0.5 text-lg" title={`${estrellas} de ${ESTRELLAS_EXPLORACION_INICIALES} estrellas`}>
      {Array.from({ length: ESTRELLAS_EXPLORACION_INICIALES }, (_, i) => (
        <span key={i} className={i < estrellas ? 'text-math-gold' : 'text-math-silver/25'}>
          ★
        </span>
      ))}
    </div>
  );
}

interface EscenarioTarjetaProps {
  escenario: FaseExploracion['escenarios'][number];
  temaId: string;
  onSiguiente: () => void;
  esUltimo: boolean;
}

function EscenarioTarjeta({ escenario, temaId, onSiguiente, esUltimo }: EscenarioTarjetaProps) {
  const [respuesta, setRespuesta] = useState('');
  const [nivelPista, setNivelPista] = useState(0);
  const [mostrarExplicacion, setMostrarExplicacion] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(escenario.tiempoLimiteSeg || TIEMPO_LIMITE_DEFECTO);
  const descontarEstrella = useProgressStore((state) => state.descontarEstrellaExploracion);
  const { reproducir } = useNarrativeSound();

  const tiempoTotal = escenario.tiempoLimiteSeg || TIEMPO_LIMITE_DEFECTO;

  useEffect(() => {
    if (mostrarExplicacion) return undefined;
    const intervalo = window.setInterval(() => {
      setSegundosRestantes((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(intervalo);
  }, [mostrarExplicacion]);

  const pedirPista = useCallback(() => {
    if (nivelPista >= 3) return;
    setNivelPista((prev) => prev + 1);
    descontarEstrella(temaId);
    reproducir('tension');
  }, [nivelPista, descontarEstrella, temaId, reproducir]);

  const revelarExplicacion = useCallback(() => {
    setMostrarExplicacion(true);
    reproducir('logro');
  }, [reproducir]);

  const porcentajeTiempo = useMemo(
    () => Math.max(0, Math.min(100, (segundosRestantes / tiempoTotal) * 100)),
    [segundosRestantes, tiempoTotal],
  );

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-math-midnight">
          <motion.div
            className={cn('h-full rounded-full', porcentajeTiempo > 20 ? 'bg-math-cyan' : 'bg-math-gold')}
            animate={{ width: `${porcentajeTiempo}%` }}
            transition={{ duration: 0.6, ease: 'linear' }}
          />
        </div>
        <span className="shrink-0 font-mono text-xs text-math-silver">
          {Math.floor(segundosRestantes / 60)}:{(segundosRestantes % 60).toString().padStart(2, '0')}
        </span>
      </div>

      <p className="rounded-md border border-math-cyan/10 bg-math-navy/50 p-3 text-sm text-math-silver">
        {escenario.contexto}
      </p>
      <p className="font-display text-lg font-medium text-math-white">{escenario.pregunta}</p>

      {!mostrarExplicacion && (
        <textarea
          value={respuesta}
          onChange={(evento) => setRespuesta(evento.target.value)}
          rows={3}
          placeholder="Escribe tu respuesta y tu razonamiento..."
          className="w-full resize-none rounded-md border border-math-cyan/15 bg-math-midnight/80 px-3 py-2.5 text-sm text-math-white outline-none transition-colors placeholder:text-math-silver/40 focus:border-math-cyan/50"
        />
      )}

      <AnimatePresence>
        {nivelPista > 0 && !mostrarExplicacion && (
          <motion.div
            className="space-y-1.5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {escenario.pistas.slice(0, nivelPista).map((pista, i) => (
              <p key={i} className="rounded-md border border-math-gold/20 bg-math-gold/5 px-3 py-2 text-xs text-math-gold">
                💡 Pista {i + 1}: {pista}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {mostrarExplicacion && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 rounded-md border border-math-success/25 bg-math-success/10 p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-math-success">Explicación</p>
          <p className="text-sm text-math-white">{escenario.explicacion}</p>
        </motion.div>
      )}

      <div className="flex flex-wrap gap-2">
        {!mostrarExplicacion && (
          <Button variant="ghost" onClick={pedirPista} disabled={nivelPista >= 3}>
            💡 Pista ({nivelPista}/3)
          </Button>
        )}
        {!mostrarExplicacion ? (
          <Button className="flex-1" onClick={revelarExplicacion} disabled={!respuesta.trim()}>
            Ver explicación
          </Button>
        ) : (
          <Button className="flex-1" onClick={onSiguiente}>
            {esUltimo ? 'Ir a formalización' : 'Siguiente escenario'}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
