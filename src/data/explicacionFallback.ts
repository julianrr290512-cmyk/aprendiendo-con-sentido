import type { ExplicacionGeneradaResult } from '@/types';
import type { GenerarExplicacionParams } from '@/services/explicacionGenerator';

/**
 * Contenido garantizado cuando la IA no esta disponible: mantiene la misma
 * forma que ExplicacionGeneradaResult (3 analogias, 1 formula, 2 ejercicios)
 * para que la UI nunca reciba datos incompletos.
 */
export function generarExplicacionFallback(
  params: GenerarExplicacionParams,
): Omit<ExplicacionGeneradaResult, 'fuente'> {
  const tema = params.temaNombre;

  return {
    resumen: `"${tema}" es un concepto que se puede entender conectando lo que ya sabes con una idea nueva: identifica primero qué cantidades intervienen y cómo se relacionan entre sí antes de aplicar cualquier fórmula.`,
    analogias: [
      {
        titulo: 'En un videojuego',
        texto: `Piensa en "${tema}" como las reglas de un videojuego: una vez entiendes el patrón, puedes predecir qué pasa antes de que ocurra en pantalla.`,
      },
      {
        titulo: 'En la cocina',
        texto: `"${tema}" funciona como seguir una receta: si cambias una cantidad, el resultado final cambia de forma predecible si conoces la relación entre los ingredientes.`,
      },
      {
        titulo: 'En el deporte',
        texto: `Así como un entrenador ajusta la estrategia según los datos del partido, "${tema}" te permite ajustar una decisión a partir de la información disponible.`,
      },
    ],
    formulasClave: [
      {
        id: 'formula-generica',
        nombre: tema,
        latex: 'a + b = c',
        explicacion: `Relación general que resume lo trabajado en "${tema}": cada letra representa una cantidad clave del problema.`,
      },
    ],
    graficas: [],
    ejercicios: [
      {
        id: `${params.temaId}-conceptual`,
        temaId: params.temaId,
        categoria: 'conceptual',
        tipo: 'respuesta-abierta',
        enunciado: `En tus propias palabras, ¿qué significa "${tema}"? Explica la idea central sin repetir la definición textual.`,
        retroalimentacionCorrecta: 'Buena explicación: capturaste la idea central con tus propias palabras.',
        retroalimentacionIncorrecta: 'Intenta explicarlo sin repetir la definición formal, como se lo dirías a un compañero.',
      },
      {
        id: `${params.temaId}-procedimental`,
        temaId: params.temaId,
        categoria: 'procedimental',
        tipo: 'respuesta-abierta',
        enunciado: `Aplica "${tema}" para resolver un caso concreto con datos numéricos. Muestra el procedimiento completo.`,
        retroalimentacionCorrecta: 'Correcto: aplicaste el procedimiento de forma adecuada.',
        retroalimentacionIncorrecta: 'Revisa el procedimiento paso a paso antes de llegar al resultado final.',
      },
    ],
  };
}
