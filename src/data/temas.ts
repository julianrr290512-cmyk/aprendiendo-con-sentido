import type { Grado, Nivel, Tema } from '@/types';

export const gradosFallback: Grado[] = [
  {
    id: 'grado-9-mat',
    numero: 9,
    nombre: 'Noveno',
    areaId: 'matematicas',
    temasIds: ['tema-derivada-intro'],
  },
];

export const temasFallback: Tema[] = [
  {
    id: 'tema-derivada-intro',
    nombre: 'Introduccion a la derivada',
    descripcion: 'La derivada como razon de cambio instantanea.',
    gradoId: 'grado-9-mat',
    areaId: 'matematicas',
    dbaIds: ['dba-mat-9-1'],
    estandarIds: ['est-mat-8-9-1'],
    nivelesIds: ['nivel-derivada-1'],
    duracionEstimadaMin: 35,
  },
];

export const nivelesFallback: Nivel[] = [
  {
    id: 'nivel-derivada-1',
    numero: 1,
    nombre: 'La velocidad instantanea',
    temaId: 'tema-derivada-intro',
    dificultad: 'introductorio',
    objetivos: [
      'Comprender la razon de cambio promedio.',
      'Aproximar la razon de cambio instantanea.',
    ],
    presentacionId: 'presentacion-derivada-1',
  },
];
