import { memo, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAreas, useGradosPorArea, useTemasPorGrado } from '@/hooks/useContent';
import { useContenidoCurricular } from '@/hooks/useContenidoCurricular';
import { useNavigation } from '@/hooks/useNavigation';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSessionStore } from '@/store/sessionStore';
import { PageTransition } from '@/components/PageTransition';
import { SelectionHeader } from '@/components/navigation/SelectionHeader';
import { TemaExpandableCard } from '@/components/selection/TemaExpandableCard';
import { EstandarSidePanel } from '@/components/selection/EstandarSidePanel';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { rutas } from '@/router/routes';
import type { AreaId } from '@/types';

function GradoPage() {
  const { areaId, gradoId } = useParams<{ areaId: string; gradoId: string }>();
  const { data: areasData } = useAreas();
  const { data: gradosData } = useGradosPorArea(areaId ?? null);
  const { data, isLoading } = useTemasPorGrado(gradoId ?? null);
  const { navegarA } = useNavigation();
  const setTema = useSessionStore((state) => state.setTema);

  const area = useMemo(() => areasData?.data.find((a) => a.id === areaId), [areasData, areaId]);
  const grado = useMemo(() => gradosData?.data.find((g) => g.id === gradoId), [gradosData, gradoId]);
  const temas = useMemo(() => data?.data ?? [], [data]);

  const { dba, estandares, loading: cargandoContenido } = useContenidoCurricular(
    (areaId as AreaId) ?? null,
    grado?.numero ?? null,
  );

  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const busquedaDebounced = useDebouncedValue(busqueda, 300);

  const temasFiltrados = useMemo(() => {
    const termino = busquedaDebounced.trim().toLowerCase();
    if (!termino) return temas;
    return temas.filter(
      (tema) =>
        tema.nombre.toLowerCase().includes(termino) ||
        tema.descripcion.toLowerCase().includes(termino),
    );
  }, [temas, busquedaDebounced]);

  const irANiveles = useCallback(
    (temaId: string) => {
      setTema(temaId);
      navegarA('tema', rutas.tema(areaId ?? '', gradoId ?? '', temaId));
    },
    [areaId, gradoId, navegarA, setTema],
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
        Temas de {grado ? `${grado.numero}°` : ''}
      </motion.h1>
      <p className="mt-2 text-math-silver">Elige el tema que quieres explorar.</p>

      <div className="relative mt-6 max-w-sm">
        <input
          type="search"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar tema..."
          className="w-full rounded-lg border border-math-cyan/15 bg-math-midnight/80 px-4 py-2.5 text-sm text-math-white placeholder:text-math-silver/50 outline-none transition-colors focus:border-math-cyan/50"
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {isLoading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}

          {!isLoading && temasFiltrados.length === 0 && (
            <p className="rounded-lg border border-math-cyan/10 bg-math-midnight/60 p-6 text-center text-sm text-math-silver">
              No se encontraron temas para "{busquedaDebounced}".
            </p>
          )}

          {temasFiltrados.map((tema, indice) => (
            <TemaExpandableCard
              key={tema.id}
              tema={tema}
              index={indice}
              expandido={expandidoId === tema.id}
              dba={dba}
              cargandoDba={cargandoContenido}
              onToggle={() => setExpandidoId((prev) => (prev === tema.id ? null : tema.id))}
              onExplorar={() => irANiveles(tema.id)}
            />
          ))}
        </div>

        <EstandarSidePanel estandares={estandares} cargando={cargandoContenido} className="hidden lg:block" />
      </div>
    </PageTransition>
  );
}

export default memo(GradoPage);
