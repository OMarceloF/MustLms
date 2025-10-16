import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
//import removeConsole from 'vite-plugin-remove-console';

export default defineConfig({
  root: './', // <- importante
  plugins: [
    react(),
    /*removeConsole({
      // Remove apenas em produção
      external: [],
      // Remove tudo: log, warn, error, etc.
      includes: ['log', 'info', 'warn', 'error', 'debug'],
    }),*/
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/notificacoes': 'http://localhost:3001',
      '/mensagens': 'http://localhost:3001',
      '/conversas': 'http://localhost:3001',
    },
  },
  esbuild: {
    target: 'esnext',
  },
});
