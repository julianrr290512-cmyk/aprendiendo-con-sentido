import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useProgressStore } from '@/store/progressStore';
import { useSessionStore } from '@/store/sessionStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { rutas } from '@/router/routes';

function ResultadosPage() {
  const { temaId } = useParams<{ temaId: string }>();
  const resultado = useProgressStore((state) =>
    temaId ? state.resultadosPorTema[temaId] : undefined,
  );
  const areaActualId = useSessionStore((state) => state.sesion.areaActualId);

  if (!resultado) {
    return <div className="p-6 text-center text-muted-foreground">Aun no hay resultados para este tema.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Resultados de la sesión</CardTitle>
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
            Tiempo total: {Math.round(resultado.tiempoTotalMs / 1000)}s
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Retroalimentación por ejercicio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {resultado.respuestas.map((respuesta, indice) => (
            <div
              key={respuesta.ejercicioId}
              className="flex items-center justify-between gap-3 rounded-md border border-math-cyan/10 bg-math-navy/40 px-3 py-2"
            >
              <span className="text-sm text-math-white">Ejercicio {indice + 1}</span>
              <Badge variant={respuesta.esCorrecta ? 'success' : 'error'}>
                {respuesta.esCorrecta ? 'Correcto' : 'Por mejorar'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {areaActualId && (
          <Link to={rutas.area(areaActualId)} className="flex-1">
            <Button className="w-full">Elegir otro tema</Button>
          </Link>
        )}
        <Link to={rutas.inicio()} className="flex-1">
          <Button variant="ghost" className="w-full">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}

export default memo(ResultadosPage);
