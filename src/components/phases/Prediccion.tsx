import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { FasePrediccion } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNarrativeSound } from '@/components/narrative/narrativeSoundEngine';
import { cn } from '@/utils/cn';

interface PrediccionProps {
  fase: FasePrediccion;
  /** Se llama una vez respondidas las 2 preguntas, con una respuesta por cada una. */
  onCompletar: (textos: string[]) => void;
}

function contarPalabras(texto: string): number {
  return texto.trim().length === 0 ? 0 : texto.trim().split(/\s+/).length;
}

export const Prediccion = memo(function Prediccion({ fase, onCompletar }: PrediccionProps) {
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<string[]>([]);
  const pregunta = fase.preguntas[indice];

  if (!pregunta) return null;

  const esUltima = indice === fase.preguntas.length - 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{fase.titulo}</CardTitle>
        <p className="mt-1 text-sm text-math-silver">
          Pregunta {indice + 1} de {fase.preguntas.length} · {fase.instrucciones}
        </p>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          <PreguntaTarjeta
            key={indice}
            pregunta={pregunta}
            esUltima={esUltima}
            onResponder={(texto) => {
              const siguientes = [...respuestas, texto];
              setRespuestas(siguientes);
              if (esUltima) onCompletar(siguientes);
              else setIndice((prev) => prev + 1);
            }}
          />
        </AnimatePresence>
      </CardContent>
    </Card>
  );
});

const DURACION_CAPSULA_MS = 1200;

interface PreguntaTarjetaProps {
  pregunta: FasePrediccion['preguntas'][number];
  esUltima: boolean;
  onResponder: (texto: string) => void;
}

function PreguntaTarjeta({ pregunta, esUltima, onResponder }: PreguntaTarjetaProps) {
  const [texto, setTexto] = useState('');
  const [guardando, setGuardando] = useState(false);
  const { reproducir } = useNarrativeSound();

  const palabras = useMemo(() => contarPalabras(texto), [texto]);
  const listo = palabras >= pregunta.minPalabras;

  const guardar = useCallback(() => {
    if (!listo || guardando) return;
    setGuardando(true);
    reproducir('descubrimiento');
    window.setTimeout(() => onResponder(texto.trim()), DURACION_CAPSULA_MS);
  }, [listo, guardando, reproducir, onResponder, texto]);

  useEffect(() => {
    setTexto('');
    setGuardando(false);
  }, [pregunta]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {guardando ? (
        <CapsulaDelTiempo palabras={palabras} esUltima={esUltima} />
      ) : (
        <>
          {pregunta.contexto && (
            <p className="rounded-md border border-math-cyan/10 bg-math-navy/50 p-3 text-sm text-math-silver">
              {pregunta.contexto}
            </p>
          )}
          <p className="font-display text-lg font-medium text-math-white">{pregunta.pregunta}</p>

          <div className="space-y-1.5">
            <textarea
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              rows={5}
              placeholder="Escribe tu hipótesis y explica tu razonamiento..."
              className="w-full resize-none rounded-md border border-math-cyan/15 bg-math-midnight/80 px-3 py-2.5 text-sm text-math-white outline-none transition-colors placeholder:text-math-silver/40 focus:border-math-cyan/50"
            />
            <div className="flex items-center justify-between text-xs">
              <span className={cn(listo ? 'text-math-success' : 'text-math-silver')}>
                {palabras} / {pregunta.minPalabras} palabras mínimas
              </span>
              <div className="h-1 w-32 overflow-hidden rounded-full bg-math-midnight">
                <motion.div
                  className={cn('h-full rounded-full', listo ? 'bg-math-success' : 'bg-math-cyan')}
                  animate={{ width: `${Math.min(100, (palabras / pregunta.minPalabras) * 100)}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          </div>

          <Button className="w-full" disabled={!listo} onClick={guardar}>
            Guardar mi predicción
          </Button>
        </>
      )}
    </motion.div>
  );
}

const PARTICULAS_CAPSULA = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  angulo: (i / 10) * Math.PI * 2,
}));

function CapsulaDelTiempo({ palabras, esUltima }: { palabras: number; esUltima: boolean }) {
  return (
    <motion.div
      className="relative flex flex-col items-center gap-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="relative flex h-28 w-28 items-center justify-center">
        {PARTICULAS_CAPSULA.map((p) => (
          <motion.span
            key={p.id}
            className="absolute h-1.5 w-1.5 rounded-full bg-math-gold"
            initial={{
              x: Math.cos(p.angulo) * 70,
              y: Math.sin(p.angulo) * 70,
              opacity: 1,
            }}
            animate={{ x: 0, y: 0, opacity: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeIn' }}
          />
        ))}

        <motion.div
          className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-math-gold bg-gradient-to-br from-math-gold/20 to-math-cyan/10 text-3xl"
          initial={{ scale: 0.6 }}
          animate={{ scale: [0.6, 1.15, 1], boxShadow: ['0 0 0px rgba(217,119,6,0)', '0 0 28px rgba(217,119,6,0.5)', '0 0 10px rgba(217,119,6,0.25)'] }}
          transition={{ duration: 0.8, delay: 0.5, times: [0, 0.6, 1] }}
        >
          ⏳
        </motion.div>
      </div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        <p className="font-display text-base font-semibold text-math-white">
          Tu predicción quedó guardada en una cápsula del tiempo
        </p>
        <p className="mt-1 text-xs text-math-silver">
          {palabras} palabras · {esUltima ? 'la abriremos en la formalización' : 'vamos con la siguiente pregunta'}
        </p>
      </motion.div>
    </motion.div>
  );
}
