import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => {
  const wpDevUrl = loadEnv(mode, import.meta.dirname, 'WP_').WP_DEV_URL;

  return {
    // El CSS se sirve desde el tema de WordPress, no desde la raíz del dominio.
    // Las URLs relativas conservan juntos cada bundle y sus fuentes versionadas.
    base: './',
    plugins: [react()],
    server: wpDevUrl ? {
      proxy: {
        '/wp-json': { target: wpDevUrl, changeOrigin: true },
      },
    } : {},
    build: {
      outDir: resolve(import.meta.dirname, '../wp-content/themes/dipe-react/assets'),
      emptyOutDir: true,
      manifest: true,
      rolldownOptions: {
        input: resolve(import.meta.dirname, 'src/main.jsx'),
      },
    },
  };
});
