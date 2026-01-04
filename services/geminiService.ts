
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
 * Focused on professional transformation and profit maximization.
 */
export const generateStrategicAdvice = async (negativePoints: string[], isPerfectScore: boolean = false) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let prompt = "";
  
  if (isPerfectScore) {
    prompt = `
      Rôle: Coach Kita, mentor d'élite de Go'Top Pro. 
      Situation: Gérant de salon avec un score parfait de 16/16.
      Objectif: Le convaincre que l'excellence d'aujourd'hui est le danger de demain (stagnation) et le pousser vers le scaling.
      
      Structure de ton audit (Utilise Markdown pour le formatage) :
      1. **ATTENTION**: Une phrase choc sur le danger du succès. Ex: "Le succès est le pire ennemi du progrès."
      2. **INTÉRÊT**: Analyse pourquoi il est au top mais souligne que le marché africain de la beauté explose et que de nouveaux concurrents "digitaux native" arrivent.
      3. **DÉSIR**: Peins la vision du gérant-investisseur. Plus de mains dans les cheveux, mais une tête dans les chiffres et le développement d'un deuxième ou troisième salon. Parle de "Liberté totale" et de "Prestige local".
      4. **ACTION**: Recommande impérativement les 4 modules piliers : **Tarification Avancée, Social Media Mastery, Management de Leader et Maîtrise de la Trésorerie**.
      
      Ton: Prestigieux, exigeant, visionnaire. Environ 350 mots.
    `;
  } else {
    const pointsStr = negativePoints.join(", ");
    prompt = `
      Rôle: Coach Kita, le mentor qui transforme les salons en empires.
      Situation: Le gérant a échoué sur : ${pointsStr}.
      Objectif: Créer un sentiment d'urgence (hémorragie de cash) et un désir brûlant de correction.
      
      Structure de ton audit (Utilise Markdown pour le formatage avec du GRAS pour les mots clés) :
      1. **ATTENTION**: Accroche violente sur les pertes financières. Ex: "Votre salon est une mine d'or, mais vous creusez avec une cuillère." ou "L'hémorragie de cash-flow est réelle."
      2. **INTÉRÊT**: Explique techniquement comment l'absence de maîtrise sur ${pointsStr} détruit sa marge et fatigue ses équipes. Utilise des termes comme "marge brute", "taux d'occupation", "panier moyen".
      3. **DÉSIR**: Décris la vie d'un gérant Go'Top Pro : Un salon qui tourne sans lui, une équipe qui vend des produits comme des experts, et un compte bancaire qui respire enfin.
      4. **ACTION**: Appel à l'action immédiat. "Ne pas choisir ces modules, c'est choisir de financer vos concurrents." Incite à cliquer sur les boutons ci-dessous.
      
      Ton: Direct, sans filtre, "Business Partner". Environ 350 mots.
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
    return "**L'excellence vous attend.** Votre diagnostic montre un potentiel immense. Chaque module choisi est une pierre posée pour bâtir votre **empire de la beauté**.";
  }
};

export const createCoachChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "Tu es Coach Kita, l'expert mentor de Go'Top Pro. Ton ton est celui d'un coach de haut niveau : exigeant, visionnaire, mais profondément bienveillant. Tu aides sur la gestion, le management, le marketing et la technique. Sois concis et percutant.",
    },
  });
};
