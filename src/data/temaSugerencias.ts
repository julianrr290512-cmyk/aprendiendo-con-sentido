import type { AreaId } from '@/types';

export interface SugerenciaTema {
  texto: string;
  areaId: AreaId;
}

/**
 * Semillas de autosugerencia para el buscador de tema (BuscadorTema.tsx):
 * lista curada a mano, no viene de IA ni de un servicio. El docente siempre
 * puede escribir un tema distinto a estos (texto libre), esto solo agiliza
 * el caso comun de elegir un tema tipico del area, para un colegio de
 * desempeño alto (sin distincion por grado).
 */
export const temaSugerenciasFallback: SugerenciaTema[] = [
  // Matematicas
  { texto: 'Ecuaciones lineales', areaId: 'matematicas' },
  { texto: 'Factorizacion de polinomios', areaId: 'matematicas' },
  { texto: 'Plano cartesiano', areaId: 'matematicas' },
  { texto: 'Proporcionalidad directa e inversa', areaId: 'matematicas' },
  { texto: 'Potenciacion y radicacion', areaId: 'matematicas' },
  { texto: 'Teorema de Pitagoras', areaId: 'matematicas' },
  { texto: 'Sistemas de ecuaciones lineales', areaId: 'matematicas' },
  { texto: 'Funciones y su representacion grafica', areaId: 'matematicas' },
  { texto: 'Estadistica descriptiva', areaId: 'matematicas' },
  { texto: 'Desigualdades e inecuaciones', areaId: 'matematicas' },
  { texto: 'Introduccion a la derivada', areaId: 'matematicas' },
  { texto: 'Razones trigonometricas', areaId: 'matematicas' },
  { texto: 'Funciones trigonometricas', areaId: 'matematicas' },
  { texto: 'Geometria analitica: la recta', areaId: 'matematicas' },
  { texto: 'Vectores en el plano', areaId: 'matematicas' },
  { texto: 'Sucesiones y series', areaId: 'matematicas' },
  { texto: 'Numeros complejos', areaId: 'matematicas' },
  { texto: 'Limites de funciones', areaId: 'matematicas' },
  { texto: 'Derivadas y razon de cambio', areaId: 'matematicas' },
  { texto: 'Funciones exponenciales y logaritmicas', areaId: 'matematicas' },
  { texto: 'Introduccion a la integral', areaId: 'matematicas' },
  { texto: 'Probabilidad condicional', areaId: 'matematicas' },
  { texto: 'Estadistica inferencial', areaId: 'matematicas' },

  // Fisica
  { texto: 'Movimiento rectilineo uniforme', areaId: 'fisica' },
  { texto: 'Movimiento uniformemente acelerado', areaId: 'fisica' },
  { texto: 'Leyes de Newton', areaId: 'fisica' },
  { texto: 'Trabajo y potencia mecanica', areaId: 'fisica' },
  { texto: 'Energia cinetica y potencial', areaId: 'fisica' },
  { texto: 'Movimiento parabolico', areaId: 'fisica' },
  { texto: 'Movimiento circular uniforme', areaId: 'fisica' },
  { texto: 'Gravitacion universal', areaId: 'fisica' },
  { texto: 'Ondas mecanicas', areaId: 'fisica' },
  { texto: 'Estatica y equilibrio de cuerpos', areaId: 'fisica' },
  { texto: 'Reflexion y refraccion de la luz', areaId: 'fisica' },
  { texto: 'Circuitos electricos', areaId: 'fisica' },
  { texto: 'Campo electrico', areaId: 'fisica' },
  { texto: 'Campo magnetico', areaId: 'fisica' },
  { texto: 'Termodinamica basica', areaId: 'fisica' },
];
