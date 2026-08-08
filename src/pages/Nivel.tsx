import { memo, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { areasFallback } from '@/data/areas';
import { gradosFallback, nivelesFallback, temasFallback } from '@/data/temas';
import { useNavigation } from '@/hooks/useNavigation';
import { PageTransition } from '@/components/PageTransition';
import { SelectionHeader } from '@/components/navigation/SelectionHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { rutas } from '@/router/routes';

function NivelPage() {
  const { nivelId } = useParams<{ nivelId: string }>();
  const { prefetchRoute } = useNavigation();
  const nivel = nivelesFallback.find((n) => n.id === nivelId);
  const tema = temasFallback.find((t) => t.id === nivel?.temaId);
  const grado = gradosFallback.find((g) => g.id === tema?.gradoId);
  const area = areasFallback.find((a) => a.id === tema?.areaId);

  const breadcrumbItems = useMemo(
    () => [
      { label: 'Inicio', to: '/' },
      ...(area ? [{ label: area.nombre, to: rutas.area(area.id) }] : []),
      ...(grado && area ? [{ label: `Grado ${grado.numero}°`, to: rutas.grado(area.id, grado.id) }] : []),
      ...(tema && area && grado
        ? [{ label: tema.nombre, to: `/area/${area.id}/grado/${grado.id}/tema/${tema.id}` }]
        : []),
      { label: nivel?.nombre ?? 'Nivel' },
    ],
    [area, grado, tema, nivel],
  );

  if (!nivel) {
    return (
      <PageTransition className="p-6 text-center text-muted-foreground">
        Nivel no encontrado.
      </PageTransition>
    );
  }

  return (
    <PageTransition className="relative mx-auto min-h-screen max-w-2xl px-6 py-10">
      <SelectionHeader step={4} items={breadcrumbItems} />

      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>{nivel.nombre}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc space-y-1 pl-5 text-sm text-math-silver">
              {nivel.objetivos.map((objetivo) => (
                <li key={objetivo}>{objetivo}</li>
              ))}
            </ul>

            <Link to={rutas.presentacion(nivel.id)} onMouseEnter={() => prefetchRoute('presentacion')}>
              <Button className="w-full">Comenzar</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </PageTransition>
  );
}

export default memo(NivelPage);
