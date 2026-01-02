import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Explicitly casting 'process' to 'any' allows access to the Node.js 'cwd()' method in the Vite configuration environment.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // On ne transmet que les variables nécessaires pour éviter d'exposer des secrets système sensibles (comme PATH, etc.)
  const exposedEnv = {
    API_KEY: env.API_KEY,
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
    VITE_ADMIN_EMAIL: env.VITE_ADMIN_EMAIL,
    NODE_ENV: env.NODE_ENV
  };

  return {
    plugins: [react()],
    define: {
      'process.env': exposedEnv
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});