import { motion } from 'framer-motion';

export default function FondoAnimado({ color }) {
  return (
    <div className="presentacion-fondo" aria-hidden="true">
      <motion.span
        className="presentacion-blob presentacion-blob-1"
        animate={{ backgroundColor: color, x: [0, 60, -30, 0], y: [0, -40, 30, 0] }}
        transition={{ backgroundColor: { duration: 1 }, x: { duration: 22, repeat: Infinity }, y: { duration: 26, repeat: Infinity } }}
      />
      <motion.span
        className="presentacion-blob presentacion-blob-2"
        animate={{ backgroundColor: color, x: [0, -50, 40, 0], y: [0, 30, -30, 0] }}
        transition={{ backgroundColor: { duration: 1 }, x: { duration: 28, repeat: Infinity }, y: { duration: 20, repeat: Infinity } }}
      />
      <motion.span
        className="presentacion-blob presentacion-blob-3"
        animate={{ backgroundColor: color, x: [0, 30, -60, 0], y: [0, -20, 40, 0] }}
        transition={{ backgroundColor: { duration: 1 }, x: { duration: 24, repeat: Infinity }, y: { duration: 30, repeat: Infinity } }}
      />
    </div>
  );
}
