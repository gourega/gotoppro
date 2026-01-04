
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
};

export const generateDynamicQuiz = async (topic: string, moduleTitle: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Rôle: Coach Kita. Sujet: "${topic}" (${moduleTitle}).
    Génère 3 questions de quiz et 2 exercices pratiques.
    Réponds en JSON uniquement.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: QUIZ_SCHEMA }
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
export const generateStrategicAdvice = async (negativePoints: string[], isPerfectScore: boolean = false) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = "";
  
  if (isPerfectScore) {
    prompt = `
      Rôle: Coach Kita, le mentor visionnaire de Go'Top Pro.
      Contexte: Le gérant a un score parfait de 16/16. C'est un profil "Elite".
      Tâche: Rédige un audit stratégique magistral (env. 250 mots) en suivant la structure AIDA.
      
      Structure AIDA à respecter :
      - ATTENTION: Frappe fort. Félicite-le mais préviens-le : "Le danger commence quand on croit avoir tout réussi".
      - INTÉRÊT: Explique que le marché de la beauté est impitoyable. Ce qui marche aujourd'hui (ses 16 points validés) sera la norme de demain. Il doit garder son avance.
      - DÉSIR: Peins la vision du gérant-investisseur. Celui qui ne travaille plus "dans" son salon mais "sur" son salon. Parle de domination de marché, de prestige et de sérénité absolue.
      - ACTION: Incite-le à valider les 4 modules de Maîtrise Elite (Tarification avancée, Social Media, Management & Trésorerie) pour verrouiller sa position de leader.
      
      Ton: Prestigieux, inspirant, exigeant. Style "High-End Coaching".
    `;
  } else {
    const pointsStr = negativePoints.join(", ");
    prompt = `
      Rôle: Coach Kita, le mentor qui transforme les salons en mines d'or.
      Contexte: Le gérant a échoué sur les points suivants : ${pointsStr}.
      Tâche: Rédige un audit percutant (env. 250 mots) en suivant la structure AIDA.
      
      Structure AIDA à respecter :
      - ATTENTION: Accroche choc. "Votre talent mérite mieux que ces fuites de revenus". Ton salon est une machine de guerre qui tourne avec un frein à main serré.
      - INTÉRÊT: Analyse chirurgicale. Explique comment l'absence de maîtrise sur ${pointsStr} crée une hémorragie invisible de cash-flow et fatigue ses équipes.
      - DÉSIR: Le futur radieux. Imagine son agenda rempli 3 semaines à l'avance, une équipe autonome qui vend des produits comme des experts, et lui, dégageant enfin un vrai salaire de gérant.
      - ACTION: Appel pressant. Ne pas choisir ces modules, c'est choisir de perdre de l'argent demain. "Sélectionnez vos modules prioritaires ci-dessous et activons votre croissance."
      
      Ton: Direct, percutant, terrain, "Real Talk" business.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 0.95
      }
    });
    return response.text;
  } catch (error) {
    console.error("Strategic Advice Error:", error);
    return "L'excellence vous attend. Chaque module choisi est une pierre posée pour bâtir votre empire de la beauté.";
  }
};

export const createCoachChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "Tu es Coach Kita, l'expert mentor de Go'Top Pro. Ton ton est celui d'un coach de haut niveau : exigeant, visionnaire, mais profondément bienveillant envers les gérants de salon de coiffure en Afrique. Tu aides sur la gestion, le management, le marketing et la technique. Sois concis et percutant.",
    },
  });
};
