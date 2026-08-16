import { memo, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAreas } from '@/hooks/useContent';
import { useNavigation } from '@/hooks/useNavigation';
import { useSessionStore } from '@/store/sessionStore';
import { PageTransition } from '@/components/PageTransition';
import { SelectionHeader } from '@/components/navigation/SelectionHeader';
import { BuscadorTema } from '@/components/selection/BuscadorTema';
import { rutas } from '@/router/routes';
import { construirTemaId } from '@/utils/slugify';
import type { AreaId, GradoId } from '@/types';

function TemaPage() {
  const { areaId, gradoId } = useParams<{ areaId: AreaId; gradoId: GradoId }>();
  const { data: areasData } = useAreas();
  const { navegarA } = useNavigation();
  const setArea = useSessionStore((state) => state.setArea);
  const setGrado = useSessionStore((state) => state.setGrado);
  const setTema = useSessionStore((state) => state.setTema);

  const area = useMemo(
    () => areasData?.data.find((a) => a.id === areaId),
    [areasData, areaId],
  );

  // Defensivo: asegura que el area/grado de la sesion coincidan con la URL,
  // incluso si se llega directo a esta pagina (recarga, enlace compartido).
  useEffect(() => {
    if (areaId) setArea(areaId);
    if (gradoId) setGrado(gradoId);
  }, [areaId, gradoId, setArea, setGrado]);

  const irAExplicacion = useCallback(
    (temaNombre: string, descripcion: string) => {
      if (!areaId) return;
      const temaId = construirTemaId({ areaId, temaNombre });
      setTema({ temaId, temaNombre, descripcion });
      navegarA('explicacion', rutas.explicacion(temaId));
    },
    [areaId, setTema, navegarA],
  );

  return (
    <PageTransition className="relative mx-auto min-h-screen max-w-4xl px-6 py-10">
      <SelectionHeader
        step={2}
        items={[
          { label: 'Inicio', to: '/' },
          { label: area?.nombre ?? 'Área', to: areaId ? rutas.grado(areaId) : undefined },
          { label: gradoId ? `Grado ${gradoId}°` : 'Grado' },
        ]}
      />

      <motion.h1
        className="mt-8 font-display text-3xl font-bold capitalize"
        style={area ? { color: area.color } : undefined}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        ¿Qué tema quieres ver?
      </motion.h1>
      <motion.p
        className="mt-2 text-math-silver"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        Escribe cualquier tema del área o elige una sugerencia, y cuéntanos en qué te quieres
        enfocar para que la IA te dé una explicación a tu medida.
      </motion.p>

      <div className="mt-8">
        {areaId ? (
          <BuscadorTema areaId={areaId} onSeleccionar={irAExplicacion} />
        ) : (
          <div className="h-40 animate-pulse rounded-lg bg-math-midnight/60" />
        )}
      </div>
    </PageTransition>
  );
}

export default memo(TemaPage);
