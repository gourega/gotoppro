// @ts-ignore: Deno types
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

declare const Deno: any;

const KITA_SECRET = "KITA_WEBHOOK_SECURE_2024";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-kita-auth',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('KITA_SUPABASE_URL') ?? '',
    Deno.env.get('KITA_SERVICE_ROLE_KEY') ?? ''
  );

  let logEntry = { sender: 'Inconnu', message: '', status: 'ÉCHEC', details: '' };

  try {
    const authHeader = req.headers.get('X-Kita-Auth');
    if (authHeader !== KITA_SECRET) {
      console.error("Auth Failed");
      return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401, headers: corsHeaders });
    }

    const { message, from } = await req.json();
    logEntry.sender = from;
    logEntry.message = message;

    const amountMatch = message.match(/(\d+(?:[\s.]\d+)*)\s*[fF]/);
    const phoneMatch = message.match(/(?:01|05|07)\d{8}/);

    if (!amountMatch || !phoneMatch) {
      logEntry.details = "Format SMS non reconnu.";
      await supabaseAdmin.from('automation_logs').insert([logEntry]);
      return new Response(JSON.stringify({ error: 'Format invalide' }), { status: 400, headers: corsHeaders });
    }

    const amount = parseInt(amountMatch[1].replace(/[\s.]/g, ''));
    let phone = phoneMatch[0];
    if (!phone.startsWith('+225')) phone = `+225${phone}`;

    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('phoneNumber', phone).maybeSingle();

    if (!profile) {
      logEntry.status = "ALERTE";
      logEntry.details = `Paiement de ${amount}F reçu pour ${phone}, mais ce numéro n'existe pas en base.`;
      await supabaseAdmin.from('automation_logs').insert([logEntry]);
      return new Response(JSON.stringify({ error: 'Client inconnu' }), { status: 404, headers: corsHeaders });
    }

    const updates: any = { isActive: true };
    const ALL_MODULES = ["mod_accueil_tel", "mod_diagnostic", "mod_hygiene", "mod_shampoing", "mod_pricing", "mod_management", "mod_fidelisation", "mod_digital", "mod_color", "mod_retail", "mod_coupe", "mod_planning", "mod_psychologie", "mod_vip", "mod_chiffres", "mod_formalisation"];

    // CAS COLLABORATEUR (2 500 F)
    if (amount === 2500) {
      updates.role = 'STAFF_ELITE';
      updates.purchasedModuleIds = ALL_MODULES;
    }

    // CAS ELITE (10 000 F)
    if (amount >= 10000) {
      updates.isKitaPremium = true;
      updates.purchasedModuleIds = ALL_MODULES;
    }

    // CAS EXCELLENCE TOTALE (15 000 F)
    if (amount >= 15000) {
      updates.hasPerformancePack = true;
      updates.hasStockPack = true;
    }

    await supabaseAdmin.from('profiles').update(updates).eq('uid', profile.uid);

    logEntry.status = "SUCCÈS";
    logEntry.details = `Compte de ${profile.firstName} activé (${amount} F). Rôle: ${updates.role || profile.role}`;
    await supabaseAdmin.from('automation_logs').insert([logEntry]);

    return new Response(JSON.stringify({ success: true, message: logEntry.details }), { status: 200, headers: corsHeaders });

  } catch (err) {
    logEntry.details = `Erreur: ${err.message}`;
    await supabaseAdmin.from('automation_logs').insert([logEntry]);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
})