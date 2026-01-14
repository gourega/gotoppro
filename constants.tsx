
import { TrainingModule, Badge, ModuleStatus } from './types';

// Ressources Visuelles
export const BRAND_LOGO = "https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/assets/logo.png";
export const KITA_LOGO = "https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/kita/logo-kita.png";
export const COACH_KITA_AVATAR = "https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/avatars/35ee91c6-b485-4fb0-aefa-7de0c54571e3/COACH_KITA_AVATAR.png";

// Bio & Coordonnées Officielles (CANTIC THINK IA)
export const COACH_KITA_FULL_NAME = "Ouréga Kouassi Goblé";
export const COACH_KITA_TITLE = "L’Architecte de la Rentabilité Beauté";
export const COACH_KITA_ESTABLISHMENT = "CANTIC THINK IA";
export const COACH_KITA_ADDRESS = "544, 2 Plateaux Agban - Rue 70 - Carrefour Kratos - Abidjan Cocody";
export const COACH_KITA_EMAIL = "ourega.goble@canticthinkia.ci";
export const COACH_KITA_PHONE = "+225 01 03 43 84 56";
export const COACH_KITA_OPENING_YEAR = 2014;
export const COACH_KITA_EMPLOYEES = 10;

export const COACH_KITA_BIO = "Expert mentor avec plus de 25 ans d'immersion sur le terrain en Afrique de l’Ouest, Ouréga est le cerveau derrière le standard d'excellence KITA. Il a identifié les 16 leviers critiques qui séparent les gérants qui stagnent de ceux qui règnent. Sa mission : injecter la rigueur du management moderne dans l'ADN des leaders de la beauté ivoirienne.";
export const COACH_KITA_SLOGAN = "Le talent attire le client, la stratégie bâtit l’empire.";

// Partenaire Officiel
export const RAYMOND_LOGO = "https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/RAYMOND_LOGO/RAYMOND_LOGO.jpg";
export const RAYMOND_STYLING_PHOTO = "https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/RAYMOND_STYLING_PHOTO/RAYMOND_STYLING_PHOTO.jpg";
export const RAYMOND_FB_URL = "https://web.facebook.com/salondecoiffurechezraymond";
export const RAYMOND_PHONE = "+2250707949706";
export const RAYMOND_ADDRESS = "Cocody-II Plateaux-les Vallons";

export const SUPER_ADMIN_PHONE_NUMBER = "+2250103438456";

/**
 * Table de migration pour restaurer les anciens comptes
 */
export const LEGACY_ID_MAP: Record<string, string> = {
  "1": "mod_accueil_tel",
  "2": "mod_diagnostic",
  "3": "mod_hygiene",
  "4": "mod_shampoing",
  "5": "mod_pricing",
  "6": "mod_management",
  "7": "mod_fidelisation",
  "8": "mod_digital",
  "9": "mod_color",
  "10": "mod_retail",
  "11": "mod_coupe",
  "12": "mod_planning",
  "13": "mod_psychologie",
  "14": "mod_vip",
  "15": "mod_chiffres",
  "16": "mod_formalisation"
};

export const DEFAULT_KITA_SERVICES = [
  "Bain d'huile", "Brushing", "Babyliss", "Balayage", "Chignon", 
  "Coupe homme", "Coupe dame", "Défrisage", "Tresse", "Epilation sourcils", 
  "Manicure", "Pédicure", "Mise en plis", "Maquillage", 
  "Pose de vernis + Nettoyage", "Pose vernis permanent", "Pose gel / Capsules", 
  "Massage", "Soins du corps", "Soins du visage", "Percing / Tatouage", 
  "Shampoing", "Teinture", "Tissage", "Divers", "Vente"
];

export const DAILY_CHALLENGES = [
  "Nettoyer ses ciseaux devant le prochain client",
  "Sourire consciemment lors de chaque appel téléphonique",
  "Proposer un massage crânien à une cliente stressée",
  "Prendre une photo 'avant/après' avec la lumière du jour",
  "Demander à une cliente fidèle si elle a une amie à parrainer",
  "Vérifier le stock de shampoing technique avant midi",
  "Féliciter un collaborateur pour un detail précis de son travail",
  "Vérifier la propreté du bac à shampoing après chaque passage",
  "Peser précisément le mélange de la prochaine coloration",
  "Noter une préférence personnelle (thé, café) dans un carnet client",
  "Répondre à un avis ou commentaire sur les réseaux sociaux",
  "Réorganiser sa desserte de travail pour gagner 1 minute",
  "Vérifier ses chaussures et sa tenue devant le miroir",
  "Faire un diagnostic assis à hauteur de la finale",
  "Proposer un produit de revente à la fin d'une prestation"
];

export const TRAINING_CATALOG: TrainingModule[] = [
  {
    id: "mod_accueil_tel",
    topic: "Accueil",
    title: "L'art de l'accueil téléphonique d'élite",
    description: "Le premier contact est le moment où vous gagnez ou perdez un client. Apprenez le protocole des salons de prestige.",
    mini_course: "Votre téléphone n'est pas un outil, c'est votre première caisse enregistreuse.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. La signature vocale : instaurer l'autorité</h2>
      <p>Le premier contact avec votre salon ne se fait pas dans le fauteuil, mais à travers une onde sonore. Répondre par un simple « allô » est une erreur de débutant qui dévalorise instantanément votre expertise. Un gérant d'élite impose un standard dès la première seconde.</p>
      <blockquote>« La voix est le miroir de votre salon ; si elle est hésitante, votre service le sera aussi. »</blockquote>
      <p>La formule d'or doit être prononcée avec un sourire conscient : <strong>« Salon [Nom du Salon], [Votre Prénom] à votre écoute, bonjour. »</strong> Cette structure permet au client de confirmer qu'il est au bon endroit et d'identifier son interlocuteur, créant ainsi un lien humain immédiat.</p>
    `,
    coach_tip: "Souriez en parlant, votre client l'entendra à travers le téléphone.",
    strategic_mantra: "Un appel raté est un client qui part chez le voisin.",
    quiz_questions: [
      { 
        question: "Quelle est la phrase d'accueil idéale ?", 
        options: ["Allô ?", "Salon [Nom], [Prénom] à votre écoute, bonjour", "Oui c'est pour quoi ?"], 
        correctAnswer: 1, 
        explanation: "Cette formule établit immédiatement votre autorité professionnelle et rassure le client sur l'identité du salon." 
      },
      {
        question: "Pourquoi faut-il sourire en parlant au téléphone ?",
        options: ["Pour s'exercer les muscles faciaux", "Le sourire s'entend dans la voix et crée un climat chaleureux", "Ce n'est pas nécessaire si la cliente ne nous voit pas"],
        correctAnswer: 1,
        explanation: "L'attitude physique influence la tonalité de la voix. Un sourire rend l'accueil plus engageant."
      },
      {
        question: "Que faut-il faire si vous êtes occupé lors d'un appel ?",
        options: ["Décrocher et dire de patienter sans explication", "Laisser sonner jusqu'à ce que vous soyez libre", "Répondre avec le protocole et demander poliment si vous pouvez rappeler dans 5 minutes"],
        correctAnswer: 2,
        explanation: "Le respect du temps du client est crucial. Lui proposer un rappel rapide montre que vous maîtrisez votre organisation."
      }
    ],
    exercises: ["Pratiquer la signature vocale lors des 10 prochains appels."],
    tips: ["Restez calme et notez le nom du client dès le début."]
  },
  {
    id: "mod_diagnostic",
    topic: "Technique",
    title: "Le diagnostic : devenir un expert conseil",
    description: "Arrêtez de simplement couper. Apprenez à analyser pour conseiller et vendre des services de haute valeur.",
    mini_course: "Le diagnostic transforme une simple coupe en une ordonnance de beauté.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. La posture du mentor : briser la barrière du miroir</h2>
      <p>Le diagnostic est le moment le plus rentable de votre journée, pourtant c'est celui que beaucoup négligent par manque de temps.</p>
    `,
    coach_tip: "Écoutez deux fois plus que vous ne parlez pendant le diagnostic.",
    strategic_mantra: "Le client n'achète pas vos outils, il achète votre regard d'expert.",
    quiz_questions: [
      {
        question: "Où doit se situer le gérant pendant le diagnostic ?",
        options: ["Derrière le fauteuil, en regardant le miroir", "Assis ou accroupi à hauteur des yeux de la cliente", "Au comptoir en consultant son agenda"],
        correctAnswer: 1,
        explanation: "Se mettre à hauteur d'yeux casse la hiérarchie et instaure une relation de confiance et de conseil expert."
      },
      {
        question: "Quelle est la première étape d'un bon diagnostic ?",
        options: ["Proposer le prix le plus bas", "Toucher les cheveux et observer leur état naturel", "Sortir immédiatement ses ciseaux"],
        correctAnswer: 1,
        explanation: "L'observation tactile est la base de l'expertise. Elle permet de justifier techniquement les soins que vous allez proposer."
      },
      {
        question: "Le but ultime du diagnostic est de :",
        options: ["Gagner du temps pour finir la journée plus tôt", "Transformer une demande de prestation en une solution globale de beauté", "Vérifier si la cliente a assez d'argent"],
        correctAnswer: 1,
        explanation: "Un expert ne se contente pas d'exécuter, il prescrit les solutions adaptées pour un résultat durable."
      }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_hygiene",
    topic: "Hygiène",
    title: "Propreté irréprochable : le standard luxe",
    description: "L'hygiène est votre meilleur argument de vente. Apprenez à en faire un rituel visible par vos clients.",
    mini_course: "Un salon propre est un salon qui respecte ses clients et qui peut facturer plus cher.",
    price: 500,
    aiCredits: 2,
    lesson_content: `<h2>1. La désinfection visible</h2><p>Désinfecter ses outils devant le client justifie une hausse de tarifs.</p>`,
    coach_tip: "Un bac à shampoing mal nettoyé fait fuir les meilleurs clients définitivement.",
    strategic_mantra: "L'excellence commence par un peigne sans cheveux.",
    quiz_questions: [],
    exercises: [],
    tips: []
  },
  {
    id: "mod_shampoing",
    topic: "Technique",
    title: "L'art du shampoing : le premier moment de vérité",
    description: "Le shampoing n'est pas un nettoyage, c'est un soin technique et sensoriel crucial.",
    mini_course: "C'est au bac que vous gagnez le cœur de votre cliente.",
    price: 500,
    aiCredits: 2,
    lesson_content: `<h2>1. La technique du massage</h2><p>Le client cherche un moment de déconnexion.</p>`,
    coach_tip: "Ne parlez pas pendant le massage, laissez le client savourer.",
    strategic_mantra: "Un shampoing bâclé est une expérience ratée.",
    quiz_questions: [],
    exercises: [],
    tips: []
  },
  {
    id: "mod_pricing",
    topic: "Finance",
    title: "Tarification stratégique : valoriser son talent",
    description: "Apprenez à fixer vos prix non pas en fonction de la concurrence, mais de votre valeur réelle et de vos charges.",
    mini_course: "Un tarif trop bas est un signal de manque de confiance.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. La fin du tarif au hasard</h2><p>Calculez votre coût à la minute.</p>`,
    coach_tip: "Votre talent n'est pas négociable.",
    strategic_mantra: "Mieux vaut moins de clients qui paient le juste prix que trop de clients à perte.",
    quiz_questions: [],
    exercises: [],
    tips: []
  },
  {
    id: "mod_management",
    topic: "Management",
    title: "Leadership et motivation d'équipe",
    description: "Transformez vos collaborateurs en partenaires engagés pour le succès de votre enseigne.",
    mini_course: "Une équipe qui sourit est une équipe qui vend.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. Le gérant-pilote</h2><p>Définissez des standards clairs.</p>`,
    coach_tip: "Félicitez en public, recadrez en privé.",
    strategic_mantra: "Seul on va vite, ensemble on va loin.",
    quiz_questions: [],
    exercises: [],
    tips: []
  },
  {
    id: "mod_fidelisation",
    topic: "Vente",
    title: "Fidélisation : transformer le client en fan",
    description: "Il coûte 5 fois plus cher d'acquérir un nouveau client que d'en garder un.",
    mini_course: "Un client fidèle est votre meilleur ambassadeur.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. L'expérience mémorable</h2><p>La fidélité se gagne par l'émotion.</p>`,
    coach_tip: "Le petit café offert vaut plus que 10% de remise.",
    strategic_mantra: "Le client revient pour ce qu'il a ressenti.",
    quiz_questions: [],
    exercises: [],
    tips: []
  },
  {
    id: "mod_digital",
    topic: "Marketing",
    title: "Marketing Digital : attirer les meilleurs clients",
    description: "Utilisez Instagram et WhatsApp pour remplir votre agenda chaque matin.",
    mini_course: "Votre vitrine est désormais dans la poche de vos clientes.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. Le pouvoir de l'image</h2><p>Apprenez à photographier vos réalisations.</p>`,
    coach_tip: "Postez une photo par jour, à l'heure du déjeuner.",
    strategic_mantra: "Si on ne vous voit pas, vous n'existez pas.",
    quiz_questions: [],
    exercises: [],
    tips: []
  },
  {
    id: "mod_color",
    topic: "Technique",
    title: "Colorimétrie Expert : la science des nuances",
    description: "Devenez un maître de la couleur et évitez les erreurs techniques coûteuses.",
    mini_course: "La couleur est l'âme du salon.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. La roue chromatique</h2><p>Comprendre les pigments pour neutraliser les reflets.</p>`,
    coach_tip: "Pesez toujours vos mélanges sur une balance électronique.",
    strategic_mantra: "La précision technique évite les rattrapages gratuits.",
    quiz_questions: [],
    exercises: [],
    tips: []
  },
  {
    id: "mod_retail",
    topic: "Vente",
    title: "Vente de produits : conseiller comme un expert",
    description: "Apprenez à vendre les produits de votre boutique pour augmenter vos revenus.",
    mini_course: "Si votre client achète ailleurs, vous perdez de l'argent.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. La prescription</h2><p>L'expert ne vend pas, il prescrit une solution.</p>`,
    coach_tip: "Vos bacs à shampoing sont votre meilleure salle d'exposition.",
    strategic_mantra: "Vendre un produit, c'est prendre soin du client chez lui.",
    quiz_questions: [],
    exercises: [],
    tips: []
  },
  {
    id: "mod_coupe",
    topic: "Technique",
    title: "Coupe & Morphologie : sculpter le visage",
    description: "Apprenez à adapter chaque coupe à la forme du visage de vos clientes.",
    mini_course: "Une coupe réussie est une coupe qui grandit bien.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. Analyse morphologique</h2><p>Visage ovale, rond, carré : à chaque forme sa géométrie.</p>`,
    coach_tip: "Utilisez le miroir pour valider l'équilibre sous tous les angles.",
    strategic_mantra: "L'harmonie visuelle est le but ultime.",
    quiz_questions: [],
    exercises: [],
    tips: []
  },
  {
    id: "mod_planning",
    topic: "Management",
    title: "Organisation du Planning : gagner du temps",
    description: "Optimisez chaque minute de votre journée pour maximiser votre CA.",
    mini_course: "Le temps est votre seule ressource limitée.",
    price: 500,
    aiCredits: 2,
    lesson_content: `<h2>1. Le séquençage</h2><p>Comment chevaucher deux prestations intelligemment.</p>`,
    coach_tip: "Prévoyez toujours 15 minutes de marge pour les imprévus.",
    strategic_mantra: "Un planning fluide est un gérant serein.",
    quiz_questions: [],
    exercises: [],
    tips: []
  },
  {
    id: "mod_psychologie",
    topic: "Accueil",
    title: "Psychologie de la Cliente : comprendre l'inexprimé",
    description: "Apprenez à lire entre les lignes pour satisfaire les désirs cachés.",
    mini_course: "On coiffe une personne, pas seulement des cheveux.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. L'écoute active</h2><p>Décoder le langage corporel.</p>`,
    coach_tip: "Observez les bijoux et le style vestimentaire, ils parlent pour la cliente.",
    strategic_mantra: "Celui qui comprend gagne.",
    quiz_questions: [],
    exercises: [],
    tips: []
  },
  {
    id: "mod_vip",
    topic: "Prestige",
    title: "Services VIP & Prestige : viser le haut de gamme",
    description: "Comment transformer votre salon en une adresse incontournable pour les élites.",
    mini_course: "Le luxe se niche dans les détails invisibles.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. Les codes de l'hospitalité</h2><p>Du peignoir en soie à la boisson signature.</p>`,
    coach_tip: "L'exclusivité crée le désir.",
    strategic_mantra: "Le prestige autorise des marges extraordinaires.",
    quiz_questions: [],
    exercises: [],
    tips: []
  },
  {
    id: "mod_chiffres",
    topic: "Finance",
    title: "Analyse des Chiffres : piloter par la donnée",
    description: "Ne gérez plus au doigt mouillé. Apprenez à lire votre bilan comme un expert.",
    mini_course: "Les chiffres ne mentent jamais.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. Les indicateurs clés (KPI)</h2><p>Ticket moyen, taux de revente.</p>`,
    coach_tip: "Vérifiez vos chiffres tous les soirs avant de fermer.",
    strategic_mantra: "Ce qui ne se mesure pas ne s'améliore pas.",
    quiz_questions: [],
    exercises: [],
    tips: []
  },
  {
    id: "mod_formalisation",
    topic: "Management",
    title: "Formalisation & Structure : bâtir une entreprise solide",
    description: "Sortez de l'informel pour accéder aux crédits bancaires.",
    mini_course: "Un salon formel est un salon pérenne.",
    price: 500,
    aiCredits: 2,
    lesson_content: `<h2>1. Structure juridique</h2><p>Comprendre l'intérêt de la formalisation.</p>`,
    coach_tip: "Séparez toujours votre argent personnel de celui du salon.",
    strategic_mantra: "La rigueur administrative est la base de la croissance.",
    quiz_questions: [],
    exercises: [],
    tips: []
  }
];

export const BADGES: Badge[] = [
  {
    id: "first_module",
    name: "Décollage",
    icon: "🚀",
    description: "Premier module terminé avec succès.",
    condition: (u, mods) => mods.some(m => m.status === ModuleStatus.COMPLETED)
  },
  {
    id: "ambassador",
    name: "Ambassadeur",
    icon: "🤝",
    description: "A parrainé au moins 1 gérant avec succès.",
    condition: (u) => (u.referralCount || 0) >= 1
  },
  {
    id: "dedicated",
    name: "Maître du Salon",
    icon: "🏆",
    description: "5 modules terminés.",
    condition: (u, mods) => mods.filter(m => m.status === ModuleStatus.COMPLETED).length >= 5
  },
  {
    id: "legend",
    name: "Légende du Salon",
    icon: "👑",
    description: "12 modules ou plus terminés avec succès.",
    condition: (u, mods) => mods.filter(m => m.status === ModuleStatus.COMPLETED).length >= 12
  }
];

export const DIAGNOSTIC_QUESTIONS = [
  { id: 1, text: "Votre équipe est-elle formée aux techniques d'un accueil téléphonique qui transforme chaque appel en rendez-vous ?", category: "Accueil", linkedModuleId: "mod_accueil_tel" },
  { id: 2, text: "Réalisez-vous un diagnostic visuel et tactile assis face au client avant chaque prestation ?", category: "Technique", linkedModuleId: "mod_diagnostic" },
  { id: 3, text: "Désinfectez-vous systématiquement vos outils devant le client pour prouver votre standard d'hygiène ?", category: "Hygiène", linkedModuleId: "mod_hygiene" },
  { id: 4, text: "Le passage au bac est-il vécu par vos clients comme un véritable rituel de relaxation avec massage crânien ?", category: "Technique", linkedModuleId: "mod_shampoing" },
  { id: 5, text: "Calculez-vous vos tarifs en fonction de votre coût à la minute réel plutôt que de copier la concurrence ?", category: "Finance", linkedModuleId: "mod_pricing" },
  { id: 6, text: "Réunissez-vous votre équipe au moins une fois par semaine pour fixer des objectifs de performance clairs ?", category: "Management", linkedModuleId: "mod_management" },
  { id: 7, text: "Utilisez-vous un fichier client pour noter les préférences personnelles (café, anniversaires) et relancer les absents ?", category: "Vente", linkedModuleId: "mod_fidelisation" },
  { id: 8, text: "Publiez-vous chaque jour une photo de qualité de vos réalisations sur les réseaux sociaux pour attirer du flux ?", category: "Marketing", linkedModuleId: "mod_digital" },
  { id: 9, text: "Maîtrisez-vous parfaitement la roue chromatique pour neutraliser les reflets indésirables sans erreur technique ?", category: "Technique", linkedModuleId: "mod_color" },
  { id: 10, text: "Votre taux de revente de produits à domicile représente-t-il plus de 15 % de votre chiffre d'affaires global ?", category: "Vente", linkedModuleId: "mod_retail" },
  { id: 11, text: "Adaptez-vous systématiquement la géométrie de vos coupes à la morphologie du visage de vos clientes ?", category: "Technique", linkedModuleId: "mod_coupe" },
  { id: 12, text: "Utilisez-vous un système de réservation optimisé pour éviter les temps morts et les chevauchements mal gérés ?", category: "Management", linkedModuleId: "mod_planning" },
  { id: 13, text: "Savez-vous décoder le langage corporel de vos clientes pour leur proposer des services additionnels sans forcer ?", category: "Accueil", linkedModuleId: "mod_psychologie" },
  { id: 14, text: "Proposez-vous des rituels de prestige (boisson signature, serviette chaude) pour justifier des prix haut de gamme ?", category: "Prestige", linkedModuleId: "mod_vip" },
  { id: 15, text: "Analysez-vous vos indicateurs clés (ticket moyen, productivité) chaque soir avant de fermer le salon ?", category: "Finance", linkedModuleId: "mod_chiffres" },
  { id: 16, text: "Votre salon dispose-t-il d'une structure juridique et comptable claire pour accéder à des financements ?", category: "Management", linkedModuleId: "mod_formalisation" }
];
