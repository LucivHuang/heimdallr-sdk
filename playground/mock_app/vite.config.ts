import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sourceMapUpload from '@heimdallr-sdk/vite-plugin-sourcemap-upload';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api', '')
      },
      '/crash-worker': {
        target: 'http://localhost:8001',
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
      url: `http://localhost:8001/sourcemap/upload`
    })
  ]
});
