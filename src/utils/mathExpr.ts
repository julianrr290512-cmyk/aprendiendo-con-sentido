/**
 * Parser/evaluador recursivo-descendente para expresiones matematicas de una
 * variable ("x"), pensado para evaluar de forma segura expresiones que
 * devuelve la IA (GraficaFuncion.expresion). Nunca usa eval/Function: un
 * prompt-injection en el texto de la IA no puede ejecutar JS arbitrario.
 *
 * Gramatica soportada: + - * / ^ ( ), funciones sin/cos/tan/sqrt/abs/exp/log,
 * constantes pi/e, variable x, numeros decimales.
 */

const FUNCIONES: Record<string, (valor: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sqrt: Math.sqrt,
  abs: Math.abs,
  exp: Math.exp,
  log: Math.log,
};

const CONSTANTES: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

type TokenTipo = 'numero' | 'identificador' | 'operador' | 'parentesis-abre' | 'parentesis-cierra';

interface Token {
  tipo: TokenTipo;
  valor: string;
}

function tokenizar(expresion: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expresion.length) {
    const c = expresion[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let numero = c;
      i++;
      while (i < expresion.length && /[0-9.]/.test(expresion[i])) {
        numero += expresion[i];
        i++;
      }
      tokens.push({ tipo: 'numero', valor: numero });
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let ident = c;
      i++;
      while (i < expresion.length && /[a-zA-Z0-9]/.test(expresion[i])) {
        ident += expresion[i];
        i++;
      }
      tokens.push({ tipo: 'identificador', valor: ident });
      continue;
    }
    if (c === '(') {
      tokens.push({ tipo: 'parentesis-abre', valor: c });
      i++;
      continue;
    }
    if (c === ')') {
      tokens.push({ tipo: 'parentesis-cierra', valor: c });
      i++;
      continue;
    }
    if ('+-*/^'.includes(c)) {
      tokens.push({ tipo: 'operador', valor: c });
      i++;
      continue;
    }
    throw new Error(`Caracter no soportado en expresion: "${c}"`);
  }
  return tokens;
}

class Parser {
  private tokens: Token[];
  private pos = 0;
  private x: number;

  constructor(tokens: Token[], x: number) {
    this.tokens = tokens;
    this.x = x;
  }

  private actual(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consumir(): Token {
    const token = this.tokens[this.pos];
    if (!token) throw new Error('Expresion incompleta.');
    this.pos++;
    return token;
  }

  /** expresion := termino (('+' | '-') termino)* */
  parsearExpresion(): number {
    let valor = this.parsearTermino();
    while (this.actual()?.tipo === 'operador' && (this.actual()?.valor === '+' || this.actual()?.valor === '-')) {
      const op = this.consumir().valor;
      const derecho = this.parsearTermino();
      valor = op === '+' ? valor + derecho : valor - derecho;
    }
    return valor;
  }

  /** true si se consumieron todos los tokens (permite detectar restos invalidos). */
  terminado(): boolean {
    return this.pos === this.tokens.length;
  }

  /** termino := factor (('*' | '/') factor)* */
  private parsearTermino(): number {
    let valor = this.parsearPotencia();
    while (this.actual()?.tipo === 'operador' && (this.actual()?.valor === '*' || this.actual()?.valor === '/')) {
      const op = this.consumir().valor;
      const derecho = this.parsearPotencia();
      valor = op === '*' ? valor * derecho : valor / derecho;
    }
    return valor;
  }

  /** potencia := unario ('^' unario)* (asociativo a la derecha) */
  private parsearPotencia(): number {
    const base = this.parsearUnario();
    if (this.actual()?.tipo === 'operador' && this.actual()?.valor === '^') {
      this.consumir();
      const exponente = this.parsearPotencia();
      return Math.pow(base, exponente);
    }
    return base;
  }

  /** unario := '-' unario | primario */
  private parsearUnario(): number {
    if (this.actual()?.tipo === 'operador' && this.actual()?.valor === '-') {
      this.consumir();
      return -this.parsearUnario();
    }
    return this.parsearPrimario();
  }

  /** primario := numero | 'x' | constante | funcion '(' expresion ')' | '(' expresion ')' */
  private parsearPrimario(): number {
    const token = this.actual();
    if (!token) throw new Error('Expresion incompleta.');

    if (token.tipo === 'numero') {
      this.consumir();
      return parseFloat(token.valor);
    }

    if (token.tipo === 'parentesis-abre') {
      this.consumir();
      const valor = this.parsearExpresion();
      if (this.actual()?.tipo !== 'parentesis-cierra') throw new Error('Falta ")" en la expresion.');
      this.consumir();
      return valor;
    }

    if (token.tipo === 'identificador') {
      const nombre = token.valor.toLowerCase();
      this.consumir();

      if (nombre === 'x') return this.x;
      if (nombre in CONSTANTES) return CONSTANTES[nombre];

      if (nombre in FUNCIONES) {
        if (this.actual()?.tipo !== 'parentesis-abre') throw new Error(`Se esperaba "(" despues de ${nombre}.`);
        this.consumir();
        const argumento = this.parsearExpresion();
        if (this.actual()?.tipo !== 'parentesis-cierra') throw new Error('Falta ")" en la expresion.');
        this.consumir();
        return FUNCIONES[nombre](argumento);
      }

      throw new Error(`Identificador no reconocido: "${nombre}".`);
    }

    throw new Error('Expresion invalida.');
  }
}

/** Evalua `expresion` (variable "x") en un valor puntual. Lanza si es invalida. */
export function evaluarExpresion(expresion: string, x: number): number {
  const tokens = tokenizar(expresion);
  const parser = new Parser(tokens, x);
  const resultado = parser.parsearExpresion();
  if (!parser.terminado()) throw new Error('Expresion con tokens sobrantes.');
  return resultado;
}

/** Valida que `expresion` sea evaluable (sin lanzar) probando un par de puntos. */
export function esExpresionValida(expresion: string): boolean {
  try {
    evaluarExpresion(expresion, 1);
    evaluarExpresion(expresion, 2);
    return true;
  } catch {
    return false;
  }
}

export interface PuntoGrafica {
  x: number;
  y: number;
}

/** Muestrea `expresion` en `pasos` puntos uniformes dentro de `rangoX`, omitiendo valores no finitos. */
export function muestrearFuncion(expresion: string, rangoX: [number, number], pasos = 120): PuntoGrafica[] {
  const [min, max] = rangoX;
  const puntos: PuntoGrafica[] = [];
  for (let i = 0; i <= pasos; i++) {
    const x = min + ((max - min) * i) / pasos;
    try {
      const y = evaluarExpresion(expresion, x);
      if (Number.isFinite(y)) puntos.push({ x, y });
    } catch {
      // Punto no evaluable (ej. division por cero): se omite.
    }
  }
  return puntos;
}
