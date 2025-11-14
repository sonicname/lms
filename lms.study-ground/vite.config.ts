import EnvCaster from '@niku/vite-env-caster';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { camelCase } from 'es-toolkit';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    EnvCaster({
      transformKey: (plainKey) => camelCase(plainKey.replace('VITE_', '')),
      exportName: 'appEnv',
      declaration: 'app/@types/env.d.ts',
    }),
  ],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
  },
});
