import EnvCaster from '@niku/vite-env-caster';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { camelCase } from 'es-toolkit';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    EnvCaster({
      transformKey: (plainKey) => camelCase(plainKey.replace('VITE_', '')),
      exportName: 'appEnv',
      declaration: 'src/@types/env.d.ts',
    }),
  ],
});
