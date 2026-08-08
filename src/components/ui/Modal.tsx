import { memo, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';

const SPRING = { type: 'spring', stiffness: 300, damping: 26 } as const;

interface ModalProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo?: string;
  descripcion?: string;
  children: ReactNode;
  className?: string;
}

export const Modal = memo(function Modal({
  abierto,
  onCerrar,
  titulo,
  descripcion,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={abierto} onOpenChange={(open) => !open && onCerrar()}>
      <AnimatePresence>
        {abierto && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                className={cn(
                  'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6',
                  'border-[rgba(8,145,178,0.2)] bg-[rgba(255,255,255,0.96)] backdrop-blur-[20px] backdrop-saturate-[1.8]',
                  'shadow-[0_16px_48px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.7)]',
                  className,
                )}
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 16 }}
                transition={SPRING}
              >
                {titulo && (
                  <Dialog.Title className="font-display text-lg font-semibold text-math-white">
                    {titulo}
                  </Dialog.Title>
                )}
                {descripcion && (
                  <Dialog.Description className="mt-1 text-sm text-math-silver">
                    {descripcion}
                  </Dialog.Description>
                )}
                <div className="mt-4">{children}</div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
});
