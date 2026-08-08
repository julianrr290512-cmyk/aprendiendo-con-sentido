import { memo } from 'react';
import { motion } from 'framer-motion';

interface AnimacionConceptoProps {
  emoji: string;
  titulo: string;
  descripcion?: string;
}

export const AnimacionConcepto = memo(function AnimacionConcepto({
  emoji,
  titulo,
  descripcion,
}: AnimacionConceptoProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-3 text-center"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
    >
      <motion.span
        className="text-6xl"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {emoji}
      </motion.span>
      <h3 className="font-display text-lg font-semibold">{titulo}</h3>
      {descripcion && <p className="max-w-sm text-sm text-muted-foreground">{descripcion}</p>}
    </motion.div>
  );
});
