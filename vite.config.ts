import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ⚠️ ВАЖНО: измени на имя своего репозитория на GitHub
export default defineConfig({
  plugins: [react()],
  base: '/java-collections-visualizer/',
});