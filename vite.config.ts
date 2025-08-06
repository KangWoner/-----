import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // Vite automatically loads .env files and exposes them via import.meta.env
    // The VITE_ prefix is required for variables to be exposed to the client.
    // No custom `define` block is needed for this.
    return {
      resolve: {
        alias: {
          // Allowing '@/' to resolve to the project root.
          // Note: Vite resolves from the root, so `src` is needed in paths.
          // e.g., `import Thing from '@/src/components/Thing'`
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
