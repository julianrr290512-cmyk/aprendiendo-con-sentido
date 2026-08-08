import type { AreaId, EstandarBC } from '@/types';

/**
 * Fallback local garantizado de Estandares Basicos de Competencias en Matematicas (MEN, 2006).
 *
 * IMPORTANTE - alcance real de este archivo:
 * El documento oficial agrupa los estandares por BANDAS de grado (1-3, 4-5, 6-7, 8-9, 10-11),
 * no por grado individual como los DBA. La estructura de 5 "pensamientos" y las 5 "competencias"
 * (procesos generales de la actividad matematica) que se listan abajo es de dominio publico y
 * ampliamente documentada. Los enunciados por pensamiento/banda son una seleccion representativa
 * (no el listado completo del documento de 2006) redactada para servir como fallback funcional;
 * valida contra el PDF oficial antes de tratarlos como cita textual completa.
 */

export const PENSAMIENTOS_MATEMATICOS = [
  'Pensamiento numerico y sistemas numericos',
  'Pensamiento espacial y sistemas geometricos',
  'Pensamiento metrico y sistemas de medidas',
  'Pensamiento aleatorio y sistemas de datos',
  'Pensamiento variacional y sistemas algebraicos y analiticos',
] as const;

export const COMPETENCIAS_MATEMATICAS = [
  'Formulacion, tratamiento y resolucion de problemas',
  'Modelacion',
  'Comunicacion',
  'Razonamiento',
  'Formulacion, comparacion y ejercitacion de procedimientos',
] as const;

const estandaresMatematicas: Record<string, EstandarBC[]> = {
  '1-3': [
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[0],
      grupoGrados: '1-3',
      enunciado:
        'Reconozco significados del numero en diferentes contextos (medicion, conteo, comparacion, codificacion, localizacion entre otros).',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[1],
      grupoGrados: '1-3',
      enunciado:
        'Reconozco nociones de horizontalidad, verticalidad, paralelismo y perpendicularidad en distintos contextos y su condicion relativa respecto a diferentes sistemas de referencia.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[2],
      grupoGrados: '1-3',
      enunciado: 'Reconozco en el entorno objetos que evidencian propiedades y transformaciones geometricas medibles.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[3],
      grupoGrados: '1-3',
      enunciado: 'Clasifico y organizo datos de acuerdo con cualidades y atributos, y los presento en tablas.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[4],
      grupoGrados: '1-3',
      enunciado: 'Describo cualitativamente situaciones de cambio y variacion utilizando el lenguaje natural, dibujos y graficas.',
    },
  ],
  '4-5': [
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[0],
      grupoGrados: '4-5',
      enunciado:
        'Interpreto las fracciones en diferentes contextos: situaciones de medicion, relaciones parte-todo, cociente, razones y proporciones.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[1],
      grupoGrados: '4-5',
      enunciado: 'Comparo y clasifico objetos tridimensionales de acuerdo con componentes (caras, lados, vertices) y propiedades.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[2],
      grupoGrados: '4-5',
      enunciado: 'Selecciono unidades, tanto convencionales como estandarizadas, apropiadas para diferentes mediciones.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[3],
      grupoGrados: '4-5',
      enunciado:
        'Interpreto informacion presentada en tablas y graficas (pictogramas, graficas de barras, diagramas de lineas, diagramas circulares).',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[4],
      grupoGrados: '4-5',
      enunciado: 'Predigo patrones de variacion en una secuencia numerica, geometrica o grafica.',
    },
  ],
  '6-7': [
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[0],
      grupoGrados: '6-7',
      enunciado:
        'Utilizo numeros racionales, en sus distintas expresiones (fracciones, razones, decimales o porcentajes), para resolver problemas en contextos de medida.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[1],
      grupoGrados: '6-7',
      enunciado:
        'Conjeturo y verifico propiedades de congruencias y semejanzas entre figuras bidimensionales y entre objetos tridimensionales en la solucion de problemas.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[2],
      grupoGrados: '6-7',
      enunciado:
        'Justifico relaciones de dependencia entre el area y el volumen, cuando se fija una de estas magnitudes en objetos bi y tridimensionales.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[3],
      grupoGrados: '6-7',
      enunciado:
        'Interpreto analitica y criticamente informacion estadistica proveniente de diversas fuentes (prensa, revistas, television, experimentos, consultas, entrevistas).',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[4],
      grupoGrados: '6-7',
      enunciado:
        'Reconozco y generalizo propiedades de las relaciones entre numeros racionales (aditiva, multiplicativa, de orden) y de las operaciones aritmeticas.',
    },
  ],
  '8-9': [
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[0],
      grupoGrados: '8-9',
      enunciado: 'Utilizo numeros reales para resolver problemas en contextos de medicion.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[1],
      grupoGrados: '8-9',
      enunciado: 'Aplico y justifico criterios de congruencia y semejanza entre triangulos en la resolucion y formulacion de problemas.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[2],
      grupoGrados: '8-9',
      enunciado: 'Generalizo procedimientos de calculo validos para encontrar el area de regiones planas y el volumen de solidos.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[3],
      grupoGrados: '8-9',
      enunciado: 'Reconozco como diferentes formas de presentar informacion pueden originar distintas interpretaciones.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[4],
      grupoGrados: '8-9',
      enunciado:
        'Analizo en representaciones graficas cartesianas los comportamientos de cambio de funciones polinomicas, racionales, exponenciales y logaritmicas.',
    },
  ],
  '10-11': [
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[0],
      grupoGrados: '10-11',
      enunciado: 'Establezco relaciones y diferencias entre diferentes notaciones de numeros reales para decidir sobre su uso en una situacion dada.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[1],
      grupoGrados: '10-11',
      enunciado: 'Uso argumentos geometricos para resolver y formular problemas en contextos matematicos y en otras ciencias.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[2],
      grupoGrados: '10-11',
      enunciado:
        'Selecciono y uso tecnicas e instrumentos para medir longitudes, areas de superficies, volumenes y angulos con niveles de precision apropiados.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[3],
      grupoGrados: '10-11',
      enunciado:
        'Interpreto y utilizo conceptos de media, mediana y moda, y diseno experimentos aleatorios para estudiar un problema o pregunta.',
    },
    {
      pensamiento: PENSAMIENTOS_MATEMATICOS[4],
      grupoGrados: '10-11',
      enunciado: 'Analizo las relaciones y propiedades entre las expresiones algebraicas y las graficas de funciones polinomicas y racionales.',
    },
  ],
};

export const estandaresLocal: Partial<Record<AreaId, Record<string, EstandarBC[]>>> = {
  matematicas: estandaresMatematicas,
};

const BANDAS_GRADO: Array<{ rango: [number, number]; banda: string }> = [
  { rango: [1, 3], banda: '1-3' },
  { rango: [4, 5], banda: '4-5' },
  { rango: [6, 7], banda: '6-7' },
  { rango: [8, 9], banda: '8-9' },
  { rango: [10, 11], banda: '10-11' },
];

export function gradoABanda(grado: number): string {
  const encontrada = BANDAS_GRADO.find(({ rango }) => grado >= rango[0] && grado <= rango[1]);
  return encontrada?.banda ?? '1-3';
}
