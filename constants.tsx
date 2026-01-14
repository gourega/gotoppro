
import { TrainingModule, Badge, ModuleStatus } from './types';

// Ressources Visuelles
export const BRAND_LOGO = "https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/assets/logo.png";
export const KITA_LOGO = "https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/kita/logo-kita.png";
export const COACH_KITA_AVATAR = "https://uyqjorpvmqremxbfeepl.supabase.co/storage/v1/object/public/avatars/35ee91c6-b485-4fb0-aefa-7de0c54571e3/COACH_KITA_AVATAR.png";

// Bio Officielle
export const COACH_KITA_FULL_NAME = "Ouréga Kouassi Goblé";
export const COACH_KITA_TITLE = "L’Architecte de la Rentabilité Beauté";
export const COACH_KITA_BIO = "Expert mentor avec plus de 25 ans d'immersion sur le terrain en Afrique de l’Ouest, Ouréga est le cerveau derrière le standard d'excellence KITA. Il a identifié les 16 leviers critiques qui séparent les gérants qui stagnent de ceux qui règnent. Sa mission : injecter la rigueur du management moderne dans l'ADN des leaders de la beauté ivoirienne.";
export const COACH_KITA_SLOGAN = "Le talent attire le client, la stratégie bâtit l’empire.";

// Partenaire Officiel
export const RAYMOND_LOGO = "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&q=80"; // Placeholder haute qualité pour le salon
export const RAYMOND_FB_URL = "https://web.facebook.com/salondecoiffurechezraymond";
export const RAYMOND_PHONE = "+2250707949706";
export const RAYMOND_ADDRESS = "Cocody-II Plateaux-les Vallons";

export const SUPER_ADMIN_PHONE_NUMBER = "+2250001020304";

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
  "Féliciter un collaborateur pour un détail précis de son travail",
  "Vérifier la propreté du bac à shampoing après chaque passage",
  "Peser précisément le mélange de la prochaine coloration",
  "Noter une préférence personnelle (thé, café) dans un carnet client",
  "Répondre à un avis ou commentaire sur les réseaux sociaux",
  "Réorganiser sa desserte de travail pour gagner 1 minute",
  "Vérifier ses chaussures et sa tenue devant le miroir",
  "Faire un diagnostic assis à hauteur de la cliente",
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
      
      <h2>2. La prise de rendez-vous active</h2>
      <p>L'expert ne subit jamais son agenda, il le pilote. Si vous demandez « quand voulez-vous venir ? », vous donnez le pouvoir au client de bloquer vos heures de pointe tout en laissant vos heures creuses vides. C'est la mort de votre rentabilité.</p>
      <p>Apprenez à diriger le flux. Proposez toujours deux options précises qui arrangent votre organisation :</p>
      <ul>
        <li>« Je peux vous recevoir mardi à 10 h ou jeudi à 14 h, quel créneau vous convient le mieux ? »</li>
        <li>Utilisez le silence après votre proposition pour laisser le client choisir.</li>
        <li>Si les deux options sont refusées, demandez ses contraintes et proposez une troisième alternative stratégique.</li>
      </ul>

      <h2>3. Le rituel de clôture professionnelle</h2>
      <p>La fin de l'appel est aussi cruciale que le début. Elle doit servir à graver l'engagement dans l'esprit du client. Avant de raccrocher, validez systématiquement les trois piliers du rendez-vous : la date, l'heure précise et le nom du collaborateur qui réalisera la prestation.</p>
      <p>Terminez par une phrase de bienvenue qui valorise la visite à venir : « Nous sommes ravis de vous recevoir mardi prochain, excellente journée à vous, Mme Koné. » Personnaliser le nom du client à la fin de l'appel augmente le taux de présence de 30 %.</p>
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
        question: "Un client appelle pendant que vous êtes en prestation, que faites-vous ?", 
        options: ["Vous ignorez l'appel", "Vous décrochez et prenez le rendez-vous vite", "Vous vous excusez et proposez de rappeler"], 
        correctAnswer: 2, 
        explanation: "L'expert gère ses priorités. On décroche pour ne pas perdre le client, mais on écourte poliment pour respecter la personne sur le fauteuil." 
      },
      { 
        question: "Quelle information est la plus critique lors d'un rendez-vous ?", 
        options: ["Le nom, la prestation et le numéro", "La couleur de ses yeux", "La marque de sa voiture"], 
        correctAnswer: 0, 
        explanation: "Ces trois piliers permettent de préparer le poste, de confirmer le créneau et de relancer en cas de besoin." 
      }
    ],
    exercises: ["Pratiquer la signature vocale lors des 10 prochains appels.", "Noter le nombre d'appels transformés en rendez-vous."],
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
      <p>Le diagnostic est le moment le plus rentable de votre journée, pourtant c'est celui que beaucoup négligent par manque de temps. L'erreur fatale est de parler au client à travers le miroir alors qu'il est déjà installé. Dans cette position, vous n'êtes qu'un exécutant.</p>
      <blockquote>« Pour être respecté comme un expert, vous devez regarder le client dans les yeux, pas son reflet. »</blockquote>
      <p>La règle d'or de Go'Top Pro est de s'asseoir à hauteur du client, face à lui, avant même de toucher ses cheveux. Ce contact visuel direct crée un contrat de confiance. À cet instant, vous ne vendez pas une coiffure, vous vendez votre regard d'expert.</p>

      <h2>2. L'art de l'interrogatoire stratégique</h2>
      <p>Un bon diagnostic ne commence pas par des affirmations, mais par des questions ouvertes. Vous devez comprendre non seulement ce que le client veut, mais surtout ce qu'il vit au quotidien avec ses cheveux.</p>
      <p>Voici les trois questions que chaque expert doit poser :</p>
      <ul>
        <li>« Quel est le temps maximum que vous accordez à vos cheveux le matin ? » (Éviter de proposer un style impossible à entretenir).</li>
        <li>« Quelles sont les trois choses que vous aimeriez changer dans votre image actuelle ? » (Identifier les points de douleur).</li>
        <li>« Quels produits utilisez-vous actuellement à la maison ? » (Préparer la vente additionnelle).</li>
      </ul>

      <h2>3. La prescription : transformer le besoin en désir</h2>
      <p>Une fois l'analyse terminée, ne donnez pas un prix, donnez une solution. Utilisez un vocabulaire de prestige. Ne dites pas « je vais faire un soin », dites « je préconise un rituel de restructuration pour redonner de l'éclat à votre fibre capillaire ». </p>
      <p>Concluez toujours par un engagement mutuel : « Pour obtenir le résultat que nous venons de définir, voici le plan d'action pour aujourd'hui. » Cette méthode place le client dans une position d'attente positive et justifie des tarifs plus élevés.</p>
    `,
    coach_tip: "Écoutez deux fois plus que vous ne parlez pendant le diagnostic.",
    strategic_mantra: "Le client n'achète pas vos outils, il achète votre regard d'expert.",
    quiz_questions: [
      { 
        question: "Quelle est la meilleure position pour un diagnostic ?", 
        options: ["Debout derrière le client", "Assis à sa hauteur", "Au bac à shampoing"], 
        correctAnswer: 1, 
        explanation: "Se mettre à la hauteur du client humanise l'échange et renforce votre statut de conseiller." 
      },
      { 
        question: "Que signifie analyser le style de vie du client ?", 
        options: ["Savoir s'il a une voiture", "Connaître le temps qu'il a le matin", "Demander son métier"], 
        correctAnswer: 1, 
        explanation: "Inutile de proposer une coiffure complexe à quelqu'un qui n'a que 5 minutes pour se préparer chaque jour." 
      },
      { 
        question: "Comment présenter une prestation technique coûteuse ?", 
        options: ["En annonçant le prix d'abord", "En parlant du résultat et du bénéfice", "En disant que c'est la mode"], 
        correctAnswer: 1, 
        explanation: "Le client accepte le prix quand il comprend la valeur et le changement positif que cela lui apportera." 
      }
    ],
    exercises: ["Réaliser 3 diagnostics en étant assis face au client.", "Identifier le type de cheveu avant de toucher."],
    tips: ["Observez la forme du visage et la texture du cheveu."]
  },
  {
    id: "mod_hygiene",
    topic: "Hygiène",
    title: "Propreté irréprochable : le standard luxe",
    description: "L'hygiène est votre meilleur argument de vente. Apprenez à en faire un rituel visible par vos clients.",
    mini_course: "Un salon propre est un salon qui respecte ses clients et qui peut facturer plus cher.",
    price: 500,
    aiCredits: 2,
    lesson_content: `
      <h2>1. La désinfection visible : le marketing de la santé</h2>
      <p>Dans un monde où la sécurité sanitaire est devenue une priorité, la propreté de votre salon n'est plus un détail de gestion, c'est votre argument de vente numéro un. L'erreur classique est de nettoyer le salon quand il n'y a personne.</p>
      <blockquote>« Ce que le client ne voit pas n'existe pas dans son esprit. »</blockquote>
      <p>L'expert Go'Top Pro désinfecte ses outils (ciseaux, peignes, tondeuses) <strong>devant le client</strong>. Ce geste de 10 secondes justifie à lui seul une hausse de vos tarifs. Il prouve que vous respectez le corps de votre cliente autant que son style.</p>

      <h2>2. Le bac à shampoing : le sanctuaire du luxe</h2>
      <p>Le bac est l'endroit où le client passe le plus de temps en position de vulnérabilité. C'est ici que l'image de votre salon se joue. Un bac avec des traces de produits séchés ou une serviette humide qui traîne brise instantanément l'expérience de luxe.</p>
      <p>Instaurez un protocole rigoureux après chaque passage :</p>
      <ul>
        <li>Nettoyage immédiat de la cuvette et du repose-nuque avec un produit désinfectant odorant.</li>
        <li>Rangement des bouteilles de produits par taille, étiquettes face au client.</li>
        <li>Vérification de l'absence totale de cheveux sur le sol autour de la zone de détente.</li>
      </ul>

      <h2>3. La psychologie des textiles et de l'air</h2>
      <p>L'odorat est le sens le plus lié à la mémoire. Une serviette qui sent le linge frais crée une émotion positive instantanée. Ne laissez jamais une serviette utilisée sur un fauteuil, même pour une minute. L'ordre visuel doit être parfait.</p>
      <p>L'excellence se niche dans l'air que l'on respire. Aérez votre salon toutes les deux heures pour chasser les odeurs de produits chimiques et utilisez un parfum d'ambiance léger et signature. C'est cette atmosphère qui transforme un simple service en une expérience inoubliable.</p>
    `,
    coach_tip: "Un bac à shampoing mal nettoyé fait fuir les meilleurs clients définitivement.",
    strategic_mantra: "L'excellence commence par un peigne sans cheveux.",
    quiz_questions: [
      { 
        question: "Quand faut-il nettoyer ses outils ?", 
        options: ["Le soir après la fermeture", "Une fois par semaine", "Devant chaque client"], 
        correctAnswer: 2, 
        explanation: "La visibilité de l'hygiène est un acte de marketing puissant qui justifie vos prix." 
      },
      { 
        question: "À quelle fréquence faut-il balayer les cheveux au sol ?", 
        options: ["Toutes les heures", "Dès que le client se lève", "À la pause déjeuner"], 
        correctAnswer: 1, 
        explanation: "Voir les cheveux des autres au sol casse l'image de luxe et de propreté du salon." 
      },
      { 
        question: "Pourquoi l'odeur des textiles est-elle importante ?", 
        options: ["Pour masquer les odeurs de produits", "Pour créer une expérience de luxe", "Ce n'est pas important"], 
        correctAnswer: 1, 
        explanation: "L'odorat est lié à l'émotion. Une serviette qui sent le frais crée un souvenir positif immédiat." 
      }
    ],
    exercises: ["Mettre en place une fiche de contrôle hygiène quotidienne.", "Vérifier l'état des peignoirs toutes les 2 heures."],
    tips: ["Changez de serviette après chaque client, sans exception."]
  },
  {
    id: "mod_retail",
    topic: "Vente",
    title: "Vente de produits : conseiller comme un expert",
    description: "Apprenez à vendre les produits de votre boutique pour augmenter vos revenus sans temps de travail supplémentaire.",
    mini_course: "Si votre client achète son shampoing au supermarché, vous perdez de l'argent.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. La prescription post-salon : une responsabilité morale</h2>
      <p>Beaucoup de coiffeurs ont peur de vendre, car ils pensent « forcer » le client. C'est une erreur de vision. Votre mission est de garantir que le travail que vous avez réalisé sur le fauteuil durera plusieurs semaines. Sans les bons produits à domicile, votre talent s'évapore au premier shampoing.</p>
      <blockquote>« Ne pas vendre le produit adapté, c'est laisser votre cliente saboter votre travail. »</blockquote>
      <p>L'expert ne vend pas, il prescrit. À la fin de chaque séance, présentez les trois produits indispensables : le nettoyant spécifique, le soin profond et le protecteur de finition. C'est le « kit de survie » de la beauté que vous offrez à votre cliente.</p>

      <h2>2. L'architecture du regard : le merchandising magnétique</h2>
      <p>Vos produits ne doivent pas simplement « être là ». Ils doivent raconter une histoire de transformation. La disposition de votre espace boutique obéit à des règles psychologiques précises :</p>
      <ul>
        <li>La règle des 160 cm : Placez vos meilleures ventes à hauteur des yeux du client moyen.</li>
        <li>Le groupement par bénéfice : Rangez vos produits par besoin (volume, éclat, hydratation) et non par marque. Le client doit se reconnaître dans l'étiquette.</li>
        <li>L'étiquetage d'autorité : Chaque prix doit être clair et accompagné d'une courte promesse manuscrite.</li>
      </ul>

      <h2>3. L'éducation par la manipulation</h2>
      <p>La vente commence au bac à shampoing, pas à la caisse. Expliquez chaque texture que vous posez sur ses cheveux. Faites-lui sentir le parfum, décrivez la sensation du produit entre vos doigts. Le client doit tester le bénéfice en temps réel.</p>
      <p>En impliquant les sens du client pendant la prestation, vous le préparez naturellement à l'achat final. La transition vers la vente devient une simple conclusion logique de l'expérience vécue dans votre salon. C'est ainsi que l'on bâtit une boutique rentable sans jamais paraître insistant.</p>
    `,
    coach_tip: "Vos bacs à shampoing sont votre meilleure salle d'exposition de produits.",
    strategic_mantra: "Vendre un produit, c'est prendre soin du client jusque dans sa douche.",
    quiz_questions: [
      { 
        question: "Quand faut-il parler des produits ?", 
        options: ["À la caisse", "Pendant toute la prestation", "Uniquement si on demande"], 
        correctAnswer: 1, 
        explanation: "L'éducation du client se fait par étapes pendant qu'il teste le produit entre vos mains." 
      },
      { 
        question: "Pourquoi le client doit-il acheter chez vous ?", 
        options: ["Pour vous aider", "Pour garantir son résultat technique", "Parce que c'est moins cher"], 
        correctAnswer: 1, 
        explanation: "Seul l'expert peut garantir que la couleur ou la coupe durera avec les produits adaptés." 
      },
      { 
        question: "Où placer les produits prioritaires ?", 
        options: ["En bas des étagères", "À hauteur des yeux", "Dans la réserve"], 
        correctAnswer: 1, 
        explanation: "Le merchandising suit le regard du client. Ce qui est visible est ce qui est vendu." 
      }
    ],
    exercises: ["Vendre au moins un produit à 3 clientes consécutives.", "Nettoyer et réorganiser l'espace boutique."],
    tips: ["Faites sentir les textures et les parfums."]
  },
  {
    id: "mod_pricing",
    topic: "Finance",
    title: "Tarification stratégique : valoriser son talent",
    description: "Apprenez à fixer vos prix non pas en fonction de la concurrence, mais de votre valeur réelle et de vos charges.",
    mini_course: "Un tarif trop bas est un signal de manque de confiance qui attire les mauvais clients.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. La fin du tarif au hasard</h2>
      <p>La majorité des salons fixent leurs prix en regardant ce que fait le voisin. C'est une stratégie de survie, pas de développement. Vos prix doivent être le reflet de vos charges réelles et du niveau d'excellence que vous offrez.</p>
      <blockquote>« Si vous ne valorisez pas votre temps, personne ne le fera pour vous. »</blockquote>
      <p>L'expert Go'Top Pro calcule son coût à la minute. Chaque fauteuil vide est une perte sèche. Augmenter ses tarifs de 10 % sans changer son volume de clients peut transformer une année difficile en une année record.</p>

      <h2>2. La hiérarchie du prestige</h2>
      <p>Créez des paliers de prix. Ne proposez pas un prix unique pour une tresse ou un brushing. Segmentez votre offre par niveau de difficulté ou par "Signature de l'expert". Cela permet de guider le client vers des options à plus forte marge.</p>

      <h2>3. Communiquer l'augmentation</h2>
      <p>Une augmentation de tarif ne se justifie pas par l'inflation, mais par l'amélioration constante de votre service. Apprenez à annoncer vos nouveaux prix avec fierté en mettant en avant les nouvelles formations suivies par votre équipe.</p>
    `,
    coach_tip: "Votre talent n'est pas négociable.",
    strategic_mantra: "Mieux vaut moins de clients qui paient le juste prix que trop de clients à perte.",
    quiz_questions: [
      { question: "Pourquoi fixer ses prix sur le voisin est-il risqué ?", options: ["On peut se tromper", "Ses charges ne sont pas les vôtres", "C'est de l'espionnage"], correctAnswer: 1, explanation: "Chaque salon a sa structure de coût unique." },
      { question: "Quel est le but d'une tarification segmentée ?", options: ["Perdre des clients", "Augmenter la marge", "Simplifier la caisse"], correctAnswer: 1, explanation: "La segmentation permet de proposer de la valeur ajoutée payante." },
      { question: "Quand augmenter ses prix ?", options: ["Tous les mois", "Quand la qualité s'améliore", "À Noël uniquement"], correctAnswer: 1, explanation: "L'amélioration du service justifie naturellement la hausse de valeur." }
    ],
    exercises: ["Calculer le coût à la minute de votre salon.", "Identifier 2 prestations à augmenter immédiatement."],
    tips: ["Affichez vos prix clairement mais avec élégance."]
  },
  {
    id: "mod_management",
    topic: "Management",
    title: "Leadership et motivation d'équipe",
    description: "Transformez vos collaborateurs en partenaires engagés pour le succès de votre enseigne.",
    mini_course: "Une équipe qui sourit est une équipe qui vend.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. Le gérant-pilote : donner le cap</h2>
      <p>Un salon performant ne repose pas sur les mains du patron, mais sur l'autonomie de son équipe. Le rôle du gérant d'élite est de définir des standards clairs et de s'assurer qu'ils sont respectés même en son absence.</p>
      <blockquote>« Le leadership, c'est l'art d'inspirer les autres à donner le meilleur d'eux-mêmes. »</blockquote>
      <p>Mettez en place des réunions hebdomadaires de 15 minutes pour partager les objectifs de la semaine. La clarté de la vision réduit le stress et augmente l'efficacité.</p>
    `,
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
    description: "Il coûte 5 fois plus cher d'acquérir un nouveau client que d'en garder un. Maîtrisez le client.",
    mini_course: "Un client fidèle est votre meilleur ambassadeur gratuit.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. L'expérience mémorable</h2>
      <p>La fidélité ne s'achète pas avec des cartes de réduction, elle se gagne par l'émotion. Chaque visite doit être une parenthèse de bien-être unique.</p>
    `,
    coach_tip: "Le petit café offert vaut plus que 10% de remise.",
    strategic_mantra: "Le client revient pour ce qu'il a ressenti, pas seulement pour sa coupe.",
    quiz_questions: [],
    exercises: [],
    tips: []
  },
  {
    id: "mod_digital",
    topic: "Marketing",
    title: "Marketing Digital : attirer les meilleurs clients",
    description: "Utilisez Instagram et WhatsApp pour remplir votre agenda chaque matin.",
    mini_course: "Votre vitrine n'est plus dans la rue, elle est dans la poche de vos clientes.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>1. Le pouvoir de l'image</h2>
      <p>Apprenez à photographier vos réalisations. Une belle lumière et un angle précis font toute la différence sur les réseaux sociaux.</p>
    `,
    coach_tip: "Postez une photo par jour, à l'heure du déjeuner.",
    strategic_mantra: "Si on ne vous voit pas, vous n'existez pas.",
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
    lesson_content: `<h2>1. La technique magistrale du massage crânien</h2><p>Le client ne vient pas seulement se laver les cheveux, il vient chercher un moment de déconnexion. Maîtrisez les points de pression.</p>`,
    coach_tip: "Ne parlez pas pendant le massage, laissez le client savourer.",
    strategic_mantra: "Un shampoing bâclé est une expérience ratée.",
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
    lesson_content: `<h2>1. La roue chromatique appliquée</h2><p>Comprendre les pigments sous-jacents pour neutraliser les reflets indésirables.</p>`,
    coach_tip: "Pesez toujours vos mélanges sur une balance électronique.",
    strategic_mantra: "La précision technique évite les rattrapages gratuits.",
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
    lesson_content: `<h2>1. Analyse morphologique</h2><p>Visage ovale, rond, carré : à chaque forme sa géométrie de coupe.</p>`,
    coach_tip: "Utilisez le miroir pour valider l'équilibre de la coupe sous tous les angles.",
    strategic_mantra: "L'harmonie visuelle est le but ultime de l'expert.",
    quiz_questions: [],
    exercises: [],
    tips: []
  },
  {
    id: "mod_planning",
    topic: "Management",
    title: "Organisation du Planning : gagner du temps",
    description: "Optimisez chaque minute de votre journée pour maximiser votre chiffre d'affaires.",
    mini_course: "Le temps est votre seule ressource limitée.",
    price: 500,
    aiCredits: 2,
    lesson_content: `<h2>1. Le séquençage des tâches</h2><p>Comment chevaucher deux prestations intelligemment sans faire attendre le client.</p>`,
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
    description: "Apprenez à lire entre les lignes pour satisfaire les désirs cachés de vos clients.",
    mini_course: "On coiffe une personne, pas seulement des cheveux.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. L'écoute active augmentée</h2><p>Décoder le langage corporel pour adapter son discours de vente.</p>`,
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
    description: "Comment transformer votre salon de quartier en une adresse incontournable pour les élites.",
    mini_course: "Le luxe se niche dans les détails invisibles.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. Les codes de l'hospitalité de luxe</h2><p>Du peignoir en soie à la boisson signature.</p>`,
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
    description: "Ne gérez plus au doigt mouillé. Apprenez à lire votre bilan comme un expert comptable.",
    mini_course: "Les chiffres ne mentent jamais.",
    price: 500,
    aiCredits: 3,
    lesson_content: `<h2>1. Les indicateurs clés de performance (KPI)</h2><p>Ticket moyen, taux de revente, productivité horaire.</p>`,
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
    description: "Sortez de l'informel pour accéder aux crédits bancaires et aux partenariats.",
    mini_course: "Un salon formel est un salon pérenne.",
    price: 500,
    aiCredits: 2,
    lesson_content: `<h2>1. La structure juridique et fiscale</h2><p>Comprendre l'intérêt de la formalisation en Côte d'Ivoire.</p>`,
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
  { id: 1, text: "Votre équipe est-elle formée aux techniques d'un bon accueil téléphonique ?", category: "Accueil", linkedModuleId: "mod_accueil_tel" },
  { id: 2, text: "L'équipe s'entraîne-t-elle à faire un bon diagnostic avant chaque prestation ?", category: "Technique", linkedModuleId: "mod_diagnostic" },
  { id: 3, text: "Les protocoles d'hygiène sont-ils affichés et respectés scrupuleusement par tous ?", category: "Hygiène", linkedModuleId: "mod_hygiene" },
  { id: 10, text: "Votre taux de revente de produits représente-t-il plus de 15 % de votre chiffre d'affaires ?", category: "Vente", linkedModuleId: "mod_retail" },
  { id: 5, text: "Maîtrisez-vous votre coût à la minute pour chaque prestation ?", category: "Finance", linkedModuleId: "mod_pricing" }
];
