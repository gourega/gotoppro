
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

export const generateDynamicQuiz = async (topic: string, moduleTitle: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Rôle: Coach Kita. Sujet: "${topic}" (${moduleTitle}).
    Génère 3 questions de quiz et 2 exercices pratiques.
    IMPORTANT: Respecte la typographie française (majuscule uniquement en début de phrase). 
    Évite les anglicismes techniques (ex: utilise "vente additionnelle", "réservation", "flux de caisse").
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
 * Focused on professional transformation and profit maximization.
 */
export const generateStrategicAdvice = async (negativePoints: string[], isPerfectScore: boolean = false) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = "";
  
  if (isPerfectScore) {
    prompt = `
      Rôle: Coach Kita, mentor d'élite de Go'Top Pro. 
      Situation: Gérant de salon avec un score parfait de 16/16.
      Objectif: Le convaincre que l'excellence d'aujourd'hui est le danger de demain (stagnation) et le pousser vers le développement de son empire.
      
      CONSIGNES DE RÉDACTION :
      - Utilise la typographie française correcte (majuscule uniquement en début de phrase).
      - Ne capitalise pas les mots au milieu des titres.
      - Utilise un français impeccable sans anglicismes techniques.
      
      Structure de ton audit (Utilise Markdown pour le formatage) :
      1. **Attention**: Une phrase choc sur le danger du succès.
      2. **Intérêt**: Analyse pourquoi il est au top mais souligne les nouveaux défis du marché africain de la beauté.
      3. **Désir**: Peins la vision du gérant-investisseur (multisalon, liberté totale).
      4. **Action**: Recommande les modules de direction, tarifs et visibilité.
      
      Ton: Prestigieux, exigeant, visionnaire. Environ 350 mots.
    `;
  } else {
    const pointsStr = negativePoints.join(", ");
    prompt = `
      Rôle: Coach Kita, le mentor qui transforme les salons en empires.
      Situation: Le gérant a échoué sur : ${pointsStr}.
      Objectif: Créer un sentiment d'urgence et un désir de correction immédiate.
      
      CONSIGNES DE RÉDACTION :
      - Utilise la typographie française correcte (majuscule uniquement en début de phrase).
      - Ne capitalise pas les mots au milieu des phrases.
      - Pas d'anglicismes comme "Retail" ou "Cash-flow". Utilise "Vente de produits" et "Flux de caisse".
      
      Structure de ton audit (Utilise Markdown pour le formatage avec du GRAS pour les mots clés) :
      1. **Attention**: Accroche sur les pertes financières invisibles.
      2. **Intérêt**: Explique comment l'absence de maîtrise sur ${pointsStr} détruit sa marge.
      3. **Désir**: Décris la vie d'un gérant qui réussit : équipe autonome et bénéfices réels.
      4. **Action**: Appel à l'action immédiat.
      
      Ton: Direct, sans filtre, "Partenaire d'affaires". Environ 350 mots.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 1.0,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Strategic Advice Error:", error);
    return "**L'excellence vous attend.** Votre diagnostic montre un potentiel immense. Chaque module choisi est une pierre posée pour bâtir votre empire de la beauté.";
  }
};

export const createCoachChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "Tu es Coach Kita, l'expert mentor de Go'Top Pro. Ton ton est celui d'un coach de haut niveau : exigeant, visionnaire, mais bienveillant. Tu aides sur la gestion, la direction d'équipe, le marketing et la technique. IMPORTANT : Respecte la typographie française (majuscules uniquement en début de phrase, pas d'anglicismes techniques). Sois concis et percutant.",
    },
  });
};
