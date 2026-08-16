import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAreas } from '@/hooks/useContent';
import { useNavigation } from '@/hooks/useNavigation';
import { useSessionStore } from '@/store/sessionStore';
import { PageTransition } from '@/components/PageTransition';
import { AreaCard } from '@/components/selection/AreaCard';
import { OrbitingParticles } from '@/components/effects/OrbitingParticles';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { rutas } from '@/router/routes';
import type { Area } from '@/types';

const DEMORA_LOGO_MS = 150;
const DEMORA_RESOLUCION_MS = 1100;
const DEMORA_NAVEGACION_MS = 420;

function InicioPage() {
  const { data, isLoading } = useAreas();
  const { navegarA, prefetchRoute } = useNavigation();
  const setArea = useSessionStore((state) => state.setArea);
  const areas = useMemo(() => data?.data ?? [], [data]);

  const [logoListo, setLogoListo] = useState(false);
  const [resuelto, setResuelto] = useState(false);
  const [areaSeleccionada, setAreaSeleccionada] = useState<Area | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const navegacionTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const t1 = window.setTimeout(() => setLogoListo(true), DEMORA_LOGO_MS);
    const t2 = window.setTimeout(() => setResuelto(true), DEMORA_LOGO_MS + DEMORA_RESOLUCION_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  useEffect(() => () => window.clearTimeout(navegacionTimer.current), []);

  const irAAreas = useCallback(() => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const seleccionarArea = useCallback(
    (area: Area) => {
      if (areaSeleccionada) return;
      setAreaSeleccionada(area);
      setArea(area.id);
      navegacionTimer.current = window.setTimeout(() => {
        navegarA('grado', rutas.grado(area.id));
      }, DEMORA_NAVEGACION_MS);
    },
    [areaSeleccionada, navegarA, setArea],
  );

  return (
    <PageTransition className="relative min-h-screen overflow-hidden">
      <section className="relative mx-auto flex min-h-[92vh] max-w-4xl flex-col items-center justify-center px-6 text-center">
        {!logoListo ? (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-80 max-w-full" />
            <Skeleton className="h-5 w-56" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!resuelto ? (
              <motion.h1
                key="ecuacion"
                className="font-math text-3xl font-semibold text-math-cyan sm:text-4xl"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(6px)' }}
                transition={{ duration: 0.4 }}
              >
                ∑(aprendizaje × sentido) = 🎓
              </motion.h1>
            ) : (
              <motion.h1
                key="titulo"
                className="font-display text-4xl font-bold sm:text-5xl"
                initial={{ opacity: 0, scale: 0.92, filter: 'blur(6px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                Aprendiendo con Sentido
              </motion.h1>
            )}
          </AnimatePresence>
        )}

        <motion.p
          className="mt-4 text-lg text-math-silver"
          initial={{ opacity: 0 }}
          animate={{ opacity: resuelto ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Matemáticas que cobran vida
        </motion.p>

        <motion.div
          className="relative mt-12 flex items-center justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: resuelto ? 1 : 0, y: resuelto ? 0 : 16 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="pointer-events-none absolute -inset-24">
            <OrbitingParticles />
          </div>

          <motion.div
            animate={{
              boxShadow: [
                '0 0 0px rgba(8,145,178,0.0)',
                '0 0 28px rgba(8,145,178,0.45)',
                '0 0 0px rgba(8,145,178,0.0)',
              ],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-lg"
          >
            <Button size="lg" variant="primary" className="px-10 text-base" onClick={irAAreas}>
              Comenzar
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <section ref={gridRef} className="relative mx-auto max-w-4xl px-6 pb-24">
        <motion.h2
          className="text-center font-display text-2xl font-semibold text-math-white"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
        >
          Elige un área para comenzar
        </motion.h2>
        <p className="mt-2 text-center text-sm text-math-silver">
          Elige un grado y un tema, y la IA te da una explicación a tu medida: analogías, fórmulas,
          gráficas y ejercicios de práctica.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}

          {areas.map((area, indice) => (
            <AreaCard
              key={area.id}
              area={area}
              index={indice}
              estadoSeleccion={
                !areaSeleccionada
                  ? 'idle'
                  : areaSeleccionada.id === area.id
                    ? 'seleccionada'
                    : 'desvanecida'
              }
              onSelect={seleccionarArea}
              onHoverPrefetch={() => prefetchRoute('grado')}
            />
          ))}
        </div>
      </section>
    </PageTransition>
  );
}

export default memo(InicioPage);
