
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
  // Fix: Instantiating GoogleGenAI inside the function to ensure the most current environment configuration (API Key) is used.
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
    
    // Fix: text is a property on GenerateContentResponse, not a method. Trimming for safety.
    const jsonStr = response.text?.trim();
    return JSON.parse(jsonStr || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
