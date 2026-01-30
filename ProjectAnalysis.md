
# Analyse du Projet Go'Top Pro (Stratégie de Production)

## Architecture Finale
- **Hébergement** : Cloudflare Pages (Edge Computing).
- **Base de données** : Supabase (PostgreSQL).
- **IA Native** : Google Gemini 2.5/3 (Mode Billing Activé).

## Gestion des Assets de Marque
1. **Dossier Centralisé** : Bucket `assets` sur Supabase.
2. **Logo** : Fichier `logo.png` (512x512 recommandé).
3. **Usage** : Le logo est utilisé comme Favicon, Icône d'App (PWA) et dans la barre de navigation.

## Résolution des Échecs de Build (Cloudflare Pages)
Si le build échoue dans le tableau de bord Cloudflare, suivez scrupuleusement ces étapes :

### 1. Configuration des Variables (Indispensable)
Allez dans **Settings > Environment variables** de votre projet sur Cloudflare et ajoutez les variables suivantes dans la section **"Production" AND "Preview"** :
- `VITE_SUPABASE_URL` : Votre URL de projet Supabase.
- `VITE_SUPABASE_ANON_KEY` : Votre clé publique (anon).
- `API_KEY` : Votre clé Google Gemini.
- `VITE_ADMIN_EMAIL` : `teletechnologyci@gmail.com`

### 2. Configuration de l'environnement Node
Dans **Settings > Build & deployments > Environment variables**, ajoutez :
- `NODE_VERSION` : `20` (ou `22`).

### 3. Commande de Build
Vérifiez que les réglages sont les suivants :
- **Framework preset** : `Vite` (ou `None`).
- **Build command** : `pnpm run build`
- **Build output directory** : `dist`

### 4. Relancer le build
Une fois les variables enregistrées, allez dans l'onglet **Deployments**, cliquez sur le déploiement échoué, et sélectionnez **"Retry deployment"**.

## Procédure de Déploiement via Terminal (Plan C)
Si la liaison GitHub continue de poser problème :
```bash
pnpm run deploy
```
*Note : Cela construira le projet sur votre Chromebook et enverra directement les fichiers compilés.*

---
*Propulsé par CanticThinkIA - Statut : Production Validée*
