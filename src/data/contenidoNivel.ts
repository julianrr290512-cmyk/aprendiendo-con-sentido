import type {
  Ejercicio,
  FaseExploracion,
  FaseFormalizacion,
  FaseSimulacion,
  MapaTransferenciaItem,
  Presentacion,
} from '@/types';

export const presentacionesFallback: Record<string, Presentacion> = {
  'nivel-derivada-1': {
    id: 'presentacion-derivada-1',
    nivelId: 'nivel-derivada-1',
    titulo: 'La carrera de motos',
    personajeGuia: 'Ada',
    narrativa: [
      {
        id: 'beat-1',
        tipo: 'escena',
        texto: 'Dos motos compiten en una recta. Necesitas saber que tan rapido va cada una en cada instante.',
        duracionMs: 3200,
      },
      {
        id: 'beat-2',
        tipo: 'dialogo',
        texto: 'Ada: "La velocidad promedio no basta. Quiero saber la velocidad justo en este segundo."',
        duracionMs: 3600,
      },
      {
        id: 'beat-3',
        tipo: 'pregunta',
        texto: '¿Como crees que podriamos calcular la velocidad en un instante exacto?',
        duracionMs: 0,
      },
    ],
  },
};

export const fasesSimulacionFallback: Record<string, FaseSimulacion> = {
  'nivel-derivada-1': {
    id: 'fase-simulacion-1',
    tipo: 'simulacion',
    nivelId: 'nivel-derivada-1',
    titulo: 'Simulacion',
    instrucciones: 'Arrastra cada termino de la formula de posicion al lado correcto de la balanza.',
    completada: false,
    ordenIndex: 1,
    categoria: 'algebra',
    formulaLatex: 'x(t) = v \\cdot t + x_0',
    configAlgebra: {
      terminosDisponibles: [
        { id: 'vt', etiqueta: 'v · t (10)', simboloLatex: 'v \\cdot t', valor: 10 },
        { id: 'x0', etiqueta: 'x₀ (0)', simboloLatex: 'x_0', valor: 0 },
        { id: 'xt', etiqueta: 'x(t) (10)', simboloLatex: 'x(t)', valor: 10 },
      ],
    },
  },
};

/**
 * Los escenarios reales de exploracion los genera faseGenerator.ts (via IA o
 * su fallback local por temaId); aqui solo se define el envoltorio de la fase
 * (titulo/instrucciones) y `escenarios` queda vacio porque Fases.tsx siempre
 * lo reemplaza con el resultado de useEscenariosExploracion.
 */
export const fasesExploracionFallback: Record<string, FaseExploracion> = {
  'nivel-derivada-1': {
    id: 'fase-exploracion-1',
    tipo: 'exploracion',
    nivelId: 'nivel-derivada-1',
    titulo: 'Exploracion',
    instrucciones: 'Analiza cada escenario real y explica tu razonamiento antes de ver la explicacion.',
    completada: false,
    ordenIndex: 2,
    escenarios: [],
  },
};

export const fasesFormalizacionFallback: Record<string, FaseFormalizacion> = {
  'nivel-derivada-1': {
    id: 'fase-formalizacion-1',
    tipo: 'formalizacion',
    nivelId: 'nivel-derivada-1',
    titulo: 'Formalizacion',
    instrucciones: 'Revisa las formulas clave de esta sesion.',
    completada: false,
    ordenIndex: 3,
    resumen:
      'La derivada de una funcion posicion respecto al tiempo es la velocidad instantanea.',
    formulasClave: [
      {
        id: 'formula-derivada',
        nombre: 'Definicion de derivada',
        latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
        explicacion: 'La derivada es el limite de la tasa de cambio promedio cuando el intervalo tiende a cero.',
      },
    ],
  },
};

export const ejerciciosFallback: Record<string, Ejercicio[]> = {
  'nivel-derivada-1': [
    {
      id: 'ej-1',
      nivelId: 'nivel-derivada-1',
      tipo: 'opcion-multiple',
      enunciado: 'Si x(t) = 5t, ¿cual es la velocidad instantanea?',
      enunciadoLatex: 'x(t) = 5t',
      opciones: [
        { id: 'a', texto: '5', esCorrecta: true },
        { id: 'b', texto: 't', esCorrecta: false },
        { id: 'c', texto: '0', esCorrecta: false },
      ],
      retroalimentacionCorrecta: 'Correcto: la derivada de 5t respecto a t es 5.',
      retroalimentacionIncorrecta: 'Recuerda: la derivada de una funcion lineal es su pendiente.',
      puntaje: 10,
    },
  ],
};

export const mapaTransferenciaFallback: Record<string, MapaTransferenciaItem[]> = {
  'nivel-derivada-1': [
    {
      id: 'mt-1',
      concepto: 'Tasa de cambio instantanea',
      contextoOrigen: 'Velocidad de una moto',
      contextoDestino: 'Crecimiento de una poblacion',
      conexion: 'Ambos son derivadas de una cantidad respecto al tiempo.',
    },
  ],
};
