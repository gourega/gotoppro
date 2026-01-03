
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
export const generateStrategicAdvice = async (negativePoints: string[], isPerfectScore: boolean = false) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = "";
  
  if (isPerfectScore) {
    prompt = `
      Rôle: Coach Kita, mentor de luxe pour gérants de salons de coiffure.
      Contexte: Le gérant a répondu "OUI" à tous les points du diagnostic. C'est un profil performant.
      Tâche: Rédige une analyse (max 180 mots) qui le félicite mais le met au défi. 
      Argumentaire: "Le plus dur n'est pas de monter, c'est de rester au sommet". Explique que pour passer de "bon" à "légendaire", il doit s'attaquer à la haute gestion et au marketing d'influence.
      Incite-le à prendre les modules de perfectionnement pour sécuriser son empire.
      Ton: Très prestigieux, visionnaire, inspirant. Langage élégant.
    `;
  } else {
    const pointsStr = negativePoints.join(", ");
    prompt = `
      Rôle: Coach Kita, mentor expert en business de la beauté.
      Contexte: Un gérant a des lacunes sur: ${pointsStr}.
      Tâche: Rédige une analyse stratégique (max 180 mots) extrêmement persuasive.
      Structure:
      1. Accroche choc: "Votre salon est une mine d'or, mais vous laissez l'argent s'échapper".
      2. Analyse: Pourquoi ces points précis (${pointsStr}) bloquent sa croissance aujourd'hui. 
      3. Désir: Peins une image du succès s'il suit ce parcours (agenda plein, équipe autonome, sérénité financière).
      4. Appel à l'action: Encourage-le à ne pas hésiter, car chaque jour sans formation est un manque à gagner.
      Ton: Dynamique, "pro", direct, avec l'élégance d'un mentor qui veut la réussite de son poulain.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.85,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Strategic Advice Error:", error);
    return "L'excellence vous attend. Chaque module choisi est une pierre posée pour bâtir votre empire de la beauté.";
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
