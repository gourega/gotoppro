
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables des fichiers .env
  const envFile = loadEnv(mode, process.cwd(), '');
  
  // FUSION : On donne la priorité aux variables du tableau de bord Cloudflare (process.env)
  // puis on complète avec les fichiers .env
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || envFile.VITE_SUPABASE_URL || "";
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || envFile.VITE_SUPABASE_ANON_KEY || "";
  const GEMINI_KEY = process.env.API_KEY || envFile.API_KEY || "";
  const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || envFile.VITE_ADMIN_EMAIL || "teletechnologyci@gmail.com";

  console.log("Vite Build: Vérification des secrets...");
  if (!SUPABASE_URL) console.warn("Attention: VITE_SUPABASE_URL est vide au build.");
  if (!SUPABASE_KEY) console.warn("Attention: VITE_SUPABASE_ANON_KEY est vide au build.");

  return {
    plugins: [react()],
    define: {
      // Injection statique pour le navigateur
      'process.env.API_KEY': JSON.stringify(GEMINI_KEY),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_KEY),
      'process.env.VITE_ADMIN_EMAIL': JSON.stringify(ADMIN_EMAIL),
      
      // Support import.meta.env
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_KEY),
      'import.meta.env.VITE_ADMIN_EMAIL': JSON.stringify(ADMIN_EMAIL),
      'import.meta.env.API_KEY': JSON.stringify(GEMINI_KEY),

      // Marqueur de temps pour confirmer le déploiement
      '__BUILD_TIME__': JSON.stringify(new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
    }
  };
});
