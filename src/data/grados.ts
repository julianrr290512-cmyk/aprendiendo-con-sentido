import type { Grado } from '@/types';

/**
 * Grados disponibles (6to a 11mo): solo se usan como contexto para la IA al
 * generar la explicacion, no cargan contenido propio ni cambian la UI.
 */
export const gradosDisponibles: Grado[] = [
  { id: '6', nombre: '6°' },
  { id: '7', nombre: '7°' },
  { id: '8', nombre: '8°' },
  { id: '9', nombre: '9°' },
  { id: '10', nombre: '10°' },
  { id: '11', nombre: '11°' },
];
