import { lazy } from 'react';

export const routeComponents = {
  inicio: lazy(() => import('@/pages/Inicio')),
  area: lazy(() => import('@/pages/Area')),
  experiencia: lazy(() => import('@/pages/Experiencia')),
  resultados: lazy(() => import('@/pages/Resultados')),
} as const;

export type RouteName = keyof typeof routeComponents;

export const routePrefetchers: Record<RouteName, () => Promise<unknown>> = {
  inicio: () => import('@/pages/Inicio'),
  area: () => import('@/pages/Area'),
  experiencia: () => import('@/pages/Experiencia'),
  resultados: () => import('@/pages/Resultados'),
};

export const rutas = {
  inicio: () => '/',
  area: (areaId: string) => `/area/${areaId}`,
  experiencia: (temaId: string) => `/experiencia/${temaId}`,
  resultados: (temaId: string) => `/resultados/${temaId}`,
} as const;
