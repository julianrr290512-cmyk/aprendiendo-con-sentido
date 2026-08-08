import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useProgressStore } from '@/store/progressStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { rutas } from '@/router/routes';

function ResultadosPage() {
  const { nivelId } = useParams<{ nivelId: string }>();
  const resultado = useProgressStore((state) =>
    nivelId ? state.resultadosPorNivel[nivelId] : undefined,
  );

  if (!resultado) {
    return <div className="p-6 text-center text-muted-foreground">Aun no hay resultados para este nivel.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Resultados del nivel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-math-silver">
              <span>Puntaje: {resultado.puntajeTotal} / {resultado.puntajeMaximo}</span>
              <span className="font-mono">{resultado.porcentaje}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-math-midnight">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-math-cyan to-math-gold"
                initial={{ width: 0 }}
                animate={{ width: `${resultado.porcentaje}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Fases completadas:{' '}
            {resultado.fasesCompletadas.length ? (
              resultado.fasesCompletadas.map((fase) => (
                <Badge key={fase} variant="cyan" className="mr-1">
                  {fase}
                </Badge>
              ))
            ) : (
              'ninguna'
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            Tiempo total: {Math.round(resultado.tiempoTotalMs / 1000)}s
          </p>

          <Link to={rutas.inicio()}>
            <Button className="w-full">Volver al inicio</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(ResultadosPage);
