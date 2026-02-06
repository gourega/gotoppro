
import { supabase } from './supabase';

/**
 * Normalise le numéro au format international +225...
 */
export const formatWhatsAppNumber = (phone: string): string => {
  let clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `+225${clean}`;
  }
  if (clean.startsWith('225') && clean.length === 13) {
    return `+${clean}`;
  }
  return clean.startsWith('+') ? clean : `+${clean}`;
};

/**
 * Déclenche l'envoi d'un reçu via l'API officielle WhatsApp Business (via Supabase Edge Function)
 */
export const sendWhatsAppReceipt = async (
  transactionId: string, 
  targetPhone: string, 
  establishmentName: string
) => {
  if (!supabase) return { success: false, error: "Supabase non configuré" };

  try {
    // On appelle la fonction Edge 'whatsapp-receipt'
    // Elle s'occupe de la communication avec Meta et du template de message
    const { data, error } = await (supabase.functions as any).invoke('whatsapp-receipt', {
      body: { 
        transactionId, 
        phone: formatWhatsAppNumber(targetPhone),
        establishmentName 
      }
    });

    if (error) throw error;
    
    // Mettre à jour le statut dans la DB locale si nécessaire
    await supabase.from('kita_transactions').update({ whatsapp_sent: true }).eq('id', transactionId);
    
    return { success: true, data };
  } catch (err: any) {
    console.error("WhatsApp API Error:", err);
    return { success: false, error: err.message };
  }
};
