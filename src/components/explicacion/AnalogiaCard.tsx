import { memo } from 'react';
import { motion } from 'framer-motion';
import type { AnalogiaVidaReal } from '@/types';

interface AnalogiaCardProps {
  analogia: AnalogiaVidaReal;
  indice: number;
}

export const AnalogiaCard = memo(function AnalogiaCard({ analogia, indice }: AnalogiaCardProps) {
  return (
    <motion.div
      className="space-y-1.5 rounded-lg border border-math-gold/15 bg-math-gold/5 p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: indice * 0.1 }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-math-gold">{analogia.titulo}</p>
      <p className="text-sm text-math-white">{analogia.texto}</p>
    </motion.div>
  );
});
