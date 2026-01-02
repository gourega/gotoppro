
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Defining the quiz schema with explicit property ordering for consistent JSON generation
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
};

/**
 * Generates dynamic quiz content based on salon training topics using the Gemini API.
 */
export const generateDynamicQuiz = async (topic: string, moduleTitle: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Rôle: Coach Kita (Mentor bienveillant expert en coiffure/beauté, autoritaire mais encourageant).
    Sujet: "${topic}" (Module: ${moduleTitle}).
    Génère 3 nouvelles questions de quiz basées sur des scénarios réels de salon et 2 exercices pratiques.
    Réponds uniquement en JSON valide selon le schéma fourni.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: QUIZ_SCHEMA
      }
    });
    
    const jsonStr = response.text?.trim();
    return JSON.parse(jsonStr || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

/**
 * Generates a strategic personalized summary based on diagnostic results.
 */
export const generateStrategicAdvice = async (negativePoints: string[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const pointsStr = negativePoints.join(", ");
  const prompt = `
    Rôle: Coach Kita.
    Contexte: Un gérant de salon vient de faire un diagnostic. Ses points faibles sont: ${pointsStr}.
    Tâche: Rédige un court paragraphe d'analyse stratégique (max 150 mots) très motivant et "pro".
    Structure:
    1. Un constat honnête mais encourageant.
    2. La priorité absolue selon toi.
    3. Une vision de succès futur.
    Langage: Français ivoirien élégant/professionnel (quelques expressions locales autorisées si elles restent pro).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Strategic Advice Error:", error);
    return "L'excellence vous attend. Focalisez-vous sur vos priorités pour transformer votre salon en succès.";
  }
};

/**
 * Chat instance for interactive coaching.
 */
export const createCoachChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "Tu es Coach Kita, l'expert mentor de Go'Top Pro. Ton ton est celui d'un coach de haut niveau : exigeant, visionnaire, mais profondément bienveillant envers les gérants de salon de coiffure en Afrique. Tu aides sur la gestion, le management, le marketing et la technique. Sois concis et percutant.",
    },
  });
};
