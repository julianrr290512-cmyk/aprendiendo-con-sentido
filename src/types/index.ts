// ---------------------------------------------------------------------------
// Dominio curricular: Area > Grado > Tema > Nivel > Presentacion > Fases > Ejercicios
// ---------------------------------------------------------------------------

export type AreaId =
  | 'matematicas'
  | 'geometria'
  | 'estadistica'
  | 'algebra'
  | 'calculo';

export interface Area {
  id: AreaId;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  gradosDisponibles: number[];
}

export interface Grado {
  id: string;
  numero: number;
  nombre: string;
  areaId: AreaId;
  temasIds: string[];
}

export interface Tema {
  id: string;
  nombre: string;
  descripcion: string;
  gradoId: string;
  areaId: AreaId;
  dbaIds: string[];
  estandarIds: string[];
  nivelesIds: string[];
  duracionEstimadaMin: number;
}

export interface Nivel {
  id: string;
  numero: number;
  nombre: string;
  temaId: string;
  dificultad: 'introductorio' | 'intermedio' | 'avanzado';
  objetivos: string[];
  presentacionId: string;
}

// ---------------------------------------------------------------------------
// Contenido oficial: DBA y Estandares
// ---------------------------------------------------------------------------

export interface DBA {
  id: string;
  codigo: string;
  enunciado: string;
  grado: number;
  areaId: AreaId;
  evidenciasAprendizaje: string[];
}

export interface Estandar {
  id: string;
  codigo: string;
  enunciado: string;
  grupoGrados: string;
  componente: 'numerico-variacional' | 'geometrico-metrico' | 'aleatorio';
  areaId: AreaId;
}

// ---------------------------------------------------------------------------
// Presentacion narrativa
// ---------------------------------------------------------------------------

export interface Presentacion {
  id: string;
  nivelId: string;
  titulo: string;
  narrativa: NarrativeBeat[];
  personajeGuia?: string;
  sonidoAmbienteId?: string;
}

export interface NarrativeBeat {
  id: string;
  tipo: 'dialogo' | 'escena' | 'pregunta' | 'transicion';
  texto: string;
  duracionMs: number;
  animacionId?: string;
  sonidoId?: string;
}

// ---------------------------------------------------------------------------
// Fases pedagogicas (ciclo POE: Prediccion, Simulacion, Exploracion, Formalizacion)
// ---------------------------------------------------------------------------

export type FaseTipo =
  | 'prediccion'
  | 'simulacion'
  | 'exploracion'
  | 'formalizacion';

export interface Fase {
  id: string;
  tipo: FaseTipo;
  nivelId: string;
  titulo: string;
  instrucciones: string;
  completada: boolean;
  ordenIndex: number;
}

/**
 * Pregunta de prediccion abierta (taxonomia de Bloom niveles 4-6: analisis,
 * evaluacion, creacion). No hay opciones de seleccion: el estudiante escribe
 * su hipotesis en texto libre antes de ver ningun contenido formal.
 */
export interface FasePrediccion extends Fase {
  tipo: 'prediccion';
  pregunta: string;
  /** Frase de contexto opcional que antecede la pregunta. */
  contexto?: string;
  minPalabras: number;
  /** Tiempo sugerido en segundos: solo informativo, nunca bloquea el avance. */
  tiempoSugeridoSeg?: number;
}

export type CategoriaSimulacion = 'fracciones' | 'algebra' | 'geometria' | 'estadistica';

export interface SimulacionFraccionesConfig {
  numeroPartes: number;
  formaBase: 'barra' | 'circulo';
}

export interface TerminoBalanza {
  id: string;
  etiqueta: string;
  simboloLatex: string;
  valor: number;
}

export interface SimulacionAlgebraConfig {
  terminosDisponibles: TerminoBalanza[];
}

export interface SimulacionGeometriaConfig {
  instrucciones: string;
}

export interface SimulacionEstadisticaConfig {
  etiquetaDataset: string;
  unidad: string;
  categorias: string[];
  valores: number[];
}

/**
 * El widget interactivo se elige por `categoria` (un switch en SimulacionPhase),
 * no por area curricular: una misma area puede necesitar distintos widgets.
 */
export interface FaseSimulacion extends Fase {
  tipo: 'simulacion';
  categoria: CategoriaSimulacion;
  formulaLatex?: string;
  configFracciones?: SimulacionFraccionesConfig;
  configAlgebra?: SimulacionAlgebraConfig;
  configGeometria?: SimulacionGeometriaConfig;
  configEstadistica?: SimulacionEstadisticaConfig;
}

/** Registro telemetrico de una sesion de simulacion (tiempo, intentos, acciones). */
export interface SimulacionTelemetria {
  nivelId: string;
  categoria: CategoriaSimulacion;
  tiempoMs: number;
  intentos: number;
  acciones: string[];
}

export interface EscenarioExploracion {
  id: string;
  /** Contexto real colombiano (tienda de barrio, transporte, deporte, etc.). */
  contexto: string;
  pregunta: string;
  explicacion: string;
  /** 3 niveles de pista progresiva; cada una cuesta 1 estrella si se revela. */
  pistas: [string, string, string];
  tiempoLimiteSeg: number;
}

export interface FaseExploracion extends Fase {
  tipo: 'exploracion';
  escenarios: EscenarioExploracion[];
}

export interface FaseFormalizacion extends Fase {
  tipo: 'formalizacion';
  formulasClave: FormulaClave[];
  resumen: string;
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

export type EjercicioTipo =
  | 'opcion-multiple'
  | 'respuesta-abierta'
  | 'arrastrar-soltar'
  | 'formula';

export interface Ejercicio {
  id: string;
  nivelId: string;
  tipo: EjercicioTipo;
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

export interface MapaTransferenciaItem {
  id: string;
  concepto: string;
  contextoOrigen: string;
  contextoDestino: string;
  conexion: string;
}

export interface MetacognicionRespuesta {
  pregunta: string;
  respuesta: string;
  nivelConfianza: 1 | 2 | 3 | 4 | 5;
}

// ---------------------------------------------------------------------------
// Resultados y progreso
// ---------------------------------------------------------------------------

export interface ResultadoNivel {
  nivelId: string;
  puntajeTotal: number;
  puntajeMaximo: number;
  porcentaje: number;
  respuestas: RespuestaEjercicio[];
  fasesCompletadas: FaseTipo[];
  metacognicion: MetacognicionRespuesta[];
  fechaCompletado: string;
  tiempoTotalMs: number;
}

export interface ProgresoTema {
  temaId: string;
  nivelesCompletados: string[];
  nivelActualId: string | null;
  porcentajeAvance: number;
}

// ---------------------------------------------------------------------------
// Sesion de usuario
// ---------------------------------------------------------------------------

export interface SesionUsuario {
  id: string;
  nombre: string;
  areaActualId: AreaId | null;
  gradoActualId: string | null;
  temaActualId: string | null;
  nivelActualId: string | null;
  sonidoHabilitado: boolean;
  /** Volumen global (0-1) para los sonidos sintetizados de la narrativa. */
  volumen: number;
  fechaInicio: string;
}

// ---------------------------------------------------------------------------
// Narrativa tipo mini-documental (slides): motor de presentacion, animador
// de formulas y analogias del mundo real.
// ---------------------------------------------------------------------------

export type SlideTipo = 'historia' | 'formula' | 'analogia' | 'pregunta' | 'revelacion';

export type SlideSonido = 'intro' | 'tension' | 'descubrimiento' | 'logro';

export interface SlideNarrativo {
  id: string;
  tipo: SlideTipo;
  titulo: string;
  /** Puede incluir sintaxis KaTeX inline delimitada por $...$. */
  contenido: string;
  /** URL de imagen matematica abstracta para el fondo del slide. */
  imagenFondo?: string;
  /** Formula KaTeX grande y centrada, propia de slides tipo 'formula'. */
  formulaDestacada?: string;
  sonido?: SlideSonido;
  /** Duracion en ms para el avance automatico (autoplay). */
  duracionAuto?: number;
}

export interface NarrativeSlidesResult {
  slides: SlideNarrativo[];
  fuente: FuenteContenido;
  temaId: string;
}

// ---------------------------------------------------------------------------
// Contenido pedagogico generado por IA para las fases (pregunta de prediccion
// profunda + escenarios de exploracion), con la misma cascada cache/api/local
// que el resto del contenido curricular.
// ---------------------------------------------------------------------------

export interface PreguntaPrediccionResult {
  pregunta: string;
  contexto?: string;
  minPalabras: number;
  fuente: FuenteContenido;
}

export interface EscenariosExploracionResult {
  escenarios: EscenarioExploracion[];
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

export interface AiGenerarEjercicioRequest {
  temaId: string;
  dificultad: Nivel['dificultad'];
  cantidad: number;
}

export interface AiGenerarEjercicioResponse {
  ejercicios: Ejercicio[];
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

// ---------------------------------------------------------------------------
// Cascada de contenido curricular (DBA / Estandares): api -> web -> local
// ---------------------------------------------------------------------------

export type FuenteContenido = 'api' | 'web' | 'local';

export interface DBAResult {
  dba: string[];
  fuente: FuenteContenido;
  grado: number;
  area: AreaId;
  anio: number;
}

export interface EstandarBC {
  enunciado: string;
  pensamiento: string;
  grupoGrados: string;
}

export interface EstandaresResult {
  estandares: EstandarBC[];
  pensamientos: string[];
  competencias: string[];
  fuente: FuenteContenido;
  grupoGrados: string;
  area: AreaId;
}
