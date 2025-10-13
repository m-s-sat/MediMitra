import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server:{
    proxy:{
      '/auth':{
        target: 'http://backend',
        changeOrigin: true,
        secure: false,
      },
      '/auth/*':{
        target: 'http://backend',
        changeOrigin: true,
        secure: false
      },
      '/hospital': {
        target: 'http://backend',
        changeOrigin: true,
        secure: false,
      },
      '/hospital/*': {
        target: 'http://backend',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://agent',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});