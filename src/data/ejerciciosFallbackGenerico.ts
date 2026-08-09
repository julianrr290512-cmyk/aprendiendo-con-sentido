import type { Ejercicio, NivelBloom } from '@/types';

interface EjercicioPlantilla {
  nivelBloom: NivelBloom;
  esTransferencia: boolean;
  enunciado: (tema: string) => string;
  retroalimentacionCorrecta: string;
  retroalimentacionIncorrecta: string;
}

/**
 * 5 ejercicios genericos con progresion de Bloom (comprender -> crear), los
 * ultimos 2 de transferencia a otro contexto. Se usan como fallback local
 * cuando la IA no esta disponible, siguiendo el mismo patron que
 * generarPreguntaLocalFallback/generarEscenariosLocalFallback en
 * faseGenerator.ts: siempre garantizan contenido con la forma correcta.
 */
const PLANTILLAS: EjercicioPlantilla[] = [
  {
    nivelBloom: 'comprender',
    esTransferencia: false,
    enunciado: (tema) => `En tus propias palabras, ¿que significa "${tema}"? Explica la idea central sin usar la definicion textual.`,
    retroalimentacionCorrecta: 'Buena explicacion: capturaste la idea central con tus propias palabras.',
    retroalimentacionIncorrecta: 'Intenta explicarlo sin repetir la definicion formal, como se lo dirias a un companero.',
  },
  {
    nivelBloom: 'aplicar',
    esTransferencia: false,
    enunciado: (tema) => `Aplica "${tema}" para resolver un caso concreto con datos numericos. Muestra el procedimiento completo.`,
    retroalimentacionCorrecta: 'Correcto: aplicaste el procedimiento de forma adecuada.',
    retroalimentacionIncorrecta: 'Revisa el procedimiento paso a paso antes de llegar al resultado final.',
  },
  {
    nivelBloom: 'analizar',
    esTransferencia: false,
    enunciado: (tema) => `Compara dos situaciones donde aparece "${tema}" y explica en que se parecen y en que se diferencian.`,
    retroalimentacionCorrecta: 'Buen analisis: identificaste correctamente semejanzas y diferencias.',
    retroalimentacionIncorrecta: 'Enfocate en los elementos que cambian entre ambas situaciones y por que importan.',
  },
  {
    nivelBloom: 'evaluar',
    esTransferencia: true,
    enunciado: (tema) => `Un estudiante afirma que "${tema}" siempre se comporta igual sin importar el contexto. ¿Estas de acuerdo? Justifica con un ejemplo de un contexto distinto al trabajado en esta sesion.`,
    retroalimentacionCorrecta: 'Excelente: justificaste tu postura con un contraejemplo valido en otro contexto.',
    retroalimentacionIncorrecta: 'Piensa en un contexto distinto (otra area, otra situacion cotidiana) donde la afirmacion podria fallar.',
  },
  {
    nivelBloom: 'crear',
    esTransferencia: true,
    enunciado: (tema) => `Diseña una situacion nueva, en un contexto distinto al de esta sesion, donde se necesite usar "${tema}" para tomar una decision.`,
    retroalimentacionCorrecta: 'Muy buena transferencia: la situacion que creaste exige aplicar el concepto en un contexto nuevo.',
    retroalimentacionIncorrecta: 'Asegurate de que tu situacion sea de un contexto realmente distinto al ya trabajado.',
  },
];

export function generarEjerciciosFallbackGenerico(temaId: string, temaNombre: string): Ejercicio[] {
  return PLANTILLAS.map((plantilla, indice) => ({
    id: `${temaId}-ej-${indice + 1}`,
    temaId,
    tipo: 'respuesta-abierta',
    nivelBloom: plantilla.nivelBloom,
    esTransferencia: plantilla.esTransferencia,
    enunciado: plantilla.enunciado(temaNombre),
    retroalimentacionCorrecta: plantilla.retroalimentacionCorrecta,
    retroalimentacionIncorrecta: plantilla.retroalimentacionIncorrecta,
    puntaje: 10 + indice * 2,
  }));
}
