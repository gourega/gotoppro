
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge toutes les variables du système, incluant celles de Cloudflare sans préfixe
  // Fix: Cast process to any to avoid TypeScript error on cwd() which is a standard Node.js method
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  const VITE_SUPABASE_URL = env.VITE_SUPABASE_URL || (process.env as any).VITE_SUPABASE_URL || "";
  const VITE_SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || (process.env as any).VITE_SUPABASE_ANON_KEY || "";
  const API_KEY = env.API_KEY || (process.env as any).API_KEY || "";
  const VITE_ADMIN_EMAIL = env.VITE_ADMIN_EMAIL || (process.env as any).VITE_ADMIN_EMAIL || "teletechnologyci@gmail.com";

  console.log("Vite Build: Variables detection active.");

  return {
    plugins: [react()],
    define: {
      // Pour l'accès via import.meta.env.VITE_...
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_ADMIN_EMAIL': JSON.stringify(VITE_ADMIN_EMAIL),
      
      // Pour l'accès via process.env... (Nécessaire pour les SDK comme Gemini)
      'process.env.VITE_SUPABASE_URL': JSON.stringify(VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(VITE_SUPABASE_ANON_KEY),
      'process.env.VITE_ADMIN_EMAIL': JSON.stringify(VITE_ADMIN_EMAIL),
      'process.env.API_KEY': JSON.stringify(API_KEY),
      
      // Métadonnées de build
      '__BUILD_TIME__': JSON.stringify(new Date().toLocaleString('fr-FR')),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
    }
  };
});
