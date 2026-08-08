import { memo } from 'react';
import { motion } from 'framer-motion';
import type { MapaTransferenciaItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface MapaTransferenciaProps {
  items: MapaTransferenciaItem[];
}

export const MapaTransferencia = memo(function MapaTransferencia({
  items,
}: MapaTransferenciaProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de transferencia</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-md border border-border p-3 text-sm"
          >
            <div>
              <p className="font-medium">{item.concepto}</p>
              <p className="text-muted-foreground">{item.contextoOrigen}</p>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="text-right">
              <p className="text-muted-foreground">{item.contextoDestino}</p>
              <p className="text-xs italic">{item.conexion}</p>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
});
