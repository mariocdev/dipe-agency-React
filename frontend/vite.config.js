import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => {
  const wpDevUrl = loadEnv(mode, import.meta.dirname, 'WP_').WP_DEV_URL;

  return {
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
