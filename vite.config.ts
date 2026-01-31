
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables du fichier .env et de process.env (Cloudflare)
  const env = loadEnv(mode, process.cwd(), '');
  
  // On s'assure d'avoir des valeurs même vides pour éviter les crashs de JSON.stringify
  const config = {
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "",
    API_KEY: env.API_KEY || process.env.API_KEY || "",
    VITE_ADMIN_EMAIL: env.VITE_ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || "teletechnologyci@gmail.com"
  };

  console.log("Vite Build Configuration: Injecting variables...");

  return {
    plugins: [react()],
    define: {
      // Injection pour import.meta.env (standard Vite)
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(config.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(config.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_ADMIN_EMAIL': JSON.stringify(config.VITE_ADMIN_EMAIL),
      'import.meta.env.API_KEY': JSON.stringify(config.API_KEY),
      
      // Injection pour process.env (SDK Gemini et fallback)
      'process.env.VITE_SUPABASE_URL': JSON.stringify(config.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(config.VITE_SUPABASE_ANON_KEY),
      'process.env.API_KEY': JSON.stringify(config.API_KEY),
      'process.env.VITE_ADMIN_EMAIL': JSON.stringify(config.VITE_ADMIN_EMAIL),
      
      // Meta données
      '__BUILD_TIME__': JSON.stringify(new Date().toLocaleString('fr-FR')),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
    }
  };
});
