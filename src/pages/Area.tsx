import { memo, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAreas, useGradosPorArea } from '@/hooks/useContent';
import { useNavigation } from '@/hooks/useNavigation';
import { useSessionStore } from '@/store/sessionStore';
import { PageTransition } from '@/components/PageTransition';
import { SelectionHeader } from '@/components/navigation/SelectionHeader';
import { GradoTimeline } from '@/components/selection/GradoTimeline';
import { Skeleton } from '@/components/ui/Skeleton';
import { rutas } from '@/router/routes';
import type { AreaId, Grado } from '@/types';

function AreaPage() {
  const { areaId } = useParams<{ areaId: AreaId }>();
  const { data: areasData } = useAreas();
  const { data, isLoading } = useGradosPorArea(areaId ?? null);
  const { navegarA } = useNavigation();
  const setGrado = useSessionStore((state) => state.setGrado);
  const grados = useMemo(() => data?.data ?? [], [data]);
  const area = useMemo(
    () => areasData?.data.find((a) => a.id === areaId),
    [areasData, areaId],
  );

  const seleccionarGrado = useCallback(
    (grado: Grado) => {
      setGrado(grado.id);
      navegarA('grado', rutas.grado(areaId ?? '', grado.id));
    },
    [areaId, navegarA, setGrado],
  );

  return (
    <PageTransition className="relative mx-auto min-h-screen max-w-4xl px-6 py-10">
      <SelectionHeader step={1} items={[{ label: 'Inicio', to: '/' }, { label: area?.nombre ?? 'Área' }]} />

      <motion.h1
        className="mt-8 font-display text-3xl font-bold capitalize"
        style={area ? { color: area.color } : undefined}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {area?.nombre ?? areaId}
      </motion.h1>
      <motion.p
        className="mt-2 text-math-silver"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        Selecciona el grado con el que quieres trabajar.
      </motion.p>

      <div className="mt-12">
        {isLoading ? (
          <div className="flex gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-16 shrink-0" />
            ))}
          </div>
        ) : (
          <GradoTimeline
            grados={grados}
            colorAcento={area?.color ?? '#0891b2'}
            onSelect={seleccionarGrado}
          />
        )}
      </div>
    </PageTransition>
  );
}

export default memo(AreaPage);
