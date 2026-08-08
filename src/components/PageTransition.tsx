import { memo } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

const VARIANTES = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
} as const;

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Envoltorio de transicion cinematica compartido por todas las paginas: fade + slide-up al
 * entrar, fade + slide-up inverso al salir. Se usa dentro de un <AnimatePresence> que vive por
 * encima del router (ver AppRoutes) para que el fondo MathBackground, montado fuera de esta
 * jerarquia, nunca se desmonte ni re-renderice entre paginas.
 */
export const PageTransition = memo(function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      variants={VARIANTES}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
});
