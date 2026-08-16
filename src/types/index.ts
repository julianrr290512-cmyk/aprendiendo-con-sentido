// ---------------------------------------------------------------------------
// Dominio curricular: Area > Grado > Tema (+ descripcion de enfoque) > IA
// ---------------------------------------------------------------------------

export type AreaId = 'matematicas' | 'fisica';

export interface Area {
  id: AreaId;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
}

/** Grado escolar (6to a 11mo): vive solo como contexto para la IA, sin contenido propio. */
export type GradoId = '6' | '7' | '8' | '9' | '10' | '11';

export interface Grado {
  id: GradoId;
  nombre: string;
}

export interface Tema {
  id: string;
  nombre: string;
  areaId: AreaId;
}

// ---------------------------------------------------------------------------
// Explicacion generada por IA: resumen + analogias + formulas + graficas
// ---------------------------------------------------------------------------

/** Comparacion con una situacion tangible de la vida cotidiana del estudiante. */
export interface AnalogiaVidaReal {
  titulo: string;
  texto: string;
}

export interface FormulaClave {
  id: string;
  nombre: string;
  latex: string;
  explicacion: string;
}

/** Grafica de una funcion de una variable, evaluada de forma segura (sin eval/Function). */
export interface GraficaFuncion {
  /** Expresion matematica en variable "x" (ej. "x^2", "sin(x)"). */
  expresion: string;
  rangoX: [number, number];
  titulo?: string;
  etiquetaX?: string;
  etiquetaY?: string;
}

// ---------------------------------------------------------------------------
// Ejercicios de practica: exactamente 2 por sesion (conceptual + procedimental)
// ---------------------------------------------------------------------------

export type EjercicioTipo = 'opcion-multiple' | 'respuesta-abierta' | 'formula';

export type EjercicioCategoria = 'conceptual' | 'procedimental';

export interface Ejercicio {
  id: string;
  temaId: string;
  categoria: EjercicioCategoria;
  tipo: EjercicioTipo;
  enunciado: string;
  enunciadoLatex?: string;
  opciones?: OpcionEjercicio[];
  respuestaEsperada?: string;
  retroalimentacionCorrecta: string;
  retroalimentacionIncorrecta: string;
}

export interface OpcionEjercicio {
  id: string;
  texto: string;
  esCorrecta: boolean;
}

// ---------------------------------------------------------------------------
// Sesion de usuario
// ---------------------------------------------------------------------------

export interface SesionUsuario {
  id: string;
  nombre: string;
  areaActualId: AreaId | null;
  gradoActualId: GradoId | null;
  /** Id determinista (area + slug del tema) del tema elegido. */
  temaActualId: string | null;
  /** Nombre legible del tema elegido (siempre texto libre del docente). */
  temaNombreActual: string | null;
  /** Descripcion libre de en que se quiere enfocar, como contexto adicional para la IA. */
  descripcionActual: string | null;
  sonidoHabilitado: boolean;
  /** Volumen global (0-1) para los sonidos sintetizados de feedback. */
  volumen: number;
  fechaInicio: string;
}

// ---------------------------------------------------------------------------
// Contenido generado por IA, con cascada cache/api/local.
// ---------------------------------------------------------------------------

export type FuenteContenido = 'api' | 'local';

export interface ExplicacionGeneradaResult {
  resumen: string;
  /** Exactamente 3 analogias de la vida real. */
  analogias: AnalogiaVidaReal[];
  /** 1 a 3 formulas clave en LaTeX. */
  formulasClave: FormulaClave[];
  /** 0 a 2 graficas, solo cuando el concepto se beneficia de una representacion grafica. */
  graficas: GraficaFuncion[];
  /** Exactamente 2 ejercicios: uno conceptual y uno procedimental. */
  ejercicios: Ejercicio[];
  fuente: FuenteContenido;
}

// ---------------------------------------------------------------------------
// API / servicios
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
  fuente: 'api' | 'fallback-local';
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Rendimiento / analitica
// ---------------------------------------------------------------------------

export interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
}

export interface AnalyticsEvent {
  nombre: string;
  propiedades?: Record<string, string | number | boolean>;
  timestamp: string;
}
