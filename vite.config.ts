
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge .env local si existant
  const env = loadEnv(mode, process.cwd(), '');
  
  // Récupération multi-sources (Process Env Cloudflare > Fichier .env local)
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || "";
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || "";
  const GEMINI_KEY = process.env.API_KEY || env.API_KEY || "";
  const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || env.VITE_ADMIN_EMAIL || "teletechnologyci@gmail.com";

  return {
    plugins: [react()],
    define: {
      // On définit des constantes globales pour le code client
      // Elles sont injectées au moment du build
      '__KITA_URL__': JSON.stringify(SUPABASE_URL),
      '__KITA_KEY__': JSON.stringify(SUPABASE_KEY),
      '__KITA_GEMINI__': JSON.stringify(GEMINI_KEY),
      '__KITA_ADMIN__': JSON.stringify(ADMIN_EMAIL),
      '__BUILD_TIME__': JSON.stringify(new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })),
      
      // Fallback pour les librairies tierces
      'process.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_KEY),
      'process.env.API_KEY': JSON.stringify(GEMINI_KEY),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
    }
  };
});
