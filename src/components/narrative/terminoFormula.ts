export interface TerminoFormula {
  id: string;
  /** Fragmento LaTeX de este termino (sin delimitadores $). */
  latex: string;
  /** Color de resaltado propio del termino (hex o var CSS). */
  color: string;
  /** Explicacion que aparece al hacer hover / tap sobre el termino. */
  explicacion: string;
}

const PALETA_TERMINOS = ['#0891b2', '#d97706', '#16a34a', '#db2777', '#0284c7', '#64748b'];

/**
 * Descompone una formula LaTeX en terminos separados por + - = para animarla
 * parte a parte en FormulaAnimator (usado por ExplicacionView). Sin
 * explicaciones por termino especificas: cuando se necesita un desglose
 * curado (con explicacion real por parte), se construye a mano un
 * TerminoFormula[] en su lugar.
 */
export function dividirFormulaEnTerminos(latex: string): TerminoFormula[] {
  const partes = latex
    .split(/(?=[+\-=])/g)
    .map((p) => p.trim())
    .filter(Boolean);
  return partes.map((parte, indice) => ({
    id: `${indice}-${parte}`,
    latex: parte,
    color: PALETA_TERMINOS[indice % PALETA_TERMINOS.length] ?? '#0891b2',
    explicacion: `Termino ${indice + 1} de la formula.`,
  }));
}

/** x² + 2x + 1 = (x+1)² descompuesto termino a termino, usado como demo por defecto. */
export const EJEMPLO_TRINOMIO: TerminoFormula[] = [
  { id: 'x2', latex: 'x^2', color: '#0891b2', explicacion: 'El termino cuadratico: x multiplicado por si mismo.' },
  { id: 'mas1', latex: '+', color: '#64748b', explicacion: 'Suma de los tres terminos del trinomio.' },
  { id: '2x', latex: '2x', color: '#d97706', explicacion: 'El doble producto: 2 veces x.' },
  { id: 'mas2', latex: '+', color: '#64748b', explicacion: 'Suma de los tres terminos del trinomio.' },
  { id: 'uno', latex: '1', color: '#16a34a', explicacion: 'El termino independiente: 1 al cuadrado.' },
  { id: 'igual', latex: '=', color: '#64748b', explicacion: 'El trinomio es equivalente a un binomio al cuadrado.' },
  { id: 'binomio', latex: '(x+1)^2', color: '#db2777', explicacion: 'La factorizacion: (x+1) multiplicado por si mismo.' },
];
