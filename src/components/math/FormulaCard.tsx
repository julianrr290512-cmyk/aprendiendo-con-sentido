import { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { KatexRenderer } from './KatexRenderer';

interface FormulaCardProps {
  nombre: string;
  latex: string;
  explicacion: string;
}

export const FormulaCard = memo(function FormulaCard({
  nombre,
  latex,
  explicacion,
}: FormulaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{nombre}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-center rounded-md bg-muted/50 py-4">
            <KatexRenderer latex={latex} display />
          </div>
          <p className="text-sm text-muted-foreground">{explicacion}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
});
