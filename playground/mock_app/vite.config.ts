import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sourceMapUpload from '@heimdallr-sdk/vite-plugin-sourcemap-upload';

const BASE_URL = 'http://localhost:8001';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: BASE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace('/api', '')
      },
      '/crash-worker': {
        target: BASE_URL,
        changeOrigin: true
      }
    },
    open: true
  },
  build: {
    sourcemap: true
  },
  plugins: [
    react(),
    sourceMapUpload({
      app_name: 'playgroundAPP',
      url: `${BASE_URL}/sourcemap/upload`
    })
  ]
});
