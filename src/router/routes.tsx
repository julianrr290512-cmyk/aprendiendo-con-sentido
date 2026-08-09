import { lazy } from 'react';

export const routeComponents = {
  inicio: lazy(() => import('@/pages/Inicio')),
  area: lazy(() => import('@/pages/Area')),
  grado: lazy(() => import('@/pages/Grado')),
  tema: lazy(() => import('@/pages/Tema')),
  experiencia: lazy(() => import('@/pages/Experiencia')),
  resultados: lazy(() => import('@/pages/Resultados')),
} as const;

export type RouteName = keyof typeof routeComponents;

export const routePrefetchers: Record<RouteName, () => Promise<unknown>> = {
  inicio: () => import('@/pages/Inicio'),
  area: () => import('@/pages/Area'),
  grado: () => import('@/pages/Grado'),
  tema: () => import('@/pages/Tema'),
  experiencia: () => import('@/pages/Experiencia'),
  resultados: () => import('@/pages/Resultados'),
};

export const rutas = {
  inicio: () => '/',
  area: (areaId: string) => `/area/${areaId}`,
  grado: (areaId: string, gradoId: string) => `/area/${areaId}/grado/${gradoId}`,
  tema: (areaId: string, gradoId: string, temaId: string) =>
    `/area/${areaId}/grado/${gradoId}/tema/${temaId}`,
  experiencia: (nivelId: string) => `/experiencia/${nivelId}`,
  resultados: (nivelId: string) => `/nivel/${nivelId}/resultados`,
} as const;
