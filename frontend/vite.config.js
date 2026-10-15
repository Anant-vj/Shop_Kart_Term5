import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 4173,
    allowedHosts: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/customers': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/products': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/wishlist': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/cart': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/orders': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
