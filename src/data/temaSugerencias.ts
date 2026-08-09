import type { AreaId } from '@/types';

export interface SugerenciaTema {
  texto: string;
  areaId: AreaId;
  grado: number;
}

/**
 * Semillas de autosugerencia para el buscador de tema (BuscadorTema.tsx):
 * lista curada a mano, no viene de IA ni de un servicio. El docente siempre
 * puede escribir un tema distinto a estos (texto libre), esto solo agiliza
 * el caso comun de elegir un tema tipico del grado.
 */
export const temaSugerenciasFallback: SugerenciaTema[] = [
  // Matematicas 8
  { texto: 'Ecuaciones lineales', areaId: 'matematicas', grado: 8 },
  { texto: 'Factorizacion de polinomios', areaId: 'matematicas', grado: 8 },
  { texto: 'Plano cartesiano', areaId: 'matematicas', grado: 8 },
  { texto: 'Proporcionalidad directa e inversa', areaId: 'matematicas', grado: 8 },
  { texto: 'Potenciacion y radicacion', areaId: 'matematicas', grado: 8 },
  { texto: 'Teorema de Pitagoras', areaId: 'matematicas', grado: 8 },

  // Matematicas 9
  { texto: 'Sistemas de ecuaciones lineales', areaId: 'matematicas', grado: 9 },
  { texto: 'Funciones y su representacion grafica', areaId: 'matematicas', grado: 9 },
  { texto: 'Factorizacion por agrupacion', areaId: 'matematicas', grado: 9 },
  { texto: 'Estadistica descriptiva', areaId: 'matematicas', grado: 9 },
  { texto: 'Desigualdades e inecuaciones', areaId: 'matematicas', grado: 9 },
  { texto: 'Introduccion a la derivada', areaId: 'matematicas', grado: 9 },

  // Matematicas 10
  { texto: 'Razones trigonometricas', areaId: 'matematicas', grado: 10 },
  { texto: 'Funciones trigonometricas', areaId: 'matematicas', grado: 10 },
  { texto: 'Geometria analitica: la recta', areaId: 'matematicas', grado: 10 },
  { texto: 'Vectores en el plano', areaId: 'matematicas', grado: 10 },
  { texto: 'Sucesiones y series', areaId: 'matematicas', grado: 10 },
  { texto: 'Numeros complejos', areaId: 'matematicas', grado: 10 },

  // Matematicas 11
  { texto: 'Limites de funciones', areaId: 'matematicas', grado: 11 },
  { texto: 'Derivadas y razon de cambio', areaId: 'matematicas', grado: 11 },
  { texto: 'Funciones exponenciales y logaritmicas', areaId: 'matematicas', grado: 11 },
  { texto: 'Introduccion a la integral', areaId: 'matematicas', grado: 11 },
  { texto: 'Probabilidad condicional', areaId: 'matematicas', grado: 11 },
  { texto: 'Estadistica inferencial', areaId: 'matematicas', grado: 11 },

  // Fisica 9
  { texto: 'Movimiento rectilineo uniforme', areaId: 'fisica', grado: 9 },
  { texto: 'Movimiento uniformemente acelerado', areaId: 'fisica', grado: 9 },
  { texto: 'Leyes de Newton', areaId: 'fisica', grado: 9 },
  { texto: 'Trabajo y potencia mecanica', areaId: 'fisica', grado: 9 },
  { texto: 'Energia cinetica y potencial', areaId: 'fisica', grado: 9 },

  // Fisica 10
  { texto: 'Movimiento parabolico', areaId: 'fisica', grado: 10 },
  { texto: 'Movimiento circular uniforme', areaId: 'fisica', grado: 10 },
  { texto: 'Gravitacion universal', areaId: 'fisica', grado: 10 },
  { texto: 'Ondas mecanicas', areaId: 'fisica', grado: 10 },
  { texto: 'Estatica y equilibrio de cuerpos', areaId: 'fisica', grado: 10 },

  // Fisica 11
  { texto: 'Reflexion y refraccion de la luz', areaId: 'fisica', grado: 11 },
  { texto: 'Circuitos electricos', areaId: 'fisica', grado: 11 },
  { texto: 'Campo electrico', areaId: 'fisica', grado: 11 },
  { texto: 'Campo magnetico', areaId: 'fisica', grado: 11 },
  { texto: 'Termodinamica basica', areaId: 'fisica', grado: 11 },
];
