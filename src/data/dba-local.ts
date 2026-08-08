import type { AreaId } from '@/types';

/**
 * Fallback local garantizado de Derechos Basicos de Aprendizaje (DBA V2, MEN 2016).
 *
 * IMPORTANTE - alcance real de este archivo:
 * No existe hoy una API publica del MEN para DBA (se verifico: mineducacion.gov.co/portal/api/dba
 * responde 404) y el portal Colombia Aprende no expone URLs de descarga directa por grado sin
 * navegacion manual. El contenido de abajo es una aproximacion redactada a partir de la estructura
 * curricular publica y ampliamente documentada del MEN (progresion tematica por grado), NO una
 * transcripcion verbatim verificada contra el PDF oficial "DBA V2 Matematicas" (2016, 87 pag.).
 * Antes de usar este texto como referencia curricular formal, valida cada enunciado contra el PDF
 * oficial disponible en colombiaaprende.edu.co/contenidos/coleccion/derechos-basicos-de-aprendizaje.
 */

export const ANIO_DBA_MATEMATICAS = 2016;

const dbaMatematicas: Record<number, string[]> = {
  1: [
    'Reconoce el uso de los numeros en diferentes contextos (conteo, medicion, ordenamiento) para resolver problemas de la vida cotidiana.',
    'Usa diversas estrategias de conteo (agrupar, sobreconteo) y calculo para resolver problemas de adicion y sustraccion con numeros hasta 100.',
    'Reconoce nociones de horizontalidad, verticalidad, paralelismo y perpendicularidad en distintos contextos.',
    'Reconoce y utiliza medidas relativas en situaciones de medicion y estimacion.',
    'Clasifica y organiza datos de acuerdo con cualidades y atributos que se puedan comparar.',
  ],
  2: [
    'Utiliza diferentes estrategias para contar, comparar, medir y realizar calculos con las operaciones basicas al resolver problemas.',
    'Reconoce el sistema de numeracion decimal (unidades, decenas, centenas) y lo usa para comparar cantidades.',
    'Compara y clasifica objetos tridimensionales de acuerdo con sus componentes (caras, lados) y propiedades.',
    'Utiliza patrones e instrumentos, estandarizados y no estandarizados, para medir longitud y capacidad.',
    'Interpreta informacion presentada en tablas y pictogramas sencillos.',
  ],
  3: [
    'Formula y resuelve problemas aditivos y multiplicativos rutinarios y no rutinarios.',
    'Usa representaciones concretas y pictoricas para explicar el valor de posicion en el sistema decimal.',
    'Identifica, describe y representa figuras y cuerpos geometricos a partir de sus propiedades.',
    'Reconoce el uso de las fracciones para describir situaciones en las que una unidad se divide en partes iguales.',
    'Recolecta y organiza datos en tablas de frecuencia y los representa en graficos de barras.',
  ],
  4: [
    'Interpreta las fracciones en diferentes contextos: medicion, relacion parte-todo, cociente, razones y proporciones.',
    'Formula y resuelve problemas multiplicativos que requieren el algoritmo de la multiplicacion y/o la division.',
    'Clasifica poligonos segun sus propiedades y relaciona cuerpos geometricos con sus desarrollos planos.',
    'Comprende y utiliza los conceptos de area y perimetro de figuras planas.',
    'Interpreta y compara datos de diversas fuentes mediante tablas y graficas estadisticas.',
  ],
  5: [
    'Formula y resuelve problemas de proporcionalidad directa e inversa en diferentes contextos.',
    'Realiza estimaciones y calculos con las operaciones basicas entre numeros naturales, decimales y fraccionarios.',
    'Reconoce el uso de numeros decimales y fraccionarios para representar situaciones de medida.',
    'Reconoce nociones de congruencia y semejanza entre figuras planas.',
    'Calcula probabilidades de eventos simples en contextos cotidianos usando listados y diagramas de arbol.',
  ],
  6: [
    'Reconoce y utiliza el conjunto de los numeros enteros y sus operaciones para resolver problemas en diferentes contextos.',
    'Reconoce el conjunto de los numeros racionales, sus usos y operaciones, y los aplica en la solucion de problemas.',
    'Establece relaciones entre las propiedades de las graficas y las propiedades de las ecuaciones algebraicas.',
    'Formula y resuelve problemas de medicion relacionados con el perimetro y el area de figuras planas.',
    'Utiliza graficos estadisticos para representar un conjunto de datos segun su naturaleza y contexto.',
  ],
  7: [
    'Utiliza numeros racionales, sus operaciones y relaciones de orden, en la representacion e interpretacion de datos.',
    'Establece relaciones y compara expresiones algebraicas equivalentes usando propiedades de las operaciones.',
    'Resuelve y formula problemas geometricos que involucran propiedades de triangulos y cuadrilateros.',
    'Reconoce la proporcionalidad directa e inversa entre variables y su relacion con la funcion lineal.',
    'Compara distribuciones de datos mediante el analisis de graficas y medidas de tendencia central.',
  ],
  8: [
    'Utiliza las propiedades de la potenciacion y la radicacion en la solucion de problemas con numeros racionales.',
    'Interpreta y utiliza las medidas de tendencia central (media, mediana, moda) y de dispersion de un conjunto de datos.',
    'Resuelve problemas que involucran factorizacion de expresiones algebraicas sencillas.',
    'Utiliza el plano cartesiano y relaciones entre variables para representar e interpretar problemas de la vida diaria.',
    'Reconoce y aplica el teorema de Pitagoras y las relaciones metricas en el triangulo rectangulo.',
  ],
  9: [
    'Interpreta y utiliza el lenguaje algebraico para representar y resolver situaciones aditivas y multiplicativas.',
    'Modela situaciones de variacion con funciones polinomicas y otros modelos matematicos.',
    'Utiliza herramientas estadisticas para interpretar tendencia, agrupamiento y ubicacion de valores en un conjunto de datos.',
    'Resuelve problemas que involucran relaciones entre funciones lineales y ecuaciones e inecuaciones lineales.',
    'Establece relaciones entre las razones trigonometricas y las funciones que las representan.',
  ],
  10: [
    'Reconoce las funciones trigonometricas a partir de las relaciones entre los lados de un triangulo rectangulo.',
    'Modela situaciones de la vida cotidiana usando funciones polinomicas, exponenciales y logaritmicas.',
    'Interpreta medidas de dispersion de un conjunto de datos y las utiliza para comparar dos o mas conjuntos.',
    'Resuelve problemas de conteo utilizando el principio multiplicativo y aditivo, permutaciones y combinaciones.',
    'Establece relaciones entre sistemas de medidas angulares (grados y radianes) y las utiliza en la solucion de problemas.',
  ],
  11: [
    'Interpreta la nocion de derivada como razon de cambio y estima limites y derivadas de funciones sencillas.',
    'Modela situaciones de variacion periodica con funciones trigonometricas.',
    'Interpreta la nocion de probabilidad condicional y la relaciona con problemas y situaciones especificas.',
    'Resuelve problemas relacionando representaciones de funciones (algebraicas, graficas, tabulares) para tomar decisiones.',
    'Disena e interpreta modelos y estudios estadisticos para responder preguntas de la vida diaria y otras ciencias.',
  ],
};

/**
 * Fisica no tiene un documento DBA propio del MEN (el DBA de Ciencias Naturales
 * cubre biologia, quimica y fisica de forma integrada). Estos enunciados son una
 * redaccion propia, centrada en fisica, que sigue el mismo formato y nivel de
 * profundidad que los DBA oficiales de matematicas para mantener consistencia
 * pedagogica dentro de la app.
 */
const dbaFisica: Record<number, string[]> = {
  9: [
    'Explica el movimiento rectilineo uniforme de un objeto a partir de las relaciones entre posicion, velocidad y tiempo.',
    'Diferencia el movimiento rectilineo uniforme del movimiento con aceleracion constante mediante graficas de posicion y velocidad.',
    'Relaciona la fuerza neta aplicada sobre un objeto con los cambios en su estado de movimiento (primera ley de Newton).',
    'Analiza situaciones cotidianas usando el concepto de energia mecanica y su conservacion en ausencia de friccion.',
    'Disena y realiza experimentos sencillos de medicion de tiempo, distancia y velocidad, y comunica sus resultados.',
  ],
  10: [
    'Aplica la segunda ley de Newton (F = m·a) para explicar y predecir el movimiento de objetos sometidos a fuerzas.',
    'Analiza el movimiento de caida libre y de proyectiles descomponiendo el movimiento en sus componentes horizontal y vertical.',
    'Relaciona el trabajo mecanico con los cambios de energia cinetica y potencial de un sistema.',
    'Interpreta datos experimentales de fuerza, masa y aceleracion, y estima el margen de error de sus mediciones.',
    'Explica fenomenos de la vida cotidiana (choques, caidas, lanzamientos) usando las leyes de Newton y la conservacion de la energia.',
  ],
  11: [
    'Explica la reflexion y la refraccion de la luz usando el modelo ondulatorio y las leyes de Snell.',
    'Relaciona los fenomenos electricos y magneticos basicos con situaciones tecnologicas cotidianas.',
    'Analiza circuitos electricos sencillos en serie y en paralelo usando la ley de Ohm.',
    'Explica fenomenos ondulatorios (sonido, luz) a partir de conceptos de frecuencia, longitud de onda y velocidad de propagacion.',
    'Disena experimentos para comprobar leyes fisicas (optica, electricidad) y comunica sus conclusiones con evidencia cuantitativa.',
  ],
};

export const dbaLocal: Partial<Record<AreaId, Record<number, string[]>>> = {
  matematicas: dbaMatematicas,
  fisica: dbaFisica,
};
