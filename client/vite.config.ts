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
        target: 'http://backend:5001',
        changeOrigin: true,
        secure: false,
      },
      '/auth/*':{
        target: 'http://backend:5001',
        changeOrigin: true,
        secure: false
      },
      '/hospital': {
        target: 'http://backend:5001',
        changeOrigin: true,
        secure: false,
      },
      '/hospital/*': {
        target: 'http://backend:5001',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://agent:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});