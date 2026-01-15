
import { GoogleGenAI, Type } from "@google/genai";

// Schema for the quiz remains consistent
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
 * Generates a dynamic quiz using the Pro model for better pedagogical quality.
 */
export const generateDynamicQuiz = async (topic: string, moduleTitle: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Rôle: Coach Kita. Sujet: "${topic}" (${moduleTitle}).
    Génère 3 questions de quiz et 2 exercices pratiques.
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
    return JSON.parse(response.text?.trim() || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

/**
 * Generates a high-converting strategic summary using AIDA copywriting model.
 * Focused on professional transformation and urgency.
 */
export const generateStrategicAdvice = async (negativePoints: string[], isPerfectScore: boolean = false) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = "";
  
  if (isPerfectScore) {
    prompt = `
      Rôle: Coach Kita, mentor d'élite de Go'Top Pro à Abidjan. 
      Situation: Gérant de salon avec un score parfait de 16/16.
      
      CONTEXTE MONÉTAIRE : Utilise exclusivement le Franc CFA (FCFA). Ne mentionne JAMAIS l'Euro.
      TON : Direct, provocateur, visionnaire.
      OBJECTIF : Lui faire comprendre que l'excellence actuelle est un plateau dangereux.
      
      STRUCTURE OBLIGATOIRE (Markdown) :
      Écoute-moi bien. Ton salon tourne, mais il stagne. L'excellence n'est pas une destination, c'est une discipline.
      
      1. **Attention**: Phrase choc sur le risque de la zone de confort.
      2. **Intérêt**: Pourquoi la maîtrise technique ne suffit plus pour bâtir un empire.
      3. **Désir**: Peins la vision du gérant-investisseur libre.
      4. **Action**: Recommande l'activation du Pack Elite.
    `;
  } else {
    const pointsStr = negativePoints.join(", ");
    prompt = `
      Rôle: Coach Kita, mentor d'affaires expert du marché ivoirien.
      Situation: Le gérant perd de l'argent sur : ${pointsStr}.
      
      CONTEXTE MONÉTAIRE : Utilise exclusivement le Franc CFA (FCFA) pour parler d'argent. Ne mentionne JAMAIS l'Euro.
      TON : "Grand frère" expert, sans filtre, autoritaire mais bienveillant.
      OBJECTIF : Créer un sentiment d'urgence absolue (Hémorragie financière).
      
      STRUCTURE OBLIGATOIRE (Markdown) :
      Écoute-moi bien. Pendant que tu travailles tes coupes, ton salon est en train de **se vider de sa substance**. Ce n'est pas une intuition, c'est une certitude mathématique.
      
      1. **Attention**: Phrase sur les pertes invisibles (exemple: le seau percé). Parle de milliers de FCFA perdus chaque jour.
      2. **Intérêt**: Explique comment l'absence de maîtrise sur ${pointsStr} détruit sa marge chaque minute.
      3. **Désir**: Décris la sérénité d'un gérant qui a une équipe autonome et des stocks pesés.
      4. **Action**: Recommande les modules spécifiques pour stopper l'hémorragie.
      
      Environ 250-300 mots.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 0.95,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Strategic Advice Error:", error);
    return "**L'excellence vous attend.** Votre diagnostic montre un potentiel immense. Chaque module choisi est une pierre posée pour bâtir votre empire.";
  }
};

/**
 * Creates a chat session with the Coach Kita persona.
 */
export const createCoachChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "Tu es Coach Kita, l'expert mentor de Go'Top Pro basé à Abidjan. Ton ton est exigeant, visionnaire, mais bienveillant. Utilise exclusivement le Franc CFA (FCFA) comme monnaie. Respecte la typographie française.",
    },
  });
};
