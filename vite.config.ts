
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge .env local (utile pour le dev)
  // Fix: Casting process to any to access cwd() method which might be missing from the environment's Process type definition during build-time type checking.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Dans Cloudflare, les variables sont dans process.env ou chargées via loadEnv
  const config = {
    URL: process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || "",
    KEY: process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || "",
    GEMINI: process.env.API_KEY || env.API_KEY || "",
    ADMIN: process.env.VITE_ADMIN_EMAIL || env.VITE_ADMIN_EMAIL || "teletechnologyci@gmail.com"
  };

  return {
    plugins: [react()],
    define: {
      '__KITA_URL__': JSON.stringify(config.URL),
      '__KITA_KEY__': JSON.stringify(config.KEY),
      '__KITA_GEMINI__': JSON.stringify(config.GEMINI),
      '__KITA_ADMIN__': JSON.stringify(config.ADMIN),
      '__BUILD_TIME__': JSON.stringify(new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })),
      // Polyfill pour les bibliothèques qui attendent process.env
      'process.env.VITE_SUPABASE_URL': JSON.stringify(config.URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(config.KEY),
      'process.env.API_KEY': JSON.stringify(config.GEMINI),
      'process.env.VITE_ADMIN_EMAIL': JSON.stringify(config.ADMIN),
      'process.env': JSON.stringify({
        VITE_SUPABASE_URL: config.URL,
        VITE_SUPABASE_ANON_KEY: config.KEY,
        API_KEY: config.GEMINI,
        VITE_ADMIN_EMAIL: config.ADMIN
      }),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
    }
  };
});
