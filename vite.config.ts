// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],

  // ======================================
  // CONFIGURACIÓN DE DESARROLLO (Proxy/CORS)
  // ======================================
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // ======================================
  // CONFIGURACIÓN DE PRUEBAS UNITARIAS (VITEST)
  // ======================================
  test: {
    globals: true, // expect, describe, it disponibles globalmente
    environment: 'jsdom', // Simula navegador
    setupFiles: './src/setupTests.ts', // Config inicial (jest-dom, mocks, etc.)
    css: true, // Permite importar CSS
    include: ['test/**/*.test.{ts,tsx}'],

    // 🧾 Reportes
    reporters: ['default', 'html'], // genera consola + HTML visual

    // 🧪 Cobertura de código
    coverage: {
      provider: 'v8', // Usa el motor V8 de Node (más rápido)
      reporter: ['text', 'html', 'lcov'], // genera consola + HTML navegable
      reportsDirectory: './coverage', // carpeta de salida

    },
  },
});
