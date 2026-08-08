import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAreas, useGradosPorArea, useNivelesPorTema, useTemasPorGrado } from '@/hooks/useContent';
import { useNavigation } from '@/hooks/useNavigation';
import { useSessionStore } from '@/store/sessionStore';
import { PageTransition } from '@/components/PageTransition';
import { SelectionHeader } from '@/components/navigation/SelectionHeader';
import { NivelPortal } from '@/components/selection/NivelPortal';
import type { NivelTier } from '@/components/selection/nivelPortalConfig';
import { Skeleton } from '@/components/ui/Skeleton';
import { rutas } from '@/router/routes';
import type { Nivel } from '@/types';

const TIERS: NivelTier[] = ['introductorio', 'intermedio', 'avanzado'];
const DEMORA_NAVEGACION_MS = 500;

function TemaPage() {
  const { areaId, gradoId, temaId } = useParams<{ areaId: string; gradoId: string; temaId: string }>();
  const { data: areasData } = useAreas();
  const { data: gradosData } = useGradosPorArea(areaId ?? null);
  const { data: temasData } = useTemasPorGrado(gradoId ?? null);
  const { data, isLoading } = useNivelesPorTema(temaId ?? null);
  const { navegarA } = useNavigation();
  const setNivel = useSessionStore((state) => state.setNivel);

  const area = useMemo(() => areasData?.data.find((a) => a.id === areaId), [areasData, areaId]);
  const grado = useMemo(() => gradosData?.data.find((g) => g.id === gradoId), [gradosData, gradoId]);
  const tema = useMemo(() => temasData?.data.find((t) => t.id === temaId), [temasData, temaId]);
  const niveles = useMemo(() => data?.data ?? [], [data]);

  const nivelPorTier = useMemo(() => {
    const mapa: Partial<Record<NivelTier, Nivel>> = {};
    for (const nivel of niveles) {
      mapa[nivel.dificultad] ??= nivel;
    }
    return mapa;
  }, [niveles]);

  const [portalActivo, setPortalActivo] = useState<string | null>(null);
  const navegacionTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(navegacionTimer.current), []);

  const entrarAlPortal = useCallback(
    (nivel: Nivel) => {
      if (portalActivo) return;
      setPortalActivo(nivel.id);
      setNivel(nivel.id);
      navegacionTimer.current = window.setTimeout(() => {
        navegarA('nivel', rutas.nivel(temaId ?? '', nivel.id));
      }, DEMORA_NAVEGACION_MS);
    },
    [navegarA, portalActivo, setNivel, temaId],
  );

  return (
    <PageTransition className="relative mx-auto min-h-screen max-w-5xl px-6 py-10">
      <SelectionHeader
        step={3}
        items={[
          { label: 'Inicio', to: '/' },
          { label: area?.nombre ?? 'Área', to: `/area/${areaId}` },
          { label: grado ? `Grado ${grado.numero}°` : 'Grado', to: `/area/${areaId}/grado/${gradoId}` },
          { label: tema?.nombre ?? 'Tema' },
        ]}
      />

      <motion.h1
        className="mt-8 text-center font-display text-3xl font-bold"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Elige tu nivel
      </motion.h1>
      <p className="mt-2 text-center text-math-silver">
        Cada portal te lleva a un desafío con dificultad distinta. Avanza a tu propio ritmo.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)
          : TIERS.map((tier, indice) => {
              const nivel = nivelPorTier[tier];
              const estado: 'idle' | 'entrando' | 'desvanecido' = !portalActivo
                ? 'idle'
                : nivel && portalActivo === nivel.id
                  ? 'entrando'
                  : 'desvanecido';

              return (
                <NivelPortal
                  key={tier}
                  tier={tier}
                  nivel={nivel}
                  estado={estado}
                  index={indice}
                  onEnter={entrarAlPortal}
                />
              );
            })}
      </div>
    </PageTransition>
  );
}

export default memo(TemaPage);
