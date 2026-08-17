import { memo, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExplicacionGenerada } from '@/hooks/useExplicacion';
import { useSessionStore } from '@/store/sessionStore';
import { PageTransition } from '@/components/PageTransition';
import { ExplicacionView } from '@/components/explicacion/ExplicacionView';
import { ExplicacionLoading } from '@/components/explicacion/ExplicacionLoading';
import { SoundPlayer } from '@/components/narrative/SoundPlayer';
import { FuenteContenidoBadge } from '@/components/ui/FuenteContenidoBadge';
import type { GenerarExplicacionParams } from '@/services/explicacionGenerator';

function ExplicacionPage() {
  const { temaId } = useParams<{ temaId: string }>();
  const navigate = useNavigate();

  const sesion = useSessionStore((state) => state.sesion);

  const contextoCompleto =
    Boolean(temaId) &&
    Boolean(sesion.areaActualId) &&
    Boolean(sesion.gradoActualId) &&
    Boolean(sesion.temaNombreActual) &&
    sesion.temaActualId === temaId;

  useEffect(() => {
    if (!contextoCompleto) navigate('/');
  }, [contextoCompleto, navigate]);

  const parametros: GenerarExplicacionParams | null = useMemo(() => {
    if (!contextoCompleto || !sesion.areaActualId || !sesion.gradoActualId || !temaId) return null;
    return {
      temaId,
      temaNombre: sesion.temaNombreActual as string,
      areaId: sesion.areaActualId,
      gradoId: sesion.gradoActualId,
      descripcion: sesion.descripcionActual ?? '',
    };
  }, [contextoCompleto, sesion, temaId]);

  const explicacion = useExplicacionGenerada(parametros);

  if (!contextoCompleto) return null;

  return (
    <PageTransition className="relative min-h-screen">
      <div className="relative flex items-center justify-between p-4">
        {explicacion.data && <FuenteContenidoBadge fuente={explicacion.data.fuente} />}
        <div className="ml-auto">
          <SoundPlayer />
        </div>
      </div>

      {explicacion.isLoading || !explicacion.data ? (
        <ExplicacionLoading />
      ) : (
        <div className="px-6 pb-16">
          <ExplicacionView
            temaNombre={sesion.temaNombreActual as string}
            explicacion={explicacion.data}
          />
        </div>
      )}
    </PageTransition>
  );
}

export default memo(ExplicacionPage);
