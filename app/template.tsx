'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      // Начальное состояние (страница невидима и чуть ниже)
      initial={{ opacity: 0, y: 20 }}
      // Конечное состояние (страница видна и на месте)
      animate={{ opacity: 1, y: 0 }}
      // Параметры анимации (плавность и время)
      transition={{ ease: 'easeInOut', duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}