import { memo, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAreas, useGradosPorArea } from '@/hooks/useContent';
import { useContenidoCurricular } from '@/hooks/useContenidoCurricular';
import { useNavigation } from '@/hooks/useNavigation';
import { useSessionStore } from '@/store/sessionStore';
import { PageTransition } from '@/components/PageTransition';
import { SelectionHeader } from '@/components/navigation/SelectionHeader';
import { BuscadorTema } from '@/components/selection/BuscadorTema';
import { EstandarSidePanel } from '@/components/selection/EstandarSidePanel';
import { rutas } from '@/router/routes';
import { construirTemaId } from '@/utils/slugify';
import type { AreaId } from '@/types';

function GradoPage() {
  const { areaId, gradoId } = useParams<{ areaId: string; gradoId: string }>();
  const { data: areasData } = useAreas();
  const { data: gradosData } = useGradosPorArea(areaId ?? null);
  const { navegarA } = useNavigation();
  const setGradoNumero = useSessionStore((state) => state.setGradoNumero);
  const elegirTema = useSessionStore((state) => state.elegirTema);

  const area = useMemo(() => areasData?.data.find((a) => a.id === areaId), [areasData, areaId]);
  const grado = useMemo(() => gradosData?.data.find((g) => g.id === gradoId), [gradosData, gradoId]);

  const { estandares, loading: cargandoContenido } = useContenidoCurricular(
    (areaId as AreaId) ?? null,
    grado?.numero ?? null,
  );

  const irAElegirDificultad = useCallback(
    (temaNombre: string) => {
      if (!areaId || !gradoId || !grado) return;
      const temaId = construirTemaId({ areaId: areaId as AreaId, grado: grado.numero, temaNombre });
      setGradoNumero(grado.numero);
      elegirTema({ temaId, temaNombre });
      navegarA('tema', rutas.tema(areaId, gradoId, temaId));
    },
    [areaId, gradoId, grado, setGradoNumero, elegirTema, navegarA],
  );

  return (
    <PageTransition className="relative mx-auto min-h-screen max-w-6xl px-6 py-10">
      <SelectionHeader
        step={2}
        items={[
          { label: 'Inicio', to: '/' },
          { label: area?.nombre ?? 'Área', to: `/area/${areaId}` },
          { label: grado ? `Grado ${grado.numero}°` : 'Grado' },
        ]}
      />

      <motion.h1
        className="mt-8 font-display text-3xl font-bold"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        ¿Qué tema quieres explorar en {grado ? `${grado.numero}°` : ''}?
      </motion.h1>
      <p className="mt-2 text-math-silver">
        Escribe cualquier tema del grado o elige una sugerencia — la ruta pedagógica se genera para
        el tema exacto que pidas.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {area && grado ? (
          <BuscadorTema
            areaId={area.id}
            gradoId={grado.id}
            gradoNumero={grado.numero}
            onSeleccionar={irAElegirDificultad}
          />
        ) : (
          <div className="h-40 animate-pulse rounded-lg bg-math-midnight/60" />
        )}

        <EstandarSidePanel estandares={estandares} cargando={cargandoContenido} className="hidden lg:block" />
      </div>
    </PageTransition>
  );
}

export default memo(GradoPage);
