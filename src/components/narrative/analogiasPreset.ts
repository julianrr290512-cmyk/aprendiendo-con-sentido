import type { AreaId } from '@/types';

export interface Analogia {
  areaId: AreaId;
  icono: string;
  tituloConcepto: string;
  descripcionConcepto: string;
  tituloReal: string;
  descripcionReal: string;
  /** Palabra clave para la busqueda de imagen (Unsplash Source). */
  keywordImagen: string;
}

/**
 * Una analogia canonica por area, ambientada en contexto colombiano donde
 * aplica (futbol, cocina, arquitectura, naturaleza). Sirve como fallback
 * visual cuando un slide de tipo 'analogia' no trae su propia analogia.
 */
export const ANALOGIAS_PRESET: Record<AreaId, Analogia> = {
  matematicas: {
    areaId: 'matematicas',
    icono: '🍕',
    tituloConcepto: 'Fracciones',
    descripcionConcepto: 'Una fraccion divide un entero en partes iguales: 1/4 es una de cuatro partes.',
    tituloReal: 'Repartir una pizza',
    descripcionReal: 'Cuando divides una pizza entre amigos, cada porcion es una fraccion del total.',
    keywordImagen: 'pizza,slice',
  },
  geometria: {
    areaId: 'geometria',
    icono: '🏛️',
    tituloConcepto: 'Figuras y solidos',
    descripcionConcepto: 'Los angulos, simetrias y proporciones geometricas definen formas estables.',
    tituloReal: 'Arquitectura de edificios famosos',
    descripcionReal: 'Los arquitectos usan triangulos, circulos y proporciones para que un edificio se sostenga y sea bello.',
    keywordImagen: 'architecture,building',
  },
  estadistica: {
    areaId: 'estadistica',
    icono: '⚽',
    tituloConcepto: 'Datos y probabilidad',
    descripcionConcepto: 'La estadistica resume datos para encontrar patrones y estimar que tan probable es un evento.',
    tituloReal: 'Datos deportivos reales',
    descripcionReal: 'Los equipos de futbol usan estadisticas de goles, pases y distancia recorrida para tomar decisiones.',
    keywordImagen: 'soccer,stadium',
  },
  algebra: {
    areaId: 'algebra',
    icono: '🍲',
    tituloConcepto: 'Variables',
    descripcionConcepto: 'Una variable representa una cantidad que puede cambiar, como x o y en una ecuacion.',
    tituloReal: 'Recetas de cocina con cantidades variables',
    descripcionReal: 'Si duplicas una receta, cada ingrediente se multiplica por la misma variable: el numero de porciones.',
    keywordImagen: 'cooking,ingredients',
  },
  calculo: {
    areaId: 'calculo',
    icono: '🏃',
    tituloConcepto: 'Razon de cambio',
    descripcionConcepto: 'La derivada mide que tan rapido cambia una cantidad en un instante exacto.',
    tituloReal: 'Velocidad en una carrera atletica',
    descripcionReal: 'La velocidad de un corredor en el metro 50 es la razon de cambio de su posicion en ese instante.',
    keywordImagen: 'running,track',
  },
};
