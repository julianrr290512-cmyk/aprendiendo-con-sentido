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
  'nivel-ecuaciones-1': {
    id: 'fase-simulacion-ecuaciones-1',
    tipo: 'simulacion',
    nivelId: 'nivel-ecuaciones-1',
    titulo: 'Simulacion',
    instrucciones: 'Arrastra cada termino de la ecuacion 2x + 3 = 9 al lado correcto de la balanza.',
    completada: false,
    ordenIndex: 1,
    categoria: 'algebra',
    formulaLatex: '2x + 3 = 9',
    configAlgebra: {
      terminosDisponibles: [
        { id: 'dosx', etiqueta: '2x (6)', simboloLatex: '2x', valor: 6 },
        { id: 'tres', etiqueta: '+3', simboloLatex: '+3', valor: 3 },
        { id: 'nueve', etiqueta: '9', simboloLatex: '9', valor: 9 },
      ],
    },
  },
  'nivel-trigonometria-1': {
    id: 'fase-simulacion-trigonometria-1',
    tipo: 'simulacion',
    nivelId: 'nivel-trigonometria-1',
    titulo: 'Simulacion',
    instrucciones: 'Dibuja un triangulo rectangulo (3 puntos) y observa el angulo que se forma entre sus lados.',
    completada: false,
    ordenIndex: 1,
    categoria: 'geometria',
    formulaLatex: '\\sin(\\theta) = \\frac{\\text{opuesto}}{\\text{hipotenusa}}',
    configGeometria: {
      instrucciones: 'Coloca 3 puntos para formar un triangulo rectangulo. Une los lados con lineas y observa el angulo medido en el vertice.',
    },
  },
  'nivel-exponencial-1': {
    id: 'fase-simulacion-exponencial-1',
    tipo: 'simulacion',
    nivelId: 'nivel-exponencial-1',
    titulo: 'Simulacion',
    instrucciones: 'Arrastra cada termino de la funcion exponencial al lado correcto de la balanza.',
    completada: false,
    ordenIndex: 1,
    categoria: 'algebra',
    formulaLatex: 'f(x) = a \\cdot b^x',
    configAlgebra: {
      terminosDisponibles: [
        { id: 'a', etiqueta: 'a (2)', simboloLatex: 'a', valor: 2 },
        { id: 'bx', etiqueta: 'bˣ (8)', simboloLatex: 'b^x', valor: 8 },
        { id: 'fx', etiqueta: 'f(x) (16)', simboloLatex: 'f(x)', valor: 16 },
      ],
    },
  },
  'nivel-mru-1': {
    id: 'fase-simulacion-mru-1',
    tipo: 'simulacion',
    nivelId: 'nivel-mru-1',
    titulo: 'Simulacion',
    instrucciones: 'Arrastra cada termino de la ecuacion de posicion al lado correcto de la balanza.',
    completada: false,
    ordenIndex: 1,
    categoria: 'algebra',
    formulaLatex: 'x = x_0 + v \\cdot t',
    configAlgebra: {
      terminosDisponibles: [
        { id: 'x0', etiqueta: 'x₀ (2)', simboloLatex: 'x_0', valor: 2 },
        { id: 'vt', etiqueta: 'v · t (8)', simboloLatex: 'v \\cdot t', valor: 8 },
        { id: 'x', etiqueta: 'x (10)', simboloLatex: 'x', valor: 10 },
      ],
    },
  },
  'nivel-newton-1': {
    id: 'fase-simulacion-newton-1',
    tipo: 'simulacion',
    nivelId: 'nivel-newton-1',
    titulo: 'Simulacion',
    instrucciones: 'Cambia entre media, mediana y moda para explorar los datos de aceleracion de 6 ensayos con la misma fuerza aplicada.',
    completada: false,
    ordenIndex: 1,
    categoria: 'estadistica',
    formulaLatex: 'F = m \\cdot a',
    configEstadistica: {
      etiquetaDataset: 'Aceleracion medida en 6 ensayos (F = 10 N constante)',
      unidad: 'm/s²',
      categorias: ['Ensayo 1', 'Ensayo 2', 'Ensayo 3', 'Ensayo 4', 'Ensayo 5', 'Ensayo 6'],
      valores: [2.1, 1.9, 2.0, 2.2, 1.8, 2.0],
    },
  },
  'nivel-optica-1': {
    id: 'fase-simulacion-optica-1',
    tipo: 'simulacion',
    nivelId: 'nivel-optica-1',
    titulo: 'Simulacion',
    instrucciones: 'Dibuja el rayo incidente y el rayo reflejado (2 lineas desde un mismo punto) y mide el angulo entre ellos.',
    completada: false,
    ordenIndex: 1,
    categoria: 'geometria',
    formulaLatex: '\\theta_i = \\theta_r',
    configGeometria: {
      instrucciones: 'Coloca un punto de incidencia y dos puntos mas para trazar el rayo incidente y el rayo reflejado. Compara los angulos.',
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
  'nivel-ecuaciones-1': {
    id: 'fase-formalizacion-ecuaciones-1',
    tipo: 'formalizacion',
    nivelId: 'nivel-ecuaciones-1',
    titulo: 'Formalizacion',
    instrucciones: 'Revisa las formulas clave de esta sesion.',
    completada: false,
    ordenIndex: 3,
    resumen:
      'Una ecuacion lineal se resuelve aplicando operaciones inversas a ambos lados para dejar la incognita sola.',
    formulasClave: [
      {
        id: 'formula-ecuacion-lineal',
        nombre: 'Ecuacion lineal',
        latex: 'a \\cdot x + b = c',
        explicacion: 'Para despejar x: resta b a ambos lados y luego divide entre a. Lo que le haces a un lado se lo haces al otro.',
      },
    ],
  },
  'nivel-trigonometria-1': {
    id: 'fase-formalizacion-trigonometria-1',
    tipo: 'formalizacion',
    nivelId: 'nivel-trigonometria-1',
    titulo: 'Formalizacion',
    instrucciones: 'Revisa las formulas clave de esta sesion.',
    completada: false,
    ordenIndex: 3,
    resumen:
      'Las razones trigonometricas relacionan los angulos de un triangulo rectangulo con las proporciones entre sus lados.',
    formulasClave: [
      {
        id: 'formula-seno-coseno-tangente',
        nombre: 'Seno, coseno y tangente',
        latex: '\\sin\\theta=\\frac{op}{hip},\\quad \\cos\\theta=\\frac{ady}{hip},\\quad \\tan\\theta=\\frac{op}{ady}',
        explicacion: 'op = cateto opuesto al angulo, ady = cateto adyacente, hip = hipotenusa. Cada razon compara dos lados del triangulo.',
      },
    ],
  },
  'nivel-exponencial-1': {
    id: 'fase-formalizacion-exponencial-1',
    tipo: 'formalizacion',
    nivelId: 'nivel-exponencial-1',
    titulo: 'Formalizacion',
    instrucciones: 'Revisa las formulas clave de esta sesion.',
    completada: false,
    ordenIndex: 3,
    resumen:
      'Una funcion exponencial crece o decrece multiplicando por la misma base en cada paso; su inversa es la funcion logaritmica.',
    formulasClave: [
      {
        id: 'formula-exponencial',
        nombre: 'Funcion exponencial',
        latex: 'f(x) = a \\cdot b^x',
        explicacion: 'a es el valor inicial, b es la base (b > 1 crecimiento, 0 < b < 1 decrecimiento). Cada aumento de 1 en x multiplica el resultado por b.',
      },
      {
        id: 'formula-logaritmo',
        nombre: 'Funcion logaritmica (inversa)',
        latex: '\\log_b(y) = x \\iff b^x = y',
        explicacion: 'El logaritmo responde: ¿a que exponente hay que elevar la base b para obtener y? Es la operacion inversa de la potenciacion.',
      },
    ],
  },
  'nivel-mru-1': {
    id: 'fase-formalizacion-mru-1',
    tipo: 'formalizacion',
    nivelId: 'nivel-mru-1',
    titulo: 'Formalizacion',
    instrucciones: 'Revisa las formulas clave de esta sesion.',
    completada: false,
    ordenIndex: 3,
    resumen:
      'En el movimiento rectilineo uniforme, la posicion cambia de forma constante con el tiempo porque la velocidad no cambia.',
    formulasClave: [
      {
        id: 'formula-mru',
        nombre: 'Posicion en MRU',
        latex: 'x = x_0 + v \\cdot t',
        explicacion: 'x₀ es la posicion inicial, v es la velocidad constante y t el tiempo transcurrido. La grafica de posicion contra tiempo es una linea recta.',
      },
    ],
  },
  'nivel-newton-1': {
    id: 'fase-formalizacion-newton-1',
    tipo: 'formalizacion',
    nivelId: 'nivel-newton-1',
    titulo: 'Formalizacion',
    instrucciones: 'Revisa las formulas clave de esta sesion.',
    completada: false,
    ordenIndex: 3,
    resumen:
      'La segunda ley de Newton establece que la aceleracion de un objeto es proporcional a la fuerza neta aplicada e inversamente proporcional a su masa.',
    formulasClave: [
      {
        id: 'formula-newton-2',
        nombre: 'Segunda ley de Newton',
        latex: 'F = m \\cdot a',
        explicacion: 'F es la fuerza neta (N), m la masa (kg) y a la aceleracion (m/s²). A mayor masa, se necesita mas fuerza para lograr la misma aceleracion.',
      },
    ],
  },
  'nivel-optica-1': {
    id: 'fase-formalizacion-optica-1',
    tipo: 'formalizacion',
    nivelId: 'nivel-optica-1',
    titulo: 'Formalizacion',
    instrucciones: 'Revisa las formulas clave de esta sesion.',
    completada: false,
    ordenIndex: 3,
    resumen:
      'Cuando la luz choca contra una superficie se refleja con el mismo angulo de incidencia; cuando cambia de medio, se refracta y cambia de direccion.',
    formulasClave: [
      {
        id: 'formula-reflexion',
        nombre: 'Ley de reflexion',
        latex: '\\theta_i = \\theta_r',
        explicacion: 'El angulo de incidencia (θi) siempre es igual al angulo de reflexion (θr), medidos desde la normal a la superficie.',
      },
      {
        id: 'formula-snell',
        nombre: 'Ley de Snell (refraccion)',
        latex: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2',
        explicacion: 'n₁ y n₂ son los indices de refraccion de cada medio. Cuando la luz pasa a un medio mas denso, se acerca a la normal.',
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
