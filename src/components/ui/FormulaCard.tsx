import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { KatexRenderer } from '@/components/math/KatexRenderer';
import { cn } from '@/utils/cn';
import { Badge } from './Badge';
import { Card, CardContent, CardHeader } from './Card';

export type FormulaCardTipo = 'dba' | 'estandar';

const ETIQUETA_TIPO: Record<FormulaCardTipo, string> = {
  dba: 'DBA Oficial MEN',
  estandar: 'Estándar BC',
};

interface Token {
  tipo: 'texto' | 'formula';
  valor: string;
}

/**
 * Separa el contenido en fragmentos de texto plano y formulas delimitadas por $...$,
 * y a su vez divide el texto plano en palabras para poder animar un revelado tipo
 * "escritura matematica" palabra por palabra (las formulas se animan como una unidad).
 */
function tokenizar(texto: string): Token[] {
  return texto
    .split(/(\$[^$]+\$)/g)
    .filter(Boolean)
    .flatMap((parte): Token[] => {
      if (parte.startsWith('$') && parte.endsWith('$') && parte.length > 2) {
        return [{ tipo: 'formula', valor: parte.slice(1, -1) }];
      }
      return parte
        .split(/(\s+)/)
        .filter(Boolean)
        .map((palabra) => ({ tipo: 'texto', valor: palabra }));
    });
}

const contenedorVariants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.02 } },
};

const palabraVariants = {
  oculto: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

interface FormulaCardProps {
  tipo: FormulaCardTipo;
  titulo: string;
  contenido: string;
  metadata?: string;
  className?: string;
}

export const FormulaCard = memo(function FormulaCard({
  tipo,
  titulo,
  contenido,
  metadata,
  className,
}: FormulaCardProps) {
  const [expandido, setExpandido] = useState(false);
  const tokens = useMemo(() => tokenizar(contenido), [contenido]);
  const esLargo = contenido.length > 220;

  return (
    <Card variant="formula" className={className}>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <h3 className="font-display text-base font-semibold text-math-white">{titulo}</h3>
          {metadata && <p className="text-xs text-math-silver">{metadata}</p>}
        </div>
        <Badge variant={tipo === 'dba' ? 'cyan' : 'gold'}>{ETIQUETA_TIPO[tipo]}</Badge>
      </CardHeader>

      <CardContent>
        <motion.p
          className={cn(
            'font-math text-sm leading-relaxed text-math-white/90',
            !expandido && esLargo && 'line-clamp-3',
          )}
          variants={contenedorVariants}
          initial="oculto"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {tokens.map((token, indice) =>
            token.tipo === 'formula' ? (
              <motion.span key={indice} variants={palabraVariants} className="mx-0.5 inline-block">
                <KatexRenderer latex={token.valor} />
              </motion.span>
            ) : (
              <motion.span key={indice} variants={palabraVariants} className="inline-block">
                {token.valor}
              </motion.span>
            ),
          )}
        </motion.p>

        {esLargo && (
          <button
            type="button"
            onClick={() => setExpandido((prev) => !prev)}
            className="mt-2 text-xs font-medium text-math-cyan hover:underline"
          >
            {expandido ? 'Ver menos' : 'Ver más'}
          </button>
        )}
      </CardContent>
    </Card>
  );
});
