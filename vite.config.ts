
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Charge toutes les variables possibles du fichier .env et de l'environnement systeme
  const env = loadEnv(mode, process.cwd(), '');
  
  // On priorise process.env (Cloudflare) puis env (.env local)
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || "";
  const API_KEY = process.env.API_KEY || env.API_KEY || "";
  const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || env.VITE_ADMIN_EMAIL || "";

  return {
    plugins: [react()],
    define: {
      // Remplacement statique STRICT pour forcer Vite à graver les valeurs dans le JS
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_ANON_KEY),
      'import.meta.env.VITE_ADMIN_EMAIL': JSON.stringify(ADMIN_EMAIL),
      'import.meta.env.API_KEY': JSON.stringify(API_KEY),
      
      // Compatibilité process.env pour certains SDK
      'process.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_ANON_KEY),
      'process.env.API_KEY': JSON.stringify(API_KEY),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
    }
  };
});
