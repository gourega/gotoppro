
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge toutes les variables, y compris celles injectées par Cloudflare sans préfixe VITE_
  const env = loadEnv(mode, process.cwd(), '');
  
  // Extraction avec fallbacks
  const SUPABASE_URL = env.VITE_SUPABASE_URL || "";
  const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY || "";
  const GEMINI_KEY = env.API_KEY || "";
  const ADMIN_EMAIL = env.VITE_ADMIN_EMAIL || "teletechnologyci@gmail.com";

  console.log("Vite Build: Injection des variables d'environnement...");

  return {
    plugins: [react()],
    define: {
      // Remplacement statique pour le navigateur (important pour les SDK)
      'process.env.API_KEY': JSON.stringify(GEMINI_KEY),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_KEY),
      'process.env.VITE_ADMIN_EMAIL': JSON.stringify(ADMIN_EMAIL),
      
      // Support import.meta.env
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_KEY),
      'import.meta.env.VITE_ADMIN_EMAIL': JSON.stringify(ADMIN_EMAIL),
      'import.meta.env.API_KEY': JSON.stringify(GEMINI_KEY),

      // Marqueur de version/temps pour debug
      '__BUILD_TIME__': JSON.stringify(new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
    }
  };
});
