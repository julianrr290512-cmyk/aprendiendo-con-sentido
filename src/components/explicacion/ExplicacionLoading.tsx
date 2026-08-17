import { memo, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Skeleton, SkeletonText, SkeletonFormula, SkeletonCard } from '@/components/ui/Skeleton';

const MENSAJES = [
  'Analizando el tema...',
  'Buscando analogías de la vida real...',
  'Construyendo las fórmulas...',
  'Preparando los ejercicios de práctica...',
];

const MS_POR_MENSAJE = 3500;

/**
 * Pantalla de espera mientras la IA genera la explicacion (normalmente 15-20s).
 * Imita la estructura real del contenido (Card + resumen + formula + analogias +
 * ejercicios) y rota mensajes para dejar claro que sigue trabajando, no colgada.
 */
export const ExplicacionLoading = memo(function ExplicacionLoading() {
  const [indiceMensaje, setIndiceMensaje] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndiceMensaje((indice) => (indice + 1) % MENSAJES.length);
    }, MS_POR_MENSAJE);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-6 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={indiceMensaje}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-medium text-math-cyan"
          >
            {MENSAJES[indiceMensaje]}
          </motion.p>
        </AnimatePresence>
        <p className="text-xs text-math-silver">La IA suele tardar unos 15-20 segundos.</p>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-6">
          <SkeletonText lineas={4} />
          <SkeletonFormula />
          <div className="space-y-3">
            <Skeleton className="h-3 w-40" />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
