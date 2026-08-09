// ---------------------------------------------------------------------------
// Dominio curricular: Area > Tema > Fases > Ejercicios
// ---------------------------------------------------------------------------

export type AreaId = 'matematicas' | 'fisica';

export interface Area {
  id: AreaId;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
}

export interface Tema {
  id: string;
  nombre: string;
  areaId: AreaId;
}

// ---------------------------------------------------------------------------
// Fases pedagogicas (predicción, exploración, formalización)
// ---------------------------------------------------------------------------

export type FaseTipo = 'prediccion' | 'exploracion' | 'formalizacion';

export interface Fase {
  id: string;
  tipo: FaseTipo;
  temaId: string;
  titulo: string;
  instrucciones: string;
  completada: boolean;
  ordenIndex: number;
}

/** Una pregunta individual de predicción, en texto libre. */
export interface PreguntaItem {
  pregunta: string;
  /** Frase de contexto opcional que antecede la pregunta. */
  contexto?: string;
  minPalabras: number;
}

/**
 * Fase de predicción (taxonomia de Bloom niveles 4-6: analisis, evaluacion,
 * creacion). Sin opciones de seleccion: el estudiante escribe su hipotesis
 * en texto libre antes de ver ningun contenido formal. Siempre 2 preguntas.
 */
export interface FasePrediccion extends Fase {
  tipo: 'prediccion';
  preguntas: PreguntaItem[];
}

export interface EscenarioExploracion {
  id: string;
  /** Contexto real, cercano a la vida de un estudiante. */
  contexto: string;
  pregunta: string;
  explicacion: string;
  /** 3 niveles de pista progresiva; cada una cuesta 1 estrella si se revela. */
  pistas: [string, string, string];
  tiempoLimiteSeg: number;
}

/** Fase de exploración: siempre 2 escenarios. */
export interface FaseExploracion extends Fase {
  tipo: 'exploracion';
  escenarios: EscenarioExploracion[];
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

export interface FaseFormalizacion extends Fase {
  tipo: 'formalizacion';
  resumen: string;
  formulasClave: FormulaClave[];
  /** Analogia con la vida real de un estudiante. */
  analogia: string;
  /** Solo presente cuando el concepto se beneficia de una representacion grafica. */
  grafica?: GraficaFuncion;
}

export interface FormulaClave {
  id: string;
  nombre: string;
  latex: string;
  explicacion: string;
}

// ---------------------------------------------------------------------------
// Ejercicios y transferencia
// ---------------------------------------------------------------------------

export type EjercicioTipo = 'opcion-multiple' | 'respuesta-abierta' | 'formula';

/**
 * Niveles de la taxonomia de Bloom que cubren los 5 ejercicios de cada
 * sesion, en orden ascendente de exigencia cognitiva.
 */
export type NivelBloom = 'comprender' | 'aplicar' | 'analizar' | 'evaluar' | 'crear';

export interface Ejercicio {
  id: string;
  temaId: string;
  tipo: EjercicioTipo;
  nivelBloom: NivelBloom;
  /** true en los ejercicios finales que transfieren el concepto a otro contexto. */
  esTransferencia: boolean;
  enunciado: string;
  enunciadoLatex?: string;
  opciones?: OpcionEjercicio[];
  respuestaEsperada?: string;
  retroalimentacionCorrecta: string;
  retroalimentacionIncorrecta: string;
  puntaje: number;
}

export interface OpcionEjercicio {
  id: string;
  texto: string;
  esCorrecta: boolean;
}

export interface RespuestaEjercicio {
  ejercicioId: string;
  respuestaDada: string;
  esCorrecta: boolean;
  tiempoRespuestaMs: number;
  intentos: number;
}

// ---------------------------------------------------------------------------
// Resultados y progreso
// ---------------------------------------------------------------------------

export interface ResultadoSesion {
  temaId: string;
  puntajeTotal: number;
  puntajeMaximo: number;
  porcentaje: number;
  respuestas: RespuestaEjercicio[];
  fasesCompletadas: FaseTipo[];
  fechaCompletado: string;
  tiempoTotalMs: number;
}

// ---------------------------------------------------------------------------
// Sesion de usuario
// ---------------------------------------------------------------------------

export interface SesionUsuario {
  id: string;
  nombre: string;
  areaActualId: AreaId | null;
  /** Id determinista (area + slug del tema) del tema elegido. */
  temaActualId: string | null;
  /** Nombre legible del tema elegido (siempre texto libre del docente). */
  temaNombreActual: string | null;
  sonidoHabilitado: boolean;
  /** Volumen global (0-1) para los sonidos sintetizados de feedback. */
  volumen: number;
  fechaInicio: string;
}

// ---------------------------------------------------------------------------
// Contenido generado por IA para las fases, con cascada cache/api/local.
// ---------------------------------------------------------------------------

export type FuenteContenido = 'api' | 'local';

export interface PreguntaPrediccionResult {
  preguntas: PreguntaItem[];
  fuente: FuenteContenido;
}

export interface EscenariosExploracionResult {
  escenarios: EscenarioExploracion[];
  fuente: FuenteContenido;
}

export interface FormalizacionGeneradaResult {
  resumen: string;
  formulasClave: FormulaClave[];
  analogia: string;
  grafica?: GraficaFuncion;
  fuente: FuenteContenido;
}

// ---------------------------------------------------------------------------
// Deck continuo: une las 4 fases pedagogicas en una sola lista de pasos con
// un indice compartido (experiencia tipo presentacion interactiva).
// ---------------------------------------------------------------------------

export type CategoriaPasoDeck = FaseTipo | 'ejercicios';

export interface PasoDeckPrediccion {
  id: string;
  categoria: 'prediccion';
  fase: FasePrediccion;
}

export interface PasoDeckExploracion {
  id: string;
  categoria: 'exploracion';
  fase: FaseExploracion;
}

export interface PasoDeckFormalizacion {
  id: string;
  categoria: 'formalizacion';
  fase: FaseFormalizacion;
}

export interface PasoDeckEjercicios {
  id: string;
  categoria: 'ejercicios';
  ejercicios: Ejercicio[];
}

export type PasoDeck =
  | PasoDeckPrediccion
  | PasoDeckExploracion
  | PasoDeckFormalizacion
  | PasoDeckEjercicios;

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
