import type { Area } from '@/types';

export const areasFallback: Area[] = [
  {
    id: 'matematicas',
    nombre: 'Matematicas',
    descripcion: 'Pensamiento numerico y variacional',
    icono: 'sigma',
    color: '#6366f1',
    gradosDisponibles: [6, 7, 8, 9, 10, 11],
  },
  {
    id: 'geometria',
    nombre: 'Geometria',
    descripcion: 'Pensamiento espacial y sistemas geometricos',
    icono: 'triangle',
    color: '#22c55e',
    gradosDisponibles: [6, 7, 8, 9, 10, 11],
  },
  {
    id: 'estadistica',
    nombre: 'Estadistica',
    descripcion: 'Pensamiento aleatorio y sistemas de datos',
    icono: 'bar-chart',
    color: '#f59e0b',
    gradosDisponibles: [6, 7, 8, 9, 10, 11],
  },
  {
    id: 'algebra',
    nombre: 'Algebra',
    descripcion: 'Pensamiento variacional y sistemas algebraicos',
    icono: 'function-square',
    color: '#ec4899',
    gradosDisponibles: [8, 9, 10, 11],
  },
  {
    id: 'calculo',
    nombre: 'Calculo',
    descripcion: 'Limites, derivadas e integrales',
    icono: 'infinity',
    color: '#0ea5e9',
    gradosDisponibles: [10, 11],
  },
  {
    id: 'fisica',
    nombre: 'Fisica',
    descripcion: 'Movimiento, fuerzas, energia y luz',
    icono: 'atom',
    color: '#f97316',
    gradosDisponibles: [9, 10, 11],
  },
];
