import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sourceMapUpload from '@heimdallr-sdk/vite-plugin-sourcemap-upload';

<<<<<<< HEAD
const BASE_URL = 'http://localhost:8001';

=======
>>>>>>> a5faafa41386477bdfbef9f0591c95593afec86f
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
<<<<<<< HEAD
        target: BASE_URL,
=======
        target: 'http://localhost:8001',
>>>>>>> a5faafa41386477bdfbef9f0591c95593afec86f
        changeOrigin: true,
        rewrite: (path) => path.replace('/api', '')
      },
      '/crash-worker': {
<<<<<<< HEAD
        target: BASE_URL,
=======
        target: 'http://localhost:8001',
>>>>>>> a5faafa41386477bdfbef9f0591c95593afec86f
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
<<<<<<< HEAD
      url: `${BASE_URL}/sourcemap/upload`
=======
      url: `http://localhost:8001/sourcemap/upload`
>>>>>>> a5faafa41386477bdfbef9f0591c95593afec86f
    })
  ]
});
