// @ts-ignore: Deno types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Fix: Declare Deno global variable to resolve TypeScript errors for Deno.env in Edge Functions
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestion du CORS (Pre-flight request)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, message, transactionId } = await req.json()

    // Fix: Access environment variables using Deno.env which is now recognized due to the global declaration
    // Récupération des secrets configurés dans Supabase
    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN')
    const PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')

    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      throw new Error("Configuration WhatsApp manquante sur le serveur.")
    }

    // Appel à l'API Meta Graph
    // On utilise ici un message de type 'text'. 
    // Note: Pour des messages hors fenêtre de 24h, Meta impose l'usage de Templates validés.
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: message }
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error?.message || "Erreur Meta API")
    }

    return new Response(
      JSON.stringify({ success: true, meta_id: result.messages?.[0]?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})