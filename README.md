# 🚀 Go'Top Pro - Excellence & IA

## ⚡ Automatisation Wave (Edge Functions)

La fonction `wave-webhook` est active. Elle traite les SMS Wave entrants pour activer les comptes gérants.

### 1. Configuration des Secrets
Assurez-vous que ces deux secrets sont configurés sur Supabase :
```bash
npx supabase secrets set KITA_SUPABASE_URL=https://uyqjorpvmqremxbfeepl.supabase.co
npx supabase secrets set KITA_SERVICE_ROLE_KEY=VOTRE_CLE_SERVICE_ROLE
```

### 2. Configuration MacroDroid
- **Déclencheur** : Réception SMS (Contenu : "Vous avez reçu")
- **Action** : Requête HTTP POST
- **URL** : `https://uyqjorpvmqremxbfeepl.supabase.co/functions/v1/wave-webhook`
- **Header** : `X-Kita-Auth: KITA_WEBHOOK_SECURE_2024`
- **Body (JSON)** : 
  ```json
  {
    "message": "{sms_body}",
    "from": "{sms_number}"
  }
  ```

### 3. Comment tester ?
Vous pouvez simuler un SMS Wave avec la commande suivante dans votre terminal Chromebook :
```bash
curl -i -X POST https://uyqjorpvmqremxbfeepl.supabase.co/functions/v1/wave-webhook \
  -H "X-Kita-Auth: KITA_WEBHOOK_SECURE_2024" \
  -H "Content-Type: application/json" \
  -d '{"message": "Vous avez reçu 15.000F de 0707070707", "from": "Wave"}'
```
*Note : Remplacez 0707070707 par votre propre numéro de test déjà présent dans votre base.*

---
Propulsé par **CanticThinkIA**