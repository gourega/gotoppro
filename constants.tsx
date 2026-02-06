
import { TrainingModule, Badge, ModuleStatus } from './types';

// Ressources Visuelles Standard - Basées sur vos buckets Supabase
export const BRAND_LOGO = "https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/assets/logo.png";
export const KITA_LOGO = "https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/kita/logo-kita.png";

// Vidéo de Présentation (Lien Supabase mis à jour)
export const COACH_KITA_PROMO_VIDEO = "https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/assets/gotop-pro_online.mp4";

// Avatar de Coach Kita (Version Officielle extraite de votre bucket 'coach-kita')
export const COACH_KITA_AVATAR = "https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/coach-kita/coach-kita.jpg";

// Partenaire Excellence : Salon Chez Raymond (Extraits de vos buckets dédiés)
export const RAYMOND_LOGO = "https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/RAYMOND_LOGO/logo-raymond.png";
export const RAYMOND_PORTRAIT = "https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/assets/raymond-portrait.jpg";
export const RAYMOND_STYLING_PHOTO = "https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/RAYMOND_STYLING_PHOTO/styling-raymond.jpg";

export const RAYMOND_FB_URL = "https://web.facebook.com/salondecoiffurechezraymond";
export const RAYMOND_ADDRESS = "Cocody-II Plateaux-les Vallons, Rue des Jardins";
export const RAYMOND_PHONE = "+225 07 07 94 97 06";

// Bio & Coordonnées Officielles (CANTIC THINK IA)
export const COACH_KITA_FULL_NAME = "Ouréga Kouassi Goblé";
export const COACH_KITA_TITLE = "L’Architecte de la Rentabilité Beauté";
export const COACH_KITA_ESTABLISHMENT = "CANTIC THINK IA";
export const COACH_KITA_ADDRESS = "544, 2 Plateaux Agban - Rue 70 - Carrefour Kratos - Abidjan Cocody";
export const COACH_KITA_EMAIL = "ourega.goble@canticthinkia.ci";
export const COACH_KITA_PHONE = "+225 05 44 86 93 13"; 
export const COACH_KITA_WAVE_NUMBER = "01 03 43 84 56"; 
export const COACH_KITA_OPENING_YEAR = 2014;
export const COACH_KITA_EMPLOYEES = 10;

export const COACH_KITA_BIO = "Expert mentor avec plus de 25 ans d'immersion sur le terrain en Afrique de l’Ouest, Ouréga est le cerveau derrière le standard d'excellence KITA. Sa mission : injecter la rigueur du management moderne dans l'ADN des leaders de la beauté.";
export const COACH_KITA_SLOGAN = "Le talent attire le client, la stratégie bâtit l’empire.";

export const SUPER_ADMIN_PHONE_NUMBER = "+2250544869313";

export const LEGACY_ID_MAP: Record<string, string> = {
  "1": "mod_accueil_tel", "2": "mod_diagnostic", "3": "mod_hygiene", "4": "mod_shampoing",
  "5": "mod_pricing", "6": "mod_management", "7": "mod_fidelisation", "8": "mod_digital",
  "9": "mod_color", "10": "mod_retail", "11": "mod_coupe", "12": "mod_planning",
  "13": "mod_psychologie", "14": "mod_vip", "15": "mod_chiffres", "16": "mod_formalisation"
};

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
  "Noter une préférence personnelle (thé, café) dans le fichier client",
  "Répondre à un avis ou commentaire sur les réseaux sociaux",
  "Réorganiser sa desserte de travail pour gagner 1 minute",
  "Faire un diagnostic assis à hauteur de la cliente",
  "Proposer un produit de revente à la fin d'une prestation"
];

export const DEFAULT_KITA_SERVICES = [
  "Coupe Homme", "Coupe Femme", "Brushing", "Tresse", "Chignon", "Teinture", 
  "Mise en plis", "Shampoing", "Bain d'huile", "Défrisage", "Babyliss", 
  "Balayage", "Tissage", "Vernis à ongles", "Gel", "Manicure", "Pédicure", 
  "Pose Capsules", "Massage Crânien", "Soin du Visage", "Soin du Corps", 
  "Epilation", "Maquillage Jour", "Tracé de Sourcils", "Vente Produit Retail"
];

export const TRAINING_CATALOG: TrainingModule[] = [
  {
    id: "mod_accueil_tel",
    topic: "Accueil",
    title: "L'art de l'accueil téléphonique d'élite",
    description: "Le premier contact est le moment où vous gagnez ou perdez un client.",
    mini_course: "Votre téléphone est votre première caisse enregistreuse.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. La signature vocale : instaurer l'autorité</h2>
      <p>Le premier contact avec votre salon ne se fait pas dans le fauteuil, mais à travers une onde sonore. Un gérant d'élite impose un standard dès la première seconde.</p>
      <blockquote>« La voix est le miroir de votre salon ; si elle est hésitante, votre service le sera aussi. »</blockquote>
      <p>La formule d'or : <strong>« Salon [Nom], [Prénom] à votre écoute, bonjour. »</strong> Cette structure crée un lien humain et professionnel immédiat.</p>
      <h2>2. La prise de rendez-vous : le script de vente</h2>
      <p>Ne demandez jamais « quand voulez-vous venir ? ». Utilisez la méthode de l'alternative : <strong>« Je peux vous proposer mardi à 10h ou jeudi à 14h, laquelle de ces options vous convient ? »</strong> Cela crée un sentiment d'exclusivité.</p>
      <h2>3. Synthèse & Orientation : Le Défi de l'Excellence</h2>
      <p>Imaginez Mme Koné, une cliente pressée qui appelle trois salons. Le premier ne décroche pas, le second répond un "Allô" fatigué. Le vôtre répond avec le protocole Kita. Chez qui va-t-elle dépenser ses 50 000 francs ? La réponse est évidente.</p>
      <p><strong>Votre Défi des 24h :</strong> Appliquez la signature vocale à chaque appel dès demain. Ne laissez passer aucun "Allô" anonyme. Le quiz qui suit va valider votre grade de Leader de l'Accueil.</p>
    `,
    coach_tip: "Souriez en parlant, votre client l'entendra à travers le téléphone.",
    strategic_mantra: "Un appel raté est un client qui enrichit votre concurrent.",
    quiz_questions: [
      { question: "Quelle est la phrase d'accueil idéale ?", options: ["Allô ?", "Salon [Nom], [Prénom] à votre écoute, bonjour", "Oui c'est pour quoi ?"], correctAnswer: 1, explanation: "Cette formule établit votre autorité et rassure le client." },
      { question: "Comment proposer un créneau de rendez-vous ?", options: ["Quand seriez-vous libre ?", "Le mardi à 10h ou le jeudi à 14h ?", "Je n'ai plus de place"], correctAnswer: 1, explanation: "Donner deux alternatives guide le client vers une décision rapide." },
      { question: "Quelle est l'importance du sourire au téléphone ?", options: ["Inutile, on ne vous voit pas", "Essentiel, car il s'entend dans la voix", "C'est fatiguant"], correctAnswer: 1, explanation: "Le sourire modifie physiquement le timbre de voix et le rend plus accueillant." }
    ],
    exercises: ["Pratiquer la signature vocale lors des 10 prochains appels."],
    tips: ["Notez le nom du client dès le début de l'appel."]
  },
  {
    id: "mod_diagnostic",
    topic: "Technique",
    title: "Le diagnostic : devenir un expert conseil",
    description: "Transformez une simple coupe en une ordonnance de beauté rentable.",
    mini_course: "Celui qui pose les questions contrôle la conversation.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. La posture du mentor : briser le miroir</h2>
      <p>Le diagnostic est le moment le plus rentable de votre journée. Un expert ne commence jamais par demander « ce qu'on fait ? » mais par observer.</p>
      <blockquote>« Asseyez-vous à hauteur d'yeux. Ne parlez pas au reflet, parlez à la femme. »</blockquote>
      <p>Cette proximité visuelle instaure une relation de conseil plutôt qu'une simple exécution technique.</p>
      <h2>2. La méthode des 4 étapes : Observer, Toucher, Questionner, Prescrire</h2>
      <p>L'observation du style, le toucher de la fibre, les questions sur les habitudes et enfin la prescription obligatoire. La prescription n'est pas une option, c'est votre devoir d'expert.</p>
      <h2>3. Synthèse & Orientation : L'Expertise au Pouvoir</h2>
      <p>Un gérant qui ne fait pas de diagnostic finit par baisser ses prix pour garder ses clients. L'expert qui fait un diagnostic peut augmenter ses tarifs car il apporte une solution unique.</p>
      <p><strong>Votre Défi des 24h :</strong> Pour vos 3 prochaines clientes, accroupissez-vous ou asseyez-vous pour le diagnostic. Ne restez pas debout derrière elle. Validez maintenant votre maîtrise avec le quiz.</p>
    `,
    coach_tip: "Écoutez deux fois plus que vous ne parlez pendant le diagnostic.",
    strategic_mantra: "Le client n'achète pas vos outils, il achète votre regard d'expert.",
    quiz_questions: [
      { question: "Où doit se situer le gérant ?", options: ["Derrière le fauteuil", "À hauteur des yeux de la clinique", "Au comptoir"], correctAnswer: 1, explanation: "Se mettre à hauteur d'yeux instaure la confiance." },
      { question: "Quelle est la 4ème étape cruciale du diagnostic ?", options: ["Le rinçage", "La prescription", "Le paiement"], correctAnswer: 1, explanation: "Le prescription assure le suivi du soin à domicile et augmente le CA." },
      { question: "Pourquoi toucher les cheveux pendant le diagnostic ?", options: ["Par habitude", "Pour évaluer la santé de la fibre", "Pour les démêler"], correctAnswer: 1, explanation: "Le toucher expert crédibilise votre recommandation de soin." }
    ],
    exercises: ["Faire 3 diagnostics assis aujourd'hui."],
    tips: ["Utilisez le toucher pour justifier vos soins."]
  },
  {
    id: "mod_hygiene",
    topic: "Hygiène",
    title: "Propreté irréprochable : le standard luxe",
    description: "L'hygiène est votre meilleur argument de vente invisible.",
    mini_course: "Un salon propre peut facturer 20% plus cher.",
    price: 500,
    aiCredits: 2,
    lesson_content: `
      <h2>1. La désinfection visible : un acte marketing</h2>
      <p>Désinfecter ses outils dans l'arrière-boutique est une erreur. Le client doit voir le geste pour y croire.</p>
      <blockquote>« L'hygiène n'est pas une contrainte, c'est votre signature de luxe. »</blockquote>
      <p>Nettoyez le fauteuil avec un spray devant la clinique. Cela augmente instantanément la valeur perçue de votre travail.</p>
      <h2>2. Les points critiques : bacs et brosses</h2>
      <p>Rien ne détruit plus la confiance que des cheveux restés sur une brosse. Installez une routine : après chaque client, le poste redeviendra « neuf ».</p>
      <h2>3. Synthèse & Orientation : La Rigueur qui Rassure</h2>
      <p>Dans un marché où l'informel domine, votre rigueur sur l'hygiène est ce qui vous fera sortir du lot et attirera la clientèle VIP, celle qui ne négocie pas les prix.</p>
      <p><strong>Votre Défi des 24h :</strong> Nettoyez systématiquement vos ciseaux et votre peigne devant votre prochaine clinique en expliquant pourquoi vous le faites. Prêt pour la certification ?</p>
    `,
    coach_tip: "Un bac à shampoing sale fait fuir les meilleurs clients définitivement.",
    strategic_mantra: "L'excellence commence par un peigne sans cheveux.",
    quiz_questions: [
      { question: "Quand nettoyer vos outils ?", options: ["Le soir", "Devant le client", "Une fois par semaine"], correctAnswer: 1, explanation: "Le faire devant le client prouve votre standard." },
      { question: "Que faire du peignoir entre deux clients ?", options: ["Le secouer", "Le plier", "Le changer ou utiliser un protège-cou"], correctAnswer: 2, explanation: "Le contact direct avec un peignoir déjà utilisé est un manque d'hygiène." },
      { question: "Quel est l'impact de l'hygiène sur les prix ?", options: ["Aucun", "Permet de justifier des tarifs plus hauts", "Ça coûte trop cher"], correctAnswer: 1, explanation: "L'hygiène rassure et place votre salon dans la catégorie Prestige." }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_shampoing",
    topic: "Technique",
    title: "L'art du shampoing : le moment de vérité",
    description: "Le shampoing n'est pas un nettoyage, c'est un soin sensoriel.",
    mini_course: "C'est au bac que vous gagnez le cœur de votre clinique.",
    price: 500,
    aiCredits: 2,
    lesson_content: `
      <h2>1. Le rituel sensoriel Kita : déconnexion totale</h2>
      <p>Le passage au bac est le seul moment où la clinique ferme les yeux. Si vous parlez des potins à ce moment, vous gâchez tout.</p>
      <blockquote>« Le massage crânien n'est pas un bonus, c'est l'âme du prestige. »</blockquote>
      <p>Pratiquez la règle du silence. Ne parlez que pour la température de l'eau. Utilisez des mouvements lents et profonds.</p>
      <h2>2. L'expertise technique : émulsion et rinçage</h2>
      <p>Un bon shampoing commence par une émulsion parfaite. Le rinçage doit être méticuleux : un cheveu qui « crisse » est un cheveu propre.</p>
      <h2>3. Synthèse & Orientation : L'Ancrage Émotionnel</h2>
      <p>Beaucoup de salons font de bons brushings, peu font des shampoings inoubliables. C'est ici que se joue la fidélité de votre clinique sur les 10 prochaines années.</p>
      <p><strong>Votre Défi des 24h :</strong> Réalisez un massage crânien de 3 minutes en silence total pour votre prochaine clinique. Observez son visage à la fin. Relevez le défi du quiz maintenant.</p>
    `,
    coach_tip: "Le silence au bac est d'or.",
    strategic_mantra: "Un shampoing bâclé est une expérience client ratée.",
    quiz_questions: [
      { question: "Quelle attitude au bac ?", options: ["Discuter", "Silence et massage", "Demander si elle va bien"], correctAnswer: 1, explanation: "Le silence favorise la relaxation." },
      { question: "Comme savoir si le cheveu est bien rincé ?", options: ["Au toucher gras", "Quand il crisse sous les doigts", "À la couleur de l'eau"], correctAnswer: 1, explanation: "Un cheveu qui crisse est parfaitement débarrassé des résidus." },
      { question: "Où se place la main lors du massage ?", options: ["Sur les yeux", "Aux points de tension (nuque, tempes)", "Sur le front"], correctAnswer: 1, explanation: "Masser les points de tension libère les endorphines du bien-être." }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_pricing",
    topic: "Finance",
    title: "Tarification stratégique : valoriser son talent",
    description: "Arrêtez de copier le voisin. Fixez vos prix sur votre valeur.",
    mini_course: "Un tarif trop bas est un signal de manque de confiance.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. Le calcul du coût-minute</h2>
      <p>Votre tarif doit être basé sur vos charges divisées par votre temps d'ouverture. On ne baisse pas les prix pour attirer, on augmente la qualité pour justifier.</p>
      <blockquote>« Le talent a un prix, le brader est une insulte à votre métier. »</blockquote>
      <h2>2. La psychologie du menu de services</h2>
      <p>Présentez toujours trois options : Standard, Expert et Prestige. La majorité choisira l'intermédiaire, augmentant mécaniquement votre panier moyen.</p>
      <h2>3. Synthèse & Orientation : Sortir de la Survie</h2>
      <p>Voulez-vous être le salon le moins cher du quartier ou le plus rentable ? La rentabilité vous permet d'investir dans de meilleurs produits et de mieux payer votre équipe.</p>
      <p><strong>Votre Défi des 24h :</strong> Analysez votre prestation phare. Calculez précisément ce qu'elle vous coûte en temps et en produit. Répondez au quiz pour maîtriser vos finances.</p>
    `,
    coach_tip: "Votre talent n'est pas négociable.",
    strategic_mantra: "Mieux vaut 10 clients au juste prix que 30 à perte.",
    quiz_questions: [
      { question: "Sur quoi baser votre tarif ?", options: ["Prix du voisin", "Coût minute + Expertise", "Humeur du client"], correctAnswer: 1, explanation: "Le prix doit couvrir vos charges et votre marque." },
      { question: "Pourquoi proposer 3 niveaux de prix ?", options: ["Pour perdre le client", "Pour orienter vers l'offre intermédiaire", "Pour faire joli"], correctAnswer: 1, explanation: "C'est l'effet d'ancrage psychologique pour augmenter le panier moyen." },
      { question: "Que faire si un client dit que c'est trop cher ?", options: ["Baisser le prix", "Expliquer la valeur et les produits utilisés", "Se fâcher"], correctAnswer: 1, explanation: "On ne défend un prix, on justifie une valeur." }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_management",
    topic: "Management",
    title: "Leadership et motivation d'équipe",
    description: "Transformez vos collaborateurs en partenaires engagés.",
    mini_course: "Une équipe qui sourit est une équipe qui vend.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. Le gérant-pilote : l'exemplarité</h2>
      <p>Votre équipe fera ce que vous faites, pas ce que vous dites. Le leadership commence par arriver le premier et respecter ses propres règles.</p>
      <h2>2. Le briefing du matin : fixer le cap</h2>
      <p>Instaurez 5 minutes de briefing chaque matin. Donnez l'objectif de CA du jour. Un collaborateur qui connaît sa direction est motivé.</p>
      <h2>3. Synthèse & Orientation : Bâtir un Corps d'Élite</h2>
      <p>Votre salon ne pourra pas grandir si vous êtes le seul à bien travailler. Votre rôle est de faire briller les autres pour que le salon brille sans vous.</p>
      <p><strong>Votre Défi des 24h :</strong> Félicitez un collaborateur pour une action précise aujourd'hui devant le reste de l'équipe. Passez le quiz pour devenir un vrai leader.</p>
    `,
    coach_tip: "Félicitez en public, recadrez en privé.",
    strategic_mantra: "Seul on va vite, ensemble on bâtit un empire.",
    quiz_questions: [
      { question: "Comme recadrer ?", options: ["Devant l'équipe", "En privé avec calme", "Par WhatsApp"], correctAnswer: 1, explanation: "Le respect mutuel préserve la dignité." },
      { question: "Quelle est la durée idéale d'un briefing ?", options: ["1 heure", "5 à 10 minutes", "Toute la matinée"], correctAnswer: 1, explanation: "Un briefing court et percutant donne de l'énergie sans perdre de temps." },
      { question: "C'est quoi l'exemplarité ?", options: ["Donner des ordres", "Faire ce qu'on demande aux autres de faire", "Regarder"], correctAnswer: 1, explanation: "Le leader montre le chemin par ses propres actes." }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_fidelisation",
    topic: "Vente",
    title: "Fidélisation : transformer le client en fan",
    description: "Garder un client coûte 5 fois moins cher qu'en trouver un nouveau.",
    mini_course: "Un client fidèle est votre meilleur ambassadeur.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. L'effet WOW : dépasser les attentes</h2>
      <p>La technique ne suffit plus. On revient pour ce que l'on a ressenti. Offrez un petit soin express imprévu ou rappelez-vous de son anniversaire.</p>
      <h2>2. Le fichier client : votre mine d'or</h2>
      <p>Notez tout. Un message WhatsApp personnalisé : « Bonjour Mme Koné, vous nous manquez ! » génère un RDV dans 50% des cas.</p>
      <h2>3. Synthèse & Orientation : La Richesse est dans le Suivi</h2>
      <p>Le succès d'un salon ne se mesure pas au nombre de nouveaux visages, mais au nombre de visages qui reviennent chaque mois avec le sourire.</p>
      <p><strong>Votre Défi des 24h :</strong> Envoyez un message de courtoisie à 3 clientes qui ne sont pas venues depuis 1 mois. Validez le quiz pour sceller votre stratégie fan.</p>
    `,
    coach_tip: "Le café offert vaut plus que 10% de remise.",
    strategic_mantra: "Le client revient pour l'émotion vécue.",
    quiz_questions: [
      { question: "Que noter dans le fichier ?", options: ["Rien", "Historique et préférences", "Couleur des yeux"], correctAnswer: 1, explanation: "La personnalisation crée l'attachement." },
      { question: "Quel est le but de 'l'effet WOW' ?", options: ["Surprendre positivement", "Faire peur", "Vendre plus cher"], correctAnswer: 0, explanation: "L'inattendu crée un souvenir mémorable." },
      { question: "Combien coûte un nouveau client ?", options: ["Moins cher qu'un ancien", "5 fois plus qu'en garder un", "Rien"], correctAnswer: 1, explanation: "Investir sur sa base existante est la stratégie la plus rentable." }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_digital",
    topic: "Marketing",
    title: "Marketing Digital : attirer les meilleurs",
    description: "Utilisez Instagram et WhatsApp pour remplir votre agenda.",
    mini_course: "Votre vitrine est dans la poche de vos cliniques.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. Le pouvoir de l'image : Avant/Après</h2>
      <p>Instagram est le premier salon du monde. Si vos photos sont floues, vous détruisez votre expertise. Utilisez la lumière naturelle.</p>
      <h2>2. La règle des trois tiers pour vos réseaux</h2>
      <p>1/3 réalisations techniques, 1/3 coulisses du salon, 1/3 conseils d'expert. C'est ce mélange qui crée la confiance.</p>
      <h2>3. Synthèse & Orientation : De l'Ombre à la Lumière</h2>
      <p>Vous avez du talent, mais le monde doit le savoir. Le digital n'est pas une option, c'est votre haut-parleur pour attirer les cliniques VIP de toute la ville.</p>
      <p><strong>Votre Défi des 24h :</strong> Postez une photo 'Avant/Après' parfaite sur votre statut WhatsApp aujourd'hui. Prêt pour le quiz digital ?</p>
    `,
    coach_tip: "Postez une photo par jour à l'heure du déjeuner.",
    strategic_mantra: "Si on ne vous voit pas, vous n'existez pas.",
    quiz_questions: [
      { question: "Quelle photo attire ?", options: ["Floue", "Avant/Après bien éclairé", "Le salon vide"], correctAnswer: 1, explanation: "Le résultat concret rassure." },
      { question: "Quel est le meilleur moment pour poster ?", options: ["Minuit", "Heures de pause (12h-13h ou soir)", "Pendant qu'on travaille"], correctAnswer: 1, explanation: "C'est quand vos cliniques sont sur leur téléphone." },
      { question: "Que signifie le tiers 'Conseil' ?", options: ["Donner ses prix", "Aider la clinique avec un tips", "Se plaindre"], correctAnswer: 1, explanation: "Partager votre savoir vous positionne en expert." }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_color",
    topic: "Technique",
    title: "Colorimétrie Expert : la science des nuances",
    description: "Maîtrisez la chimie pour éviter les erreurs coûteuses.",
    mini_course: "La couleur est l'âme du salon.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. La roue chromatique : l'arme fatale</h2>
      <p>La colorimétrie n'est pas de la magie. Comprendre l'étoile d'Oswald est la base pour neutraliser un reflet roux ou jaune indésirable.</p>
      <h2>2. La précision du mélange : pesez tout !</h2>
      <p>Travailler à l'œil est une erreur de débutant. Utilisez une balance électronique. 5 grammes de trop chaque jour, c'est des milliers de francs jetés par mois.</p>
      <h2>3. Synthèse & Orientation : La Maîtrise Technique</h2>
      <p>Un coloriste qui ne pèse pas ses mélanges est un amateur qui joue avec l'argent du salon. Soyez le scientifique que vos cliniques attendent.</p>
      <p><strong>Votre Défi des 24h :</strong> Pesez chaque gramme de votre prochain mélange couleur. Pas d'exception. Validez votre expertise avec le quiz.</p>
    `,
    coach_tip: "Pesez toujours vos mélanges.",
    strategic_mantra: "La précision technique évite les rattrapages gratuits.",
    quiz_questions: [
      { question: "Pourquoi peser ?", options: ["Pour faire joli", "Précision et contrôle coût", "C'est scientifique"], correctAnswer: 1, explanation: "La rentabilité passe par la précision." },
      { question: "Comment neutraliser un reflet jaune ?", options: ["Avec du bleu", "Avec du violet", "Avec du vert"], correctAnswer: 1, explanation: "Le violet est l'opposé du jaune sur l'étoile d'Oswald." },
      { question: "Que se passe-t-il si on ne pèse pas ?", options: ["On gagne du temps", "On gaspille du produit et on perd en régularité", "C'est pareil"], correctAnswer: 1, explanation: "Sans pesée, impossible de reproduire exactement la même couleur au prochain RDV." }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_retail",
    topic: "Vente",
    title: "Vente de produits : conseiller comme un expert",
    description: "Apprenez à vendre pour augmenter vos revenus sans effort.",
    mini_course: "Si votre clinique achète ailleurs, vous perdez de l'argent.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. La prescription d'expert : ne vendez pas, conseillez</h2>
      <p>Ne pas conseiller le bon produit à votre clinique, c'est la laisser détruire votre travail avec un shampoing de mauvaise qualité.</p>
      <h2>2. Le taux de revente : votre indicateur clé</h2>
      <p>La revente doit représenter 15% de votre CA. C'est de la marge pure sans temps de travail additionnel.</p>
      <h2>3. Synthèse & Orientation : Le Service Complet</h2>
      <p>Votre travail ne s'arrête pas quand la clinique quitte le fauteuil. Il s'arrête quand vous êtes sûr qu'elle saura entretenir sa beauté chez elle grâce à vos produits.</p>
      <p><strong>Votre Défi des 24h :</strong> Proposez systématiquement un produit de soin à domicile à vos 3 prochaines cliniques. Le quiz vous attend pour valider ce levier.</p>
    `,
    coach_tip: "Vos bacs sont votre meilleure salle d'exposition.",
    strategic_mantra: "Vendre un produit, c'est prendre soin de la clinique chez elle.",
    quiz_questions: [
      { question: "Quand parler du produit ?", options: ["À la caisse", "Pendant le service", "Jamais"], correctAnswer: 1, explanation: "L'éducation se fait par la démonstration." },
      { question: "Quel pourcentage du CA doit viser la revente ?", options: ["2%", "15% et plus", "50%"], correctAnswer: 1, explanation: "15% est le seuil de rentabilité d'un salon d'élite." },
      { question: "Comment débuter le conseil ?", options: ["Voulez-vous acheter ?", "Pour entretenir ce résultat, voici ce qu'il vous faut", "C'est cher"], correctAnswer: 1, explanation: "Liez le produit au résultat technique que vous venez de créer." }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_coupe",
    topic: "Technique",
    title: "Coupe & Morphologie : sculpter le visage",
    description: "Adaptez chaque coupe à la forme unique de vos cliniques.",
    mini_course: "Une coupe réussie est une coupe qui grandit bien.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. L'analyse morpho-psychologique</h2>
      <p>Votre rôle est de rééquilibrer les volumes pour approcher la forme idéale : l'ovale. Observez la mâchoire et le font.</p>
      <h2>2. La géométrie de la coupe : angles et sections</h2>
      <p>La réussite réside dans la précision de vos séparations. Comprendre l'angles d'élévation vous permet de créer du volume avec précision.</p>
      <h2>3. Synthèse & Orientation : L'Architecte de la Beauté</h2>
      <p>Ne soyez pas un simple exécutant de photos trouvées sur internet. Soyez l'architecte qui crée une structure adaptée à la personnalité de sa clinique.</p>
      <p><strong>Votre Défi des 24h :</strong> Expliquez techniquement à votre prochaine clinique pourquoi vous choisissez tel angle de coupe par rapport à son visage. Prêt pour le quiz ?</p>
    `,
    coach_tip: "Utilisez le miroir pour valider l'équilibre.",
    strategic_mantra: "L'harmonie visuelle est le but ultime.",
    quiz_questions: [
      { question: "Quelle forme de visage idéale ?", options: ["Rond", "Ovale", "Carré"], correctAnswer: 1, explanation: "L'ovale est l'équilibre parfait en coiffure." },
      { question: "Que crée un angle de 90 degrés ?", options: ["De la masse", "Du dégradé (volume léger)", "Rien"], correctAnswer: 1, explanation: "L'élévation crée le mouvement." },
      { question: "Pourquoi expliquer le choix technique à la clinique ?", options: ["Pour frimer", "Pour asseoir votre autorité d'expert", "Pour parler"], correctAnswer: 1, explanation: "L'expertise expliquée ne se négocie pas." }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_planning",
    topic: "Management",
    title: "Organisation du Planning : gagner du temps",
    description: "Optimisez chaque minute pour maximiser votre CA.",
    mini_course: "Le temps est votre seule ressource limitée.",
    price: 500,
    aiCredits: 2,
    lesson_content: `
      <h2>1. Le séquençage intelligent (Overlapping)</h2>
      <p>Pendant qu'une couleur pose, vous devriez déjà effectuer une coupe sur une autre clinique. Optimisez les temps morts.</p>
      <h2>2. La lutte contre les rendez-vous manqués</h2>
      <p>Envoyez un rappel WhatsApp la veille. Cette simple action réduit les oublis de 80% et montre votre professionnalisme.</p>
      <h2>3. Synthèse & Orientation : Maître de son Temps</h2>
      <p>Un gérant délégué est un gérant qui ne pilote plus. Reprenez le contrôle de votre agenda pour libérer du temps pour votre vision stratégique.</p>
      <p><strong>Votre Défi des 24h :</strong> Appellez ou écrivez à toutes vos cliniques de demain pour confirmer leur rendez-vous. Validez votre maîtrise du temps avec le quiz.</p>
    `,
    coach_tip: "Prévoyez toujours 15 minutes de marge.",
    strategic_mantra: "Un planning fluide est un gérant serein.",
    quiz_questions: [
      { question: "C'est quoi l'overlapping ?", options: ["Attendre", "Coupe pendant pose couleur", "Se reposer"], correctAnswer: 1, explanation: "Optimiser les poses double la rentabilité." },
      { question: "Comment réduire les rendez-vous manqués ?", options: ["Se fâcher", "Rappel WhatsApp la veille", "Payer d'avance"], correctAnswer: 1, explanation: "Un rappel courtois suffit souvent à libérer un créneau si la clinique ne vient pas." },
      { question: "Pourquoi laisser 15 min de marge ?", options: ["Pour boire un café", "Pour gérer les imprévus et le nettoyage", "C'est inutile"], correctAnswer: 1, explanation: "La marge évite le stress du retard cumulé." }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_psychologie",
    topic: "Accueil",
    title: "Psychologie de la clinique : comprendre l'inexprimé",
    description: "Apprenez à lire entre les lignes pour satisfaire les désirs cachés.",
    mini_course: "On coiffe une personne, pas seulement des cheveux.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. L'écoute active et le décodage</h2>
      <p>Pratiquez la reformulation : « Si j'ai bien compris, vous souhaitez... ? ». Cela évite les litiges et prouve que vous écoutez.</p>
      <h2>2. Gérer les cliniques difficiles</h2>
      <p>Restez calme, ne justifiez pas l'erreur, proposez une version de solution. Transformer un litige en succès est votre test de Leader Pendulaire.</p>
      <h2>3. Synthèse & Orientation : La Connexion Humaine</h2>
      <p>Votre salon est un lieu de thérapie autant que de beauté. Maîtriser la psychologie vous rend indispensable aux yeux de vos cliniques.</p>
      <p><strong>Votre Défi des 24h :</strong> Reformulez chaque demande de clinique aujourd'hui pour valider sa compréhension. Passez maintenant à la certification.</p>
    `,
    coach_tip: "Observez le langage corporel.",
    strategic_mantra: "Celui qui comprend gagne le marché.",
    quiz_questions: [
      { question: "Utilité de l'écoute active ?", options: ["Manipuler", "Mieux conseiller et fidéliser", "Devenir psy"], correctAnswer: 1, explanation: "Une clinique comprise est une clinique en sécurité." },
      { question: "Quelle réaction face à une clinique mécontente ?", options: ["Argumenter", "Écouter, s'excuser et proposer une solution", "Ignorer"], correctAnswer: 1, explanation: "L'empathie désamorce 90% des conflits." },
      { question: "Que trahit un bras croisé ?", options: ["Une fermeture ou un doute", "Un confort", "Rien"], correctAnswer: 0, explanation: "Le corps parle souvent avant la bouche." }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_vip",
    topic: "Prestige",
    title: "Services VIP & Prestige : viser le haut de gamme",
    description: "Transformez votre salon en une adresse incontournable pour l'élite.",
    mini_course: "Le luxe se niche dans les détails invisibles.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. Les codes de l'hospitalité d'élite</h2>
      <p>Offrez une boisson signature servie dans une vraie tasse. Proposez une serviette chaude parfumée à l'eucalyptus au bac.</p>
      <h2>2. L'exclusivité et la confidentialité</h2>
      <p>Le client VIP paie pour ne pas être vu. Si vous pouvez, créez un coin discret. Garantissez une discrétion totale sur les échanges.</p>
      <h2>3. Synthèse & Orientation : Élever les Standards</h2>
      <p>Le prestige n'est pas une question de marbre au sol, mais de qualité de présence. Soyez le gérant qui offre l'exceptionnel dans chaque geste.</p>
      <p><strong>Votre Défi des 24h :</strong> Prévoyez une petite attention particulière pour votre meilleure clinique demain (boisson, échantillon luxe). Relevez le défi du quiz VIP.</p>
    `,
    coach_tip: "L'exclusivité crée le désir.",
    strategic_mantra: "Le prestige autorise des marges extraordinaires.",
    quiz_questions: [
      { question: "Détail VIP ?", options: ["Télé allumée", "Peignoir impeccable et boisson", "Beaucoup de staff"], correctAnswer: 1, explanation: "Le confort sensoriel immédiat définit le luxe." },
      { question: "Comment assurer la confidentialité ?", options: ["Parler fort", "Baisser le ton et être discret", "Tout raconter"], correctAnswer: 1, explanation: "Le VIP recherche un sanctuaire de discrétion." },
      { question: "L'atout majeur du prestige ?", options: ["Les prix hauts", "L'attention portée aux détails", "La déco"], correctAnswer: 1, explanation: "Le service d'exception justifie le tarif." }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_chiffres",
    topic: "Finance",
    title: "Analyse des Chiffres : piloter par la donnée",
    description: "Ne gérez plus au doigt mouillé. Apprenez à lire votre succès.",
    mini_course: "Les chiffres ne mentent jamais.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. Les indicateurs clés (KPI)</h2>
      <p>Suivez votre ticket moyen et votre taux de revente chaque soir. Ce qui ne se mesure pas ne s'amplifie pas.</p>
      <h2>2. Gérer son stock comme un investisseur</h2>
      <p>Le produit sur vos étagères est de l'argent qui dort. Apprenez à calculer votre taux de rotation.</p>
      <h2>3. Synthèse & Orientation : Devenir un Gestionnaire</h2>
      <p>Un bon coiffeur gagne sa vie, un bon gestionnaire bâtit un patrimoine. Changez votre regard sur votre caisse pour en faire un moteur de croissance.</p>
      <p><strong>Votre Défi des 24h :</strong> Calculez votre ticket moyen de la journée (Recettes / Nombre de cliniques). Répondez au quiz pour devenir un pro des chiffres.</p>
    `,
    coach_tip: "Vérifiez vos chiffres tous les soirs.",
    strategic_mantra: "Ce qui ne se mesure pas ne s'amplifie pas.",
    quiz_questions: [
      { question: "C'est quoi le ticket moyen ?", options: ["Prix baguette", "CA / Nombre de clients", "Prix loyer"], correctAnswer: 1, explanation: "C'est l'indicator de votre performance de vente." },
      { question: "Que faire du stock dormant ?", options: ["Le laisser", "Le vendre en promotion ou en coffret", "Le jeter"], correctAnswer: 1, explanation: "Chaque produit non vendu est une perte de trésorerie." },
      { question: "À quelle fréquence analyser ses chiffres ?", options: ["Par an", "Tous les soirs", "Jamais"], correctAnswer: 1, explanation: "L'analyse quotidienne permet des corrections rapides." }
    ],
    exercises: [],
    tips: []
  },
  {
    id: "mod_formalisation",
    topic: "Management",
    title: "Formalisation & Structure : bâtir du solide",
    description: "Sortez de l'informel pour accéder aux crédits et à la croissance.",
    mini_course: "Un salon formel est un salon pérenne.",
    price: 500,
    aiCredits: 2,
    lesson_content: `
      <h2>1. De l'informel au business structuré</h2>
      <p>Ouvrez un compte bancaire dédié au salon. Ne mélangez jamais argent personnel et caisse. Versez-vous un salaire fixe.</p>
      <h2>2. La protection juridique et comptable</h2>
      <p>Déclarez votre personnel progressivement. La formalisation est une protection en cas de litige et une valorisation de votre salon.</p>
      <h2>3. Synthèse & Orientation : La Vision Long Terme</h2>
      <p>Le respect des règles administratives n'est pas un fardeau, c'est la porte d'entrée vers les banques et les investisseurs qui financeront votre futur empire.</p>
      <p><strong>Votre Défi des 24h :</strong> Séparez physiquement l'argent de votre prochain salaire de la caisse du jour. Validez votre maturité de gérant avec le dernier quiz.</p>
    `,
    coach_tip: "Séparez argent personnel et pro.",
    strategic_mantra: "La rigueur administrative est la base de la liberté.",
    quiz_questions: [
      { question: "Pourquoi un compte pro ?", options: ["Pour faire joli", "Séparer finances perso et pro", "C'est obligatoire"], correctAnswer: 1, explanation: "C'est la base d'une gestion saine." },
      { question: "Utilité de se verser un salaire fixe ?", options: ["Dépenser plus", "Prendre conscience de la marge réelle du salon", "Payer des impôts"], correctAnswer: 1, explanation: "Le gérant ne doit pas 'piocher' dans la caisse." },
      { question: "Avantage de la formalisation ?", options: ["Plus de contrôle fiscal", "Accès aux crédits bancaires et partenaires", "Perte de temps"], correctAnswer: 1, explanation: "La banque prête à ceux qui prouvent leur sérieux par les chiffres." }
    ],
    exercises: [],
    tips: []
  }
];

export const BADGES: Badge[] = [
  { id: "first_module", name: "Décollage", icon: "🚀", description: "Premier module terminé.", condition: (u, mods) => mods.some(m => m.status === ModuleStatus.COMPLETED) },
  { id: "ambassador", name: "Ambassadeur", icon: "🤝", description: "A parrainé 1 gérant.", condition: (u) => (u.referralCount || 0) >= 1 },
  { id: "dedicated", name: "Maître du Salon", icon: "🏆", description: "5 modules terminés.", condition: (u, mods) => mods.filter(m => m.status === ModuleStatus.COMPLETED).length >= 5 },
  { id: "legend", name: "Légende du Salon", icon: "👑", description: "12 modules terminés.", condition: (u, mods) => mods.filter(m => m.status === ModuleStatus.COMPLETED).length >= 12 }
];

export const DIAGNOSTIC_QUESTIONS = [
  { id: 1, text: "Votre équipe est-elle formée à un accueil téléphonique qui transforme chaque appel ?", category: "Accueil", linkedModuleId: "mod_accueil_tel" },
  { id: 2, text: "Réalisez-vous un diagnostic visuel et tactile assis avant chaque prestation ?", category: "Technique", linkedModuleId: "mod_diagnostic" },
  { id: 3, text: "Désinfectez-vous systématiquement vos outils devant la clinique ?", category: "Hygiène", linkedModuleId: "mod_hygiene" },
  // Fix: Corrected typo where 'id:e 4' was written instead of 'id: 4'
  { id: 4, text: "Le passage au bac est-il un rituel de relaxation avec massage crânien ?", category: "Technique", linkedModuleId: "mod_shampoing" },
  { id: 5, text: "Calculez-vous vos tarifs en fonction de votre coût à la minute réel ?", category: "Finance", linkedModuleId: "mod_pricing" },
  { id: 6, text: "Réunissez-vous votre équipe chaque semaine pour fixer des objectifs ?", category: "Management", linkedModuleId: "mod_management" },
  { id: 7, text: "Utilisez-vous un fichier clinique pour relancer les absentes ?", category: "Vente", linkedModuleId: "mod_fidelisation" },
  { id: 8, text: "Publiez-vous chaque jour une photo de vos réalisations sur les réseaux ?", category: "Marketing", linkedModuleId: "mod_digital" },
  { id: 9, text: "Maîtrisez-vous parfaitement la roue chromatique pour éviter les erreurs ?", category: "Technique", linkedModuleId: "mod_color" },
  { id: 10, text: "Votre taux de revente de produits représente-t-il plus de 15 % du CA ?", category: "Vente", linkedModuleId: "mod_retail" },
  { id: 11, text: "Adaptez-vous systématiquement vos coupes à la morphologie du visage ?", category: "Technique", linkedModuleId: "mod_coupe" },
  { id: 12, text: "Utilisez-vous un système de réservation optimisé pour éviter les temps morts ?", category: "Management", linkedModuleId: "mod_planning" },
  { id: 13, text: "Savez-vous décoder le langage corporel de vos cliniques ?", category: "Accueil", linkedModuleId: "mod_psychologie" },
  { id: 14, text: "Proposez-vous des rituels de prestige pour justifier des prix luxe ?", category: "Prestige", linkedModuleId: "mod_vip" },
  { id: 15, text: "Analysez-vous vos indicateurs clés (ticket moyen) chaque soir ?", category: "Finance", linkedModuleId: "mod_chiffres" },
  { id: 16, text: "Votre salon dispose-t-il d'une structure claire pour accéder aux prêts ?", category: "Management", linkedModuleId: "mod_formalisation" }
];
