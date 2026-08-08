import { memo, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { areasFallback } from '@/data/areas';
import { gradosFallback, nivelesFallback, temasFallback } from '@/data/temas';
import { useContenidoCurricular } from '@/hooks/useContenidoCurricular';
import { useNarrativeSlides } from '@/hooks/useNarrativeSlides';
import { PageTransition } from '@/components/PageTransition';
import { NarrativeEngine } from '@/components/narrative/NarrativeEngine';
import { SoundPlayer } from '@/components/narrative/SoundPlayer';
import { FuenteContenidoBadge } from '@/components/ui/FuenteContenidoBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { rutas } from '@/router/routes';
import type { GenerarNarrativaParams } from '@/services/narrativeGenerator';

function PresentacionPage() {
  const { nivelId } = useParams<{ nivelId: string }>();
  const navigate = useNavigate();

  const nivel = nivelesFallback.find((n) => n.id === nivelId);
  const tema = temasFallback.find((t) => t.id === nivel?.temaId);
  const grado = gradosFallback.find((g) => g.id === tema?.gradoId);
  const area = areasFallback.find((a) => a.id === tema?.areaId);

  const { dba, estandares } = useContenidoCurricular(tema?.areaId ?? null, grado?.numero ?? null);

  const parametros: GenerarNarrativaParams | null = useMemo(() => {
    if (!nivel || !tema || !grado) return null;
    return {
      temaId: tema.id,
      temaNombre: tema.nombre,
      areaId: tema.areaId,
      grado: grado.numero,
      nivelNombre: nivel.nombre,
      dificultad: nivel.dificultad,
      dbaTexto: dba?.dba ?? [],
      estandarTexto: estandares?.estandares[0]?.enunciado ?? '',
    };
  }, [nivel, tema, grado, dba, estandares]);

  const { data, isLoading } = useNarrativeSlides(parametros);

  if (!nivel || !tema) {
    return (
      <PageTransition className="p-6 text-center text-muted-foreground">
        Presentación no disponible.
      </PageTransition>
    );
  }

  return (
    <PageTransition className="relative min-h-screen">
      <div className="relative flex items-center justify-between p-4">
        {data && <FuenteContenidoBadge fuente={data.fuente} />}
        <div className="ml-auto">
          <SoundPlayer />
        </div>
      </div>

      {isLoading || !data ? (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <NarrativeEngine
          slides={data.slides}
          areaId={area?.id}
          onCompletado={() => navigate(rutas.fases(nivelId ?? ''))}
        />
      )}
    </PageTransition>
  );
}

export default memo(PresentacionPage);
