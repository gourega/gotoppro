
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Charge les variables du fichier .env (local) ET de l'environnement système (Cloudflare)
  const env = loadEnv(mode, process.cwd(), '');
  
  // On récupère les valeurs soit du système (Cloudflare), soit du fichier .env
  const API_KEY = process.env.API_KEY || env.API_KEY || "";
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || "";
  const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || env.VITE_ADMIN_EMAIL || "";

  return {
    plugins: [react()],
    define: {
      // Cette étape remplace statiquement les appels dans le code source
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_ANON_KEY),
      'import.meta.env.VITE_ADMIN_EMAIL': JSON.stringify(ADMIN_EMAIL),
      'import.meta.env.API_KEY': JSON.stringify(API_KEY),
      // On garde process.env pour la compatibilité avec certains modules
      'process.env.API_KEY': JSON.stringify(API_KEY),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_ANON_KEY),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
    }
  };
});
