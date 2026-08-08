import type { Nivel } from '@/types';

export type NivelTier = Nivel['dificultad'];

interface ConfigPortal {
  etiqueta: string;
  color: string;
  descripcion: string;
  preguntas: string;
  tiempoMin: number;
  pulso: 'suave' | 'medio' | 'energia';
}

export const CONFIG_PORTAL: Record<NivelTier, ConfigPortal> = {
  introductorio: {
    etiqueta: 'Básico',
    color: '#0891b2',
    descripcion: 'Conceptos fundamentales explicados paso a paso.',
    preguntas: 'Opción múltiple guiada',
    tiempoMin: 10,
    pulso: 'suave',
  },
  intermedio: {
    etiqueta: 'Medio',
    color: '#16a34a',
    descripcion: 'Aplica lo aprendido en problemas con mayor variedad.',
    preguntas: 'Respuesta abierta y arrastrar-soltar',
    tiempoMin: 15,
    pulso: 'medio',
  },
  avanzado: {
    etiqueta: 'Avanzado',
    color: '#d97706',
    descripcion: 'Retos de transferencia y pensamiento crítico.',
    preguntas: 'Fórmulas y justificación de procesos',
    tiempoMin: 22,
    pulso: 'energia',
  },
};
