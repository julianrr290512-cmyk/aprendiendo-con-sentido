import { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { MathBackground } from '@/components/math/MathBackground';
import { routeComponents } from './routes';

const {
  inicio: Inicio,
  area: Area,
  grado: Grado,
  tema: Tema,
  nivel: Nivel,
  presentacion: Presentacion,
  fases: Fases,
  ejercicios: Ejercicios,
  resultados: Resultados,
} = routeComponents;

export function AppRoutes() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen">
      {/* Fondo unico y persistente: vive fuera de <Routes>, asi que nunca se desmonta ni
          re-renderiza al navegar entre paginas de seleccion. */}
      <div className="fixed inset-0 -z-10">
        <MathBackground cantidad={16} />
      </div>

      <Suspense fallback={<PageSkeleton />}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Inicio />} />
            <Route path="/area/:areaId" element={<Area />} />
            <Route path="/area/:areaId/grado/:gradoId" element={<Grado />} />
            <Route path="/area/:areaId/grado/:gradoId/tema/:temaId" element={<Tema />} />
            <Route path="/tema/:temaId/nivel/:nivelId" element={<Nivel />} />
            <Route path="/nivel/:nivelId/presentacion" element={<Presentacion />} />
            <Route path="/nivel/:nivelId/fases" element={<Fases />} />
            <Route path="/nivel/:nivelId/ejercicios" element={<Ejercicios />} />
            <Route path="/nivel/:nivelId/resultados" element={<Resultados />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}
