
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // On charge TOUTES les variables (préfixe vide '') pour capturer process.env de Cloudflare
  const env = loadEnv(mode, process.cwd(), '');
  
  const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  const GEMINI_KEY = env.API_KEY || process.env.API_KEY || "";
  const ADMIN_EMAIL = env.VITE_ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || "teletechnologyci@gmail.com";

  // Ces logs seront visibles dans votre console de déploiement Cloudflare (Build Logs)
  console.log("--- CLOUDFLARE BUILD ENGINE ---");
  console.log("URL Found:", SUPABASE_URL ? "YES" : "NO");
  console.log("KEY Found:", SUPABASE_KEY ? "YES" : "NO");
  console.log("GEMINI Found:", GEMINI_KEY ? "YES" : "NO");
  console.log("-------------------------------");

  return {
    plugins: [react()],
    define: {
      // Injection via constantes globales (priorité 1)
      '__KITA_URL__': JSON.stringify(SUPABASE_URL),
      '__KITA_KEY__': JSON.stringify(SUPABASE_KEY),
      '__KITA_GEMINI__': JSON.stringify(GEMINI_KEY),
      '__KITA_ADMIN__': JSON.stringify(ADMIN_EMAIL),
      '__BUILD_TIME__': JSON.stringify(new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })),
      
      // Compatibilité process.env (priorité 2)
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
