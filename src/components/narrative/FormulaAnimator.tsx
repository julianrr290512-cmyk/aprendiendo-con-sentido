import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KatexRenderer } from '@/components/math/KatexRenderer';
import { EJEMPLO_TRINOMIO, type TerminoFormula } from './terminoFormula';
import { cn } from '@/utils/cn';

interface FormulaAnimatorProps {
  terminos?: TerminoFormula[];
  className?: string;
}

/**
 * Anima una formula LaTeX termino a termino con KaTeX + Framer Motion: cada
 * parte aparece en secuencia con su propio color, y al hacer hover se resalta
 * junto con una flecha que apunta a su explicacion.
 */
export const FormulaAnimator = memo(function FormulaAnimator({
  terminos = EJEMPLO_TRINOMIO,
  className,
}: FormulaAnimatorProps) {
  const [activo, setActivo] = useState<string | null>(null);
  const terminoActivo = terminos.find((t) => t.id === activo);

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      <div className="flex flex-wrap items-center justify-center gap-1 text-3xl sm:text-4xl">
        {terminos.map((termino, indice) => (
          <motion.button
            key={termino.id}
            type="button"
            onMouseEnter={() => setActivo(termino.id)}
            onMouseLeave={() => setActivo((prev) => (prev === termino.id ? null : prev))}
            onFocus={() => setActivo(termino.id)}
            onClick={() => setActivo((prev) => (prev === termino.id ? null : termino.id))}
            className="relative rounded-md px-1.5 py-1 outline-none transition-colors"
            style={{
              color: termino.color,
              backgroundColor: activo === termino.id ? `${termino.color}1a` : 'transparent',
            }}
            initial={{ opacity: 0, y: 16, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: activo === termino.id ? 1.12 : 1 }}
            transition={{ duration: 0.35, delay: indice * 0.15, ease: 'easeOut' }}
          >
            <KatexRenderer latex={termino.latex} />

            {activo === termino.id && (
              <motion.span
                aria-hidden="true"
                className="absolute -bottom-3 left-1/2 h-3 w-px -translate-x-1/2"
                style={{ backgroundColor: termino.color }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.15 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      <div className="min-h-[3.5rem] max-w-md text-center">
        <AnimatePresence mode="wait">
          {terminoActivo ? (
            <motion.p
              key={terminoActivo.id}
              className="rounded-lg border px-4 py-2 text-sm"
              style={{ borderColor: `${terminoActivo.color}55`, color: terminoActivo.color }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {terminoActivo.explicacion}
            </motion.p>
          ) : (
            <motion.p
              key="hint"
              className="text-sm text-math-silver"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Pasa el cursor sobre cada parte de la formula para entenderla.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
