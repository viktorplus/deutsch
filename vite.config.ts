import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
const runtimeData = `${fileURLToPath(new URL('./data', import.meta.url)).replaceAll('\\', '/')}/**`;
export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1', port: 5173, strictPort: true,
    watch: { ignored: ['**/artifacts/**', runtimeData, '**/dist/**', '**/release/**', '**/.verification/**', '**/test-results/**', '**/playwright-report/**', '**/public/**'] },
  },
  test: { include: ['tests/**/*.test.ts'] },
});
