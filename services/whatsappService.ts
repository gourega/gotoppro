import { supabase } from './supabase';
import { GoogleGenAI } from "@google/genai";

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
 * Utilise Gemini pour rédiger un message de remerciement personnalisé
 */
export const generateSmartReceiptMessage = async (clientName: string, services: string, amount: number, establishmentName: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Rôle: Community Manager d'un salon de coiffure de luxe nommé "${establishmentName}".
    Client: ${clientName || 'Cher(e) Client(e)'}.
    Prestations: ${services}.
    Montant: ${amount} FCFA.
    
    TÂCHE: Rédige un message WhatsApp de remerciement très court, chaleureux et professionnel. 
    Ajoute un conseil rapide sur l'entretien des cheveux/soins. 
    Utilise des emojis. Format: "Bonjour [Nom]... [Message]... [Conseil]... À bientôt chez ${establishmentName}".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text;
  } catch (err) {
    return `Merci ${clientName || 'pour votre visite'} ! Votre reçu de ${amount} FCFA chez ${establishmentName} est validé. À très bientôt !`;
  }
};

/**
 * Déclenche l'envoi via l'API officielle via Supabase Edge Function
 */
export const sendWhatsAppReceipt = async (
  transactionId: string, 
  targetPhone: string, 
  message: string
) => {
  if (!supabase) return { success: false, error: "Supabase non configuré" };

  try {
    const { data, error } = await (supabase.functions as any).invoke('whatsapp-send', {
      body: { 
        transactionId, 
        phone: formatWhatsAppNumber(targetPhone),
        message 
      }
    });

    if (error) throw error;
    
    await supabase.from('kita_transactions').update({ whatsapp_sent: true }).eq('id', transactionId);
    
    return { success: true, data };
  } catch (err: any) {
    console.error("WhatsApp API Error:", err);
    return { success: false, error: err.message };
  }
};