
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

/**
 * Generates a dynamic quiz based on lesson topics.
 */
export const generateDynamicQuiz = async (topic: string, moduleTitle: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Rôle: Coach Kita. Sujet: "${topic}" (${moduleTitle}).
    Génère 3 questions de quiz et 2 exercices pratiques pour un gérant de salon en Côte d'Ivoire.
    Réponds en JSON uniquement.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json", 
        responseSchema: QUIZ_SCHEMA,
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

/**
 * NEW: Predictive BI Engine
 * Analyzes transaction history to predict trends and risks.
 */
export const analyzePredictiveBI = async (transactions: any[], userName: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const dataSummary = transactions.slice(0, 100).map(t => `${t.date}: ${t.amount} F (${t.label})`).join('\n');
  
  const prompt = `
    Rôle: Data Scientist Expert en Beauté (Mentor Coach Kita).
    Utilisateur: ${userName}.
    Données: ${dataSummary}
    
    TÂCHE: Analyse ces données pour produire une Intelligence Prédictive.
    1. [MÉTÉO] : Prévision de tendance pour les 7 prochains jours (Haute / Stable / Risque de baisse).
    2. [CHIFFRE] : Estimation du CA potentiel à gagner la semaine prochaine.
    3. [RISQUE] : Identifie un risque spécifique (ex: clients fidèles qui ne reviennent plus, dépenses trop hautes).
    4. [ACTION] : Donne une seule action prioritaire pour "battre" ces prédictions.
    
    TON: Expert, visionnaire, motivant. Utilise exclusivement le Franc CFA. 
    Format court et impactant.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text;
  } catch (err) {
    return null;
  }
};

/**
 * Generates personalized strategic advice for salon gérants.
 */
export const generateStrategicAdvice = async (
  negativePoints: string[], 
  isPerfectScore: boolean = false,
  userContext?: { firstName: string; gender: 'M' | 'F'; domain: string }
) => {
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
      OBJECTIF : Lui faire comprendre que l'excellence actuelle est un plateau dangereux et qu'il doit viser l'expansion.
    `;
  } else {
    const pointsStr = negativePoints.join(", ");
    prompt = `
      Rôle: Coach Kita, mentor d'affaires expert d'Abidjan.
      Destinataire: ${name}, ${sibling} ${passionLabel} de ${domain}.
      Ton: "Grand frère" expert, sans filtre, autoritaire mais bienveillant.
      SITUATION : Ce gérant perd de l'argent sur : ${pointsStr}.
      MONNAIE : Franc CFA (FCFA) uniquement. Ne mentionne jamais l'euro.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.9, topP: 0.95 }
    });
    return response.text;
  } catch (error) {
    return `**L'excellence vous attend, ${name}. Votre plan est prêt.**`;
  }
};

/**
 * Analyzes transaction data for business insights.
 */
export const analyzeBusinessTrends = async (transactions: any[], userName: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const dataSummary = transactions.slice(0, 50).map(t => `${t.date}: ${t.type} ${t.amount} (${t.label})`).join('\n');
  
  const prompt = `
    Rôle: Coach Kita. Destinataire: ${userName}.
    Analyse les 50 dernières transactions de ce salon :
    ${dataSummary}
    
    TÂCHE : 
    Donne un conseil ultra-précis (max 3 phrases) sur une tendance observée. 
    Sois exigeant sur la rentabilité. Utilise le Franc CFA.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text;
  } catch (err) {
    return null;
  }
};

/**
 * Uses multimodal input to analyze salon work and generate social content.
 */
export const analyzeBeautyImage = async (base64Data: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Tu es Coach Kita. Analyse cette photo de réalisation. Identifie la technique, rédige une légende Instagram percutante et WhatsApp, et donne un conseil mentor pour vendre ce service plus cher. Réponds au format [TECHNIQUE], [INSTAGRAM], [WHATSAPP], [CONSEIL], [HASHTAGS].`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } }, 
          { text: prompt }
        ] 
      }
    });
    return response.text;
  } catch (error) {
    throw new Error("Erreur d'analyse IA.");
  }
};

/**
 * Starts a new chat session with Coach Kita.
 */
export const createCoachChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "Tu es Coach Kita, l'expert mentor de Go'Top Pro basé à Abidjan. Ton ton est exigeant, visionnaire, mais bienveillant. Utilise exclusivement le Franc CFA (FCFA) comme monnaie. Tu parles à des gérants de salons qui veulent devenir des leaders.",
    },
  });
};
