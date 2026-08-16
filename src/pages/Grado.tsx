import { memo, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAreas } from '@/hooks/useContent';
import { useNavigation } from '@/hooks/useNavigation';
import { useSessionStore } from '@/store/sessionStore';
import { PageTransition } from '@/components/PageTransition';
import { SelectionHeader } from '@/components/navigation/SelectionHeader';
import { GradoGrid } from '@/components/selection/GradoGrid';
import { rutas } from '@/router/routes';
import type { AreaId, GradoId } from '@/types';

function GradoPage() {
  const { areaId } = useParams<{ areaId: AreaId }>();
  const { data: areasData } = useAreas();
  const { navegarA } = useNavigation();
  const setGrado = useSessionStore((state) => state.setGrado);

  const area = useMemo(
    () => areasData?.data.find((a) => a.id === areaId),
    [areasData, areaId],
  );

  const irATema = useCallback(
    (gradoId: GradoId) => {
      if (!areaId) return;
      setGrado(gradoId);
      navegarA('tema', rutas.tema(areaId, gradoId));
    },
    [areaId, setGrado, navegarA],
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
        ¿En qué grado estás? Esto le da contexto a la IA para adaptar el nivel de la explicación.
      </motion.p>

      <div className="mt-8">
        {areaId ? (
          <GradoGrid onSeleccionar={irATema} />
        ) : (
          <div className="h-40 animate-pulse rounded-lg bg-math-midnight/60" />
        )}
      </div>
    </PageTransition>
  );
}

export default memo(GradoPage);
