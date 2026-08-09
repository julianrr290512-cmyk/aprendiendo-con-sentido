import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAreas, useGradosPorArea } from '@/hooks/useContent';
import { useNavigation } from '@/hooks/useNavigation';
import { useSessionStore } from '@/store/sessionStore';
import { PageTransition } from '@/components/PageTransition';
import { SelectionHeader } from '@/components/navigation/SelectionHeader';
import { NivelPortal } from '@/components/selection/NivelPortal';
import type { NivelTier } from '@/components/selection/nivelPortalConfig';
import { rutas } from '@/router/routes';
import { construirNivelId } from '@/utils/slugify';
import type { Nivel } from '@/types';

const TIERS: NivelTier[] = ['introductorio', 'intermedio', 'avanzado'];
const DEMORA_NAVEGACION_MS = 500;

function TemaPage() {
  const { areaId, gradoId, temaId } = useParams<{ areaId: string; gradoId: string; temaId: string }>();
  const navigate = useNavigate();
  const { data: areasData } = useAreas();
  const { data: gradosData } = useGradosPorArea(areaId ?? null);
  const { navegarA } = useNavigation();
  const sesion = useSessionStore((state) => state.sesion);
  const confirmarTema = useSessionStore((state) => state.confirmarTema);

  const area = useMemo(() => areasData?.data.find((a) => a.id === areaId), [areasData, areaId]);
  const grado = useMemo(() => gradosData?.data.find((g) => g.id === gradoId), [gradosData, gradoId]);
  const temaNombre = sesion.temaActualId === temaId ? sesion.temaNombreActual : null;

  useEffect(() => {
    if (!temaId || !temaNombre) navigate(rutas.grado(areaId ?? '', gradoId ?? ''));
  }, [temaId, temaNombre, areaId, gradoId, navigate]);

  const nivelesPorTier = useMemo<Partial<Record<NivelTier, Nivel>>>(() => {
    if (!temaId || !temaNombre) return {};
    const mapa: Partial<Record<NivelTier, Nivel>> = {};
    TIERS.forEach((tier) => {
      mapa[tier] = {
        id: construirNivelId(temaId, tier),
        numero: 1,
        nombre: temaNombre,
        temaId,
        dificultad: tier,
        objetivos: [],
        presentacionId: '',
      };
    });
    return mapa;
  }, [temaId, temaNombre]);

  const [portalActivo, setPortalActivo] = useState<string | null>(null);
  const navegacionTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(navegacionTimer.current), []);

  const entrarAlPortal = useCallback(
    (nivel: Nivel) => {
      if (portalActivo || !temaNombre) return;
      setPortalActivo(nivel.id);
      confirmarTema({
        temaId: nivel.temaId,
        temaNombre,
        dificultad: nivel.dificultad,
        nivelId: nivel.id,
      });
      navegacionTimer.current = window.setTimeout(() => {
        navegarA('experiencia', rutas.experiencia(nivel.id));
      }, DEMORA_NAVEGACION_MS);
    },
    [portalActivo, temaNombre, confirmarTema, navegarA],
  );

  return (
    <PageTransition className="relative mx-auto min-h-screen max-w-5xl px-6 py-10">
      <SelectionHeader
        step={3}
        items={[
          { label: 'Inicio', to: '/' },
          { label: area?.nombre ?? 'Área', to: `/area/${areaId}` },
          { label: grado ? `Grado ${grado.numero}°` : 'Grado', to: `/area/${areaId}/grado/${gradoId}` },
          { label: temaNombre ?? 'Tema' },
        ]}
      />

      <motion.h1
        className="mt-8 text-center font-display text-3xl font-bold"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Elige el nivel de profundidad
      </motion.h1>
      <p className="mt-2 text-center text-math-silver">
        {temaNombre ? `Para "${temaNombre}". ` : ''}
        Cada portal genera una ruta pedagógica completa con dificultad distinta.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {TIERS.map((tier, indice) => {
          const nivel = nivelesPorTier[tier];
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
