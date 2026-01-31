
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Charge les variables du fichier .env ET de l'environnement système (Cloudflare)
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Priorité aux variables système (Cloudflare) puis aux fichiers .env
  const API_KEY = process.env.API_KEY || env.API_KEY || "";
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || "";
  const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || env.VITE_ADMIN_EMAIL || "";

  console.log(`Go'Top Pro Build [${mode}]: Configuration des variables...`);

  return {
    plugins: [react()],
    define: {
      // Injection robuste pour le code client
      'process.env.API_KEY': JSON.stringify(API_KEY),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_ANON_KEY),
      'process.env.VITE_ADMIN_EMAIL': JSON.stringify(ADMIN_EMAIL),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      cssMinify: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'genai': ['@google/genai'],
            'supabase': ['@supabase/supabase-js']
          }
        }
      }
    }
  };
});
