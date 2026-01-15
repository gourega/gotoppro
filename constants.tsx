
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
export const COACH_KITA_PHONE = "+225 05 44 86 93 13"; // Service Client WhatsApp Business
export const COACH_KITA_WAVE_NUMBER = "01 03 43 84 56"; // Numéro de paiement Wave unique
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

export const SUPER_ADMIN_PHONE_NUMBER = "+2250544869313";

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
  "Proposer un massage crânien à une finale stressée",
  "Prendre une photo 'avant/après' avec la lumière du jour",
  "Demander à une finale fidèle si elle a une amie à parrainer",
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
        options: ["Pour s'exercer les muscles faciaux", "Le sourire s'entend dans la voix et crée un climat chaleureux", "Ce n'est pas nécessaire si la finale ne nous voit pas"],
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
        options: ["Derrière le fauteuil, en regardant le miroir", "Assis ou accroupi à hauteur des yeux de la finale", "Au comptoir en consultant son agenda"],
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
        options: ["Gagner du temps pour finir la journée plus tôt", "Transformer une demande de prestation en une solution globale de beauté", "Vérifier si la finale a assez d'argent"],
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
    quiz_questions: [
      {
        question: "Quand devez-vous nettoyer vos outils ?",
        options: ["Le soir après la fermeture", "Devant le client avant de commencer", "Une fois par semaine"],
        correctAnswer: 1,
        explanation: "Le faire devant le client prouve visuellement votre standard d'excellence et justifie vos tarifs."
      },
      {
        question: "Quel est l'impact d'un bac à shampoing sale ?",
        options: ["Aucun, le savon nettoie tout", "La perte définitive des clients exigeants", "Le client pensera que c'est une déco vintage"],
        correctAnswer: 1,
        explanation: "Le bac est un point de contact intime. S'il est sale, la confiance est rompue instantanément."
      },
      {
        question: "L'hygiène est un outil de :",
        options: ["Marketing et vente", "Perte de temps", "Contrainte administrative uniquement"],
        correctAnswer: 0,
        explanation: "Un salon irréprochable attire les clients VIP prêts à payer plus cher pour leur sécurité."
      }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_shampoing",
    topic: "Technique",
    title: "L'art du shampoing : le premier moment de vérité",
    description: "Le shampoing n'est pas un nettoyage, c'est un soin technique et sensoriel crucial.",
    mini_course: "C'est au bac que vous gagnez le cœur de votre finale.",
    price: 500,
    aiCredits: 2,
    lesson_content: `<h2>1. La technique du massage</h2><p>Le client cherche un moment de déconnexion.</p>`,
    coach_tip: "Ne parlez pas pendant le massage, laissez le client savourer.",
    strategic_mantra: "Un shampoing bâclé est une expérience ratée.",
    quiz_questions: [
      {
        question: "Quelle est l'attitude idéale au bac ?",
        options: ["Discuter des derniers potins", "Le silence et la concentration sur le massage", "Demander au client s'il a faim"],
        correctAnswer: 1,
        explanation: "Le silence permet au client de vivre une expérience sensorielle de déconnexion totale."
      },
      {
        question: "Combien de temps doit durer un massage crânien minimum ?",
        options: ["30 secondes", "3 à 5 minutes de pur soin", "10 minutes même si on est pressé"],
        correctAnswer: 1,
        explanation: "Un massage de 3 à 5 minutes transforme un simple lavage en un service de prestige."
      },
      {
        question: "Quel est l'objectif principal du shampoing Kita ?",
        options: ["Juste mouiller les cheveux", "Préparer le cheveu et relaxer l'esprit", "Économiser de l'eau"],
        correctAnswer: 1,
        explanation: "C'est un double soin : technique pour la fibre capillaire, et psychologique pour le bien-être."
      }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_pricing",
    topic: "Finance",
    title: "Tarification stratégique : valoriser son talent",
    description: "Apprenez à fixer vos prix non pas en fonction de la concurrence, mais de votre valeur réelle et de vos charges.",
    mini_course: "Un tarif trop bas est un signal de mal-confiance.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. La fin du tarif au hasard</h2><p>Calculez votre coût à la minute.</p>`,
    coach_tip: "Votre talent n'est pas négociable.",
    strategic_mantra: "Mieux vaut moins de clients qui paient le juste prix que trop de clients à perte.",
    quiz_questions: [
      {
        question: "Sur quoi doit se baser votre tarif ?",
        options: ["Sur les prix du voisin", "Sur votre coût à la minute et votre expertise", "Sur l'humeur du client"],
        correctAnswer: 1,
        explanation: "Le prix doit couvrir vos charges (loyer, salaires, produits) et dégager votre marge de profit."
      },
      {
        question: "Faire une remise systématique est :",
        options: ["Une bonne idée pour garder les clients", "Un poison pour votre rentabilité", "Indispensable pour réussir"],
        correctAnswer: 1,
        explanation: "La remise dévalorise votre expertise. Apprenez à justifier votre prix par la qualité."
      },
      {
        question: "Le coût à la minute inclut :",
        options: ["Uniquement le prix du produit", "Le loyer, l'électricité, les salaires et le temps passé", "Rien, c'est du bonus"],
        correctAnswer: 1,
        explanation: "Chaque minute passée dans votre salon coûte de l'argent ; votre prix doit refléter cette réalité."
      }
    ],
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
    quiz_questions: [
      {
        question: "Comment annoncer un recadrage à un employé ?",
        options: ["Devant toute l'équipe pour l'exemple", "En privé dans votre bureau avec calme", "Par un message WhatsApp sec"],
        correctAnswer: 1,
        explanation: "Le respect mutuel est la base du leadership. Corriger en privé préserve la dignité de l'employé."
      },
      {
        question: "Quelle est la meilleure façon de motiver ?",
        options: ["Crier plus fort", "Fixer des objectifs clairs et fêter les succès", "Ne rien dire et attendre"],
        correctAnswer: 1,
        explanation: "La clarté des objectifs donne une direction. La reconnaissance des efforts nourrit l'engagement."
      },
      {
        question: "Le gérant d'élite est :",
        options: ["Le meilleur coiffeur qui travaille tout seul", "Le pilote qui coordonne les talents de son équipe", "Celui qui arrive le dernier au salon"],
        correctAnswer: 1,
        explanation: "Votre rôle est de gérer le système pour que l'équipe performe, même quand vous ne coiffez pas."
      }
    ],
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
    quiz_questions: [
      {
        question: "Quelle donnée est la plus importante dans votre fichier client ?",
        options: ["Le signe astrologique", "L'historique des prestations et les préférences personnelles", "La couleur des chaussures"],
        correctAnswer: 1,
        explanation: "Connaître le passé capillaire et les goûts (café, thé) crée une relation personnalisée irrésistible."
      },
      {
        question: "Quand commence la fidélisation ?",
        options: ["Au bout du 5ème rendez-vous", "Dès la première seconde de l'accueil", "Quand on offre une réduction"],
        correctAnswer: 1,
        explanation: "La première impression est celle qui décide si le client reviendra un jour."
      },
      {
        question: "Un client fidèle :",
        options: ["Négocie toujours les prix", "Recommande votre salon gratuitement à son entourage", "Est acquis pour toujours sans effort"],
        correctAnswer: 1,
        explanation: "La recommandation est le marketing le plus puissant et le moins cher du monde."
      }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_digital",
    topic: "Marketing",
    title: "Marketing Digital : attirer les meilleurs clients",
    description: "Utilisez Instagram et WhatsApp pour remplir votre agenda chaque matin.",
    mini_course: "Votre vitrine est désormais dans la poche de vos finales.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. Le pouvoir de l'image</h2><p>Apprenez à photographier vos réalisations.</p>`,
    coach_tip: "Postez une photo par jour, à l'heure du déjeuner.",
    strategic_mantra: "Si on ne vous voit pas, vous n'existez pas.",
    quiz_questions: [
      {
        question: "Quel type de photo attire le plus de clients ?",
        options: ["Une photo floue du salon vide", "Un 'Avant/Après' bien éclairé avec le sourire de la finale", "Une photo des produits sur l'étagère"],
        correctAnswer: 1,
        explanation: "Le résultat concret sur une vraie personne rassure le client sur vos compétences réelles."
      },
      {
        question: "Quelle est l'utilité du statut WhatsApp ?",
        options: ["Raconter sa vie personnelle", "Afficher les créneaux disponibles et les promos flash", "C'est inutile pour un salon"],
        correctAnswer: 1,
        explanation: "Le statut est un canal direct et gratuit pour remplir vos heures creuses rapidement."
      },
      {
        question: "Il faut répondre aux commentaires :",
        options: ["Une fois par mois", "Jamais, ça fait trop occupé", "Rapidement et avec professionnalisme"],
        correctAnswer: 2,
        explanation: "La réactivité sur le digital montre que vous êtes un gérant attentif et moderne."
      }
    ],
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
    quiz_questions: [
      {
        question: "Pourquoi peser sa couleur sur une balance ?",
        options: ["Pour faire semblant d'être un scientifique", "Pour la précision du résultat et le contrôle du coût produit", "Parce que c'est joli sur la photo"],
        correctAnswer: 1,
        explanation: "La chimie exige de la précision pour être reproductible et rentable."
      },
      {
        question: "Pour neutraliser un reflet roux (orangé), on utilise :",
        options: ["Du rouge", "Du bleu / cendré", "Du jaune"],
        correctAnswer: 1,
        explanation: "Selon la roue chromatique, le bleu est l'opposé de l'orangé ; il l'annule donc."
      },
      {
        question: "Un diagnostic couleur raté mène à :",
        options: ["Un client très content", "Une perte de temps et d'argent en rattrapages", "Aucun impact"],
        correctAnswer: 1,
        explanation: "La technique commence toujours par une analyse précise de la base avant d'appliquer le produit."
      }
    ],
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
    quiz_questions: [
      {
        question: "Comment aborder la revente de produits ?",
        options: ["Forcer le client à acheter", "Prescrire le produit adapté à ses besoins identifiés au diagnostic", "Attendre que le client demande"],
        correctAnswer: 1,
        explanation: "Le conseil est un prolongement du service. Si vous ne conseillez pas, vous ne finissez pas votre travail."
      },
      {
        question: "La marge sur la revente est :",
        options: ["Insignifiante", "Un complément de revenu essentiel sans temps de travail additionnel", "Une perte de temps"],
        correctAnswer: 1,
        explanation: "La revente augmente votre ticket moyen sans mobiliser le fauteuil plus longtemps."
      },
      {
        question: "Quand faut-il parler du produit ?",
        options: ["Juste à la caisse pour surprendre", "Tout au long du service (shampoing, coiffage)", "Jamais"],
        correctAnswer: 1,
        explanation: "L'éducation du client se fait par la démonstration et l'explication des bénéfices pendant l'utilisation."
      }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_coupe",
    topic: "Technique",
    title: "Coupe & Morphologie : sculpter le visage",
    description: "Apprenez à adapter chaque coupe à la forme du visage de vos finales.",
    mini_course: "Une coupe réussie est une coupe qui grandit bien.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. Analyse morphologique</h2><p>Visage ovale, rond, carré : à chaque forme sa géométrie.</p>`,
    coach_tip: "Utilisez le miroir pour valider l'équilibre sous tous les angles.",
    strategic_mantra: "L'harmonie visuelle est le but ultime.",
    quiz_questions: [
      {
        question: "Quelle forme de visage est considérée comme l'équilibre parfait ?",
        options: ["Rond", "Ovale", "Carré"],
        correctAnswer: 1,
        explanation: "Le but de la coiffure est souvent de créer l'illusion d'un visage ovale en corrigeant les autres formes."
      },
      {
        question: "Pour un visage très long, il faut éviter :",
        options: ["Le volume sur les côtés", "Le volume sur le dessus de tête", "La frange"],
        correctAnswer: 1,
        explanation: "Le volume en hauteur accentue la longueur du visage, ce qui déséquilibre l'harmonie."
      },
      {
        question: "Le diagnostic coupe se fait :",
        options: ["Cheveux mouillés uniquement", "Cheveux secs et naturels d'abord", "Au pifomètre"],
        correctAnswer: 1,
        explanation: "Analyser l'implantation et la chute naturelle sur cheveux secs est crucial pour la réussite de la structure."
      }
    ],
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
    quiz_questions: [
      {
        question: "C'est quoi le 'chevauchement' (overlapping) ?",
        options: ["Faire attendre le client sans raison", "Lancer une coupe pendant le temps de pose d'une couleur", "Se reposer entre deux clients"],
        correctAnswer: 1,
        explanation: "Optimiser les temps morts (pose technique) permet de doubler la rentabilité horaire."
      },
      {
        question: "Comment réduire les rendez-vous manqués (No-shows) ?",
        options: ["Ne rien faire", "Envoyer un SMS de rappel 24h avant", "Engueuler le client s'il arrive"],
        correctAnswer: 1,
        explanation: "Le rappel diminue les oublis de 80%. C'est une marque de professionnalisme."
      },
      {
        question: "Un bon planning doit être :",
        options: ["Une feuille de papier illisible", "Digital, partagé et rigoureux", "Géré uniquement de tête"],
        correctAnswer: 1,
        explanation: "La visibilité partagée évite les erreurs de rendez-vous et permet d'anticiper la charge de travail."
      }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_psychologie",
    topic: "Accueil",
    title: "Psychologie de la finale : comprendre l'inexprimé",
    description: "Apprenez à lire entre les lignes pour satisfaire les désirs cachés.",
    mini_course: "On coiffe une personner, pas seulement des cheveux.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. L'écoute active</h2><p>Décoder le langage corporel.</p>`,
    coach_tip: "Observez les bijoux et le style vestimentaire, ils parlent pour la finale.",
    strategic_mantra: "Celui qui comprend gagne.",
    quiz_questions: [
      {
        question: "Si une finale croise les bras pendant le diagnostic, cela peut signifier :",
        options: ["Qu'elle a froid", "Une barrière ou une hésitation", "Qu'elle est très détendue"],
        correctAnswer: 1,
        explanation: "Le langage corporel trahit souvent une inquiétude. Il faut alors la rassurer avant de commencer."
      },
      {
        question: "L'écoute active consiste à :",
        options: ["Attendre son tour de parler", "Reformuler les désirs de la finale pour confirmer sa demande", "Dire 'oui' à tout même si c'est impossible"],
        correctAnswer: 1,
        explanation: "La reformulation évite les malentendus et prouve à la finale que vous l'avez comprise."
      },
      {
        question: "La psychologie aide à :",
        options: ["Manipuler les gens", "Mieux conseiller et fidéliser par l'empathie", "Devenir psychanalyste"],
        correctAnswer: 1,
        explanation: "Un client compris est un client qui se sent en sécurité et qui reviendra."
      }
    ],
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
    quiz_questions: [
      {
        question: "C'est quoi un service 'Signature' ?",
        options: ["Une coupe banale", "Un protocole unique que l'on ne trouve que chez vous", "Une signature sur un papier"],
        correctAnswer: 1,
        explanation: "La signature crée la différence et empêche la comparaison de prix avec la concurrence."
      },
      {
        question: "Quel détail fait la différence en VIP ?",
        options: ["Avoir la télé allumée", "Le peignoir impeccable et une boisson de qualité", "Avoir beaucoup d'employés"],
        correctAnswer: 1,
        explanation: "Le confort sensoriel immédiat place le client dans un état d'esprit 'Luxe'."
      },
      {
        question: "Vendre du prestige, c'est vendre :",
        options: ["Du temps", "Un résultat et une émotion d'exception", "Plus de shampoing"],
        correctAnswer: 1,
        explanation: "Le client VIP paie pour l'expérience globale, pas seulement pour la technique."
      }
    ],
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
    quiz_questions: [
      {
        question: "C'est quoi le 'Ticket Moyen' ?",
        options: ["Le prix de la baguette", "Le chiffre d'affaires divisé par le nombre de clients", "Le prix du loyer"],
        correctAnswer: 1,
        explanation: "C'est l'indicateur roi. S'il monte, vous gagnez plus d'argent avec le même nombre de clients."
      },
      {
        question: "Votre stock est considéré comme :",
        options: ["De l'argent dormant sur les étagères", "Un cadeau des fournisseurs", "Inutile"],
        correctAnswer: 0,
        explanation: "Chaque produit non utilisé est de la trésorerie bloquée. Il faut le faire tourner."
      },
      {
        question: "Si vos charges augmentent, vous devez :",
        options: ["Travailler plus d'heures gratuitement", "Analyser vos indicateurs et ajuster vos tarifs ou votre revente", "Fermer le salon"],
        correctAnswer: 1,
        explanation: "La gestion, c'est l'ajustement constant entre ce qui sort et ce qui rentre."
      }
    ],
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
    quiz_questions: [
      {
        question: "Pourquoi avoir un compte bancaire pro ?",
        options: ["Pour faire joli", "Pour séparer vos finances personnelles de celles de l'entreprise", "Parce que c'est obligatoire partout"],
        correctAnswer: 1,
        explanation: "C'est la seule façon d'avoir une vision claire de la rentabilité réelle du salon."
      },
      {
        question: "La formalisation permet de :",
        options: ["Payer plus d'impôts uniquement", "Sécuriser son business et accéder à des prêts de développement", "Perdre son temps"],
        correctAnswer: 1,
        explanation: "Une entreprise structurée peut grandir, embaucher et investir grâce aux banques."
      },
      {
        question: "Le gérant formel :",
        options: ["Prend tout le cash dans sa poche le soir", "Se verse un salaire fixe et suit sa comptabilité", "Ne sait pas combien il gagne"],
        correctAnswer: 1,
        explanation: "Se verser un salaire permet de stabiliser sa vie privée sans mettre en danger le salon."
      }
    ],
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
  { id: 11, text: "Adaptez-vous systématiquement la géométrie de vos coupes à la morphologie du visage de vos finales ?", category: "Technique", linkedModuleId: "mod_coupe" },
  { id: 12, text: "Utilisez-vous un système de réservation optimisé pour éviter les temps morts et les chevauchements mal gérés ?", category: "Management", linkedModuleId: "mod_planning" },
  { id: 13, text: "Savez-vous décoder le langage corporel de vos finales pour leur proposer des services additionnels sans forcer ?", category: "Accueil", linkedModuleId: "mod_psychologie" },
  { id: 14, text: "Proposez-vous des rituels de prestige (boisson signature, serviette chaude) pour justifier des prix haut de gamme ?", category: "Prestige", linkedModuleId: "mod_vip" },
  { id: 15, text: "Analysez-vous vos indicateurs clés (ticket moyen, productivité) chaque soir avant de fermer le salon ?", category: "Finance", linkedModuleId: "mod_chiffres" },
  { id: 16, text: "Votre salon dispose-t-il d'une structure juridique et comptable claire pour accéder à des financements ?", category: "Management", linkedModuleId: "mod_formalisation" }
];
