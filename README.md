
# 🚀 Go'Top Pro - Excellence & IA

Plateforme de transformation pour salons de coiffure, optimisée par l'IA Gemini et Supabase.

## 📦 Déploiement Cloudflare Pages (Production)

1.  **Préparation Git** :
    ```bash
    git init
    git add .
    git commit -m "feat: setup production ready project"
    git branch -M main
    git remote add origin https://github.com/VOTRE_PSEUDO/gotop-pro.git
    git push -u origin main
    ```

2.  **Configuration Cloudflare** :
    - Connectez votre repo GitHub sur le dashboard Cloudflare Pages.
    - **Build Command** : `npm run build`
    - **Output Directory** : `dist`
    - **Variables d'environnement (Settings > Functions > Variables)** :
        - `API_KEY` : Votre clé Gemini Google AI Studio.
        - `VITE_SUPABASE_URL` : URL de votre projet Supabase.
        - `VITE_SUPABASE_ANON_KEY` : Clé anonyme de votre projet Supabase.

## 🛠 Stack Technique
- **Frontend** : React 19 / Vite / Tailwind CSS.
- **Backend** : Supabase (PostgreSQL + Auth SMS).
- **IA** : Google Gemini 3 Flash Preview.
- **Hébergement** : Cloudflare Pages (Edge network).

## 🛡️ Sécurité
Toutes les clés sensibles doivent être injectées via les variables d'environnement Cloudflare. Le fichier `.gitignore` empêche la fuite de fichiers locaux.

---
Propulsé par **CanticThinkIA**
