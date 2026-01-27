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
 */
export const generateStrategicAdvice = async (
  negativePoints: string[], 
  isPerfectScore: boolean = false,
  userContext?: { firstName: string; gender: 'M' | 'F'; domain: string }
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const name = userContext?.firstName || "Gérant";
  const sibling = userContext?.gender === 'F' ? "petite sœur" : "petit frère";
  const domain = userContext?.domain || "salon de beauté";
  
  let prompt = "";
  
  if (isPerfectScore) {
    prompt = `
      Rôle: Coach Kita, mentor d'élite de Go'Top Pro à Abidjan. 
      Destinataire: ${name}, gérant(e) de ${domain}.
      Ton: Direct, provocateur, visionnaire. Tu l'appelles "${sibling}".
      
      CONTEXTE : Le score au diagnostic est de 16/16.
      MONNAIE : Franc CFA (FCFA) uniquement. JAMAIS d'Euro.
      
      OBJECTIF : Lui faire comprendre que l'excellence actuelle est un plateau dangereux.
      
      STRUCTURE (Markdown) :
      1. **Attention**: Phrase choc sur le risque de la zone de confort.
      2. **Intérêt**: Pourquoi la maîtrise technique en ${domain} ne suffit plus.
      3. **Désir**: Peins la vision du gérant-investisseur libre.
      4. **Action**: Recommande le Pack Excellence Totale.
    `;
  } else {
    const pointsStr = negativePoints.join(", ");
    prompt = `
      Rôle: Coach Kita, mentor d'affaires expert d'Abidjan.
      Destinataire: ${name}, ${sibling} gérant(e) de ${domain}.
      Ton: "Grand frère" expert, sans filtre, autoritaire mais bienveillant.
      
      SITUATION : Le gérant perd de l'argent sur : ${pointsStr}.
      MONNAIE : Franc CFA (FCFA) uniquement.
      
      OBJECTIF : Créer un sentiment d'urgence absolue lié à son métier de ${domain}.
      
      STRUCTURE (Markdown) :
      1. **Attention**: Salue ${name} et parle des pertes invisibles dans son salon de ${domain}.
      2. **Intérêt**: Explique comment l'absence de maîtrise sur ${pointsStr} détruit sa marge.
      3. **Désir**: Décris la sérénité d'un gérant qui a une équipe autonome.
      4. **Action**: Recommande les modules spécifiques pour stopper l'hémorragie.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 0.95,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Strategic Advice Error:", error);
    return `**L'excellence vous attend, ${name}.** Votre diagnostic montre un potentiel immense. Investir dans vos faiblesses est le seul moyen de bâtir un empire rentable.`;
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