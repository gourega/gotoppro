
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
    - **Variables d'environnement** :
        - `API_KEY` : Clé Gemini (Forfait Pay-as-you-go recommandé).
        - `VITE_SUPABASE_URL` : URL Supabase.
        - `VITE_SUPABASE_ANON_KEY` : Clé anonyme Supabase.

## 💰 Gestion du Quota IA
Pour garantir la stabilité de la fonction **Audio Masterclass**, l'API Key doit être liée à un projet Google Cloud avec facturation activée. 
- **Modèle Audio** : `gemini-2.5-flash-preview-tts`
- **Modèle Texte** : `gemini-3-flash-preview`
Ceci lève la limite de 15 requêtes/minute et assure une expérience fluide sans erreurs 429.

## 🛠 Stack Technique
- **Frontend** : React 19 / Vite / Tailwind CSS.
- **Backend** : Supabase (PostgreSQL + Auth SMS).
- **IA** : Google Gemini (Flash series).
- **Hébergement** : Cloudflare Pages.

## 🛡️ Sécurité
Toutes les clés sensibles doivent être injectées via les variables d'environnement Cloudflare. Ne jamais commiter la clé API directement dans le code.

---
Propulsé par **CanticThinkIA**
