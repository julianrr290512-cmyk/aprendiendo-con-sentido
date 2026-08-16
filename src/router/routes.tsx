import { lazy } from 'react';

export const routeComponents = {
  inicio: lazy(() => import('@/pages/Inicio')),
  grado: lazy(() => import('@/pages/Grado')),
  tema: lazy(() => import('@/pages/Tema')),
  explicacion: lazy(() => import('@/pages/Explicacion')),
} as const;

export type RouteName = keyof typeof routeComponents;

export const routePrefetchers: Record<RouteName, () => Promise<unknown>> = {
  inicio: () => import('@/pages/Inicio'),
  grado: () => import('@/pages/Grado'),
  tema: () => import('@/pages/Tema'),
  explicacion: () => import('@/pages/Explicacion'),
};

export const rutas = {
  inicio: () => '/',
  grado: (areaId: string) => `/area/${areaId}`,
  tema: (areaId: string, gradoId: string) => `/area/${areaId}/${gradoId}`,
  explicacion: (temaId: string) => `/explicacion/${temaId}`,
} as const;
