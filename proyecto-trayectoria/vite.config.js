import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' usa rutas relativas, así funciona en GitHub Pages
// sin importar el nombre del repo (no hay que tocarlo al desplegar).
export default defineConfig({
  plugins: [react()],
  base: './',
});
