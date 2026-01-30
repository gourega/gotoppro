import { GoogleGenAI, Type } from "@google/genai";

const QUIZ_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    quiz_questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.INTEGER, description: "0-3 index" },
          explanation: { type: Type.STRING }
        },
        propertyOrdering: ["question", "options", "correctAnswer", "explanation"]
      }
    },
    exercises: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  propertyOrdering: ["quiz_questions", "exercises"]
} as any;

// Removed getApiKey helper to comply with direct process.env.API_KEY usage requirement

export const generateDynamicQuiz = async (topic: string, moduleTitle: string) => {
  // Fix: Initializing GoogleGenAI with process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Rôle: Coach Kita. Sujet: "${topic}" (${moduleTitle}).
    Génère 3 questions de quiz et 2 exercices pratiques.
    Réponds en JSON uniquement.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: prompt }] },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: QUIZ_SCHEMA,
      }
    });
    return JSON.parse(response.text?.trim() || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const generateStrategicAdvice = async (
  negativePoints: string[], 
  isPerfectScore: boolean = false,
  userContext?: { firstName: string; gender: 'M' | 'F'; domain: string }
) => {
  // Fix: Initializing GoogleGenAI with process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const name = userContext?.firstName || "Ami";
  const sibling = userContext?.gender === 'F' ? "petite sœur" : "petit frère";
  const passionLabel = userContext?.gender === 'F' ? "passionnée" : "passionné";
  const domain = userContext?.domain || "beauté";
  
  let prompt = "";
  
  if (isPerfectScore) {
    prompt = `
      Rôle: Coach Kita, mentor d'élite de Go'Top Pro à Abidjan. 
      Destinataire: ${name}, ${passionLabel} de ${domain}.
      Ton: Direct, provocateur, visionnaire. Tu l'appelles "${sibling}".
      CONTEXTE : Le score au diagnostic est de 16/16.
      MONNAIE : Franc CFA (FCFA) uniquement.
      OBJECTIF : Lui faire comprendre que l'excellence actuelle est un plateau dangereux.
    `;
  } else {
    const pointsStr = negativePoints.join(", ");
    prompt = `
      Rôle: Coach Kita, mentor d'affaires expert d'Abidjan.
      Destinataire: ${name}, ${sibling} ${passionLabel} de ${domain}.
      Ton: "Grand frère" expert, sans filtre, autoritaire mais bienveillant.
      SITUATION : Ce gérant perd de l'argent sur : ${pointsStr}.
      MONNAIE : Franc CFA (FCFA) uniquement.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
      config: { temperature: 0.9, topP: 0.95 }
    });
    return response.text;
  } catch (error) {
    return `**L'excellence vous attend, ${name}.**`;
  }
};

/**
 * Analyse proactive des tendances du salon
 */
export const analyzeBusinessTrends = async (transactions: any[], userName: string) => {
  // Fix: Initializing GoogleGenAI with process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const dataSummary = transactions.slice(0, 50).map(t => `${t.date}: ${t.type} ${t.amount} (${t.label})`).join('\n');
  
  const prompt = `
    Rôle: Coach Kita. Destinataire: ${userName}.
    Analyse les 50 dernières transactions de ce salon de coiffure/beauté :
    ${dataSummary}
    
    TÂCHE : 
    Donne un conseil ultra-précis (max 3 phrases) sur une tendance observée (ex: baisse de revenus, trop de dépenses divers, ou pic de succès). 
    Sois encourageant mais exigeant. Utilise le Franc CFA.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] }
    });
    return response.text;
  } catch (err) {
    return null;
  }
};

export const analyzeBeautyImage = async (base64Data: string, mimeType: string) => {
  // Fix: Initializing GoogleGenAI with process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Tu es Coach Kita. Analyse cette photo de beauté. Identifie la technique, rédige une légende Instagram et WhatsApp, et donne un conseil mentor.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ inlineData: { data: base64Data, mimeType: mimeType } }, { text: prompt }] }
    });
    return response.text;
  } catch (error) {
    throw new Error("Erreur d'analyse.");
  }
};

export const createCoachChat = () => {
  // Fix: Initializing GoogleGenAI with process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "Tu es Coach Kita, l'expert mentor de Go'Top Pro basé à Abidjan. Ton ton est exigeant, visionnaire, mais bienveillant. Utilise exclusivement le Franc CFA (FCFA) comme monnaie.",
    },
  });
};