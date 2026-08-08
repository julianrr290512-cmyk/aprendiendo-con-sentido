import { lazy } from 'react';

export const routeComponents = {
  inicio: lazy(() => import('@/pages/Inicio')),
  area: lazy(() => import('@/pages/Area')),
  grado: lazy(() => import('@/pages/Grado')),
  tema: lazy(() => import('@/pages/Tema')),
  nivel: lazy(() => import('@/pages/Nivel')),
  presentacion: lazy(() => import('@/pages/Presentacion')),
  fases: lazy(() => import('@/pages/Fases')),
  ejercicios: lazy(() => import('@/pages/Ejercicios')),
  resultados: lazy(() => import('@/pages/Resultados')),
} as const;

export type RouteName = keyof typeof routeComponents;

export const routePrefetchers: Record<RouteName, () => Promise<unknown>> = {
  inicio: () => import('@/pages/Inicio'),
  area: () => import('@/pages/Area'),
  grado: () => import('@/pages/Grado'),
  tema: () => import('@/pages/Tema'),
  nivel: () => import('@/pages/Nivel'),
  presentacion: () => import('@/pages/Presentacion'),
  fases: () => import('@/pages/Fases'),
  ejercicios: () => import('@/pages/Ejercicios'),
  resultados: () => import('@/pages/Resultados'),
};

export const rutas = {
  inicio: () => '/',
  area: (areaId: string) => `/area/${areaId}`,
  grado: (areaId: string, gradoId: string) => `/area/${areaId}/grado/${gradoId}`,
  tema: (areaId: string, gradoId: string, temaId: string) =>
    `/area/${areaId}/grado/${gradoId}/tema/${temaId}`,
  nivel: (temaId: string, nivelId: string) => `/tema/${temaId}/nivel/${nivelId}`,
  presentacion: (nivelId: string) => `/nivel/${nivelId}/presentacion`,
  fases: (nivelId: string) => `/nivel/${nivelId}/fases`,
  ejercicios: (nivelId: string) => `/nivel/${nivelId}/ejercicios`,
  resultados: (nivelId: string) => `/nivel/${nivelId}/resultados`,
} as const;
