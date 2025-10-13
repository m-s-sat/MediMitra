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
      '/api':{
        target: 'http://backend',
        changeOrigin: true,
        secure: false,
      },
      '/agent': {
        target: 'http://agent',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});