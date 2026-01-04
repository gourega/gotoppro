
import { TrainingModule, Badge, ModuleStatus } from './types';

export const COACH_KITA_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80";
export const SUPER_ADMIN_PHONE_NUMBER = "+2250001020304";

export const TRAINING_CATALOG: TrainingModule[] = [
  {
    id: "mod_accueil_tel",
    topic: "Accueil",
    title: "L'art de l'accueil téléphonique",
    description: "Le premier contact est le moment où vous gagnez ou perdez un client. Apprenez le protocole d'élite.",
    mini_course: "Votre téléphone est votre première caisse enregistreuse.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>I. Le Protocole des 3 Sonneries</h2>
      <p>La réactivité est la preuve de votre respect. Décrochez toujours avant la 3ème sonnerie. Votre phrase d'accueil doit être standardisée : "Salon [Nom], [Votre Prénom] à votre écoute, bonjour".</p>
      <h2>II. Le Sourire Vocal</h2>
      <p>Le client ne vous voit pas, mais il vous "ressent". Le sourire modifie physiquement la résonance de votre voix. Articulez et validez régulièrement par des "Très bien", "Je comprends" pour montrer que vous êtes 100% centré sur lui.</p>
      <h2>III. Conclusion & Orientation</h2>
      <p><strong>Conseil Stratégique :</strong> Ne demandez jamais "Quand voulez-vous venir ?". Proposez toujours deux alternatives : "Préférez-vous mardi matin ou jeudi après-midi ?". C'est vous qui maîtrisez l'agenda, pas l'imprévu.</p>
    `,
    coach_tip: "Installe un petit miroir devant le téléphone pour te voir sourire en parlant.",
    strategic_mantra: "Un appel perdu est un client chez la concurrence.",
    quiz_questions: [{ question: "Quelle est la règle d'or du décroché ?", options: ["Après 5 sonneries", "Avant la 3ème sonnerie", "Quand le salon est vide"], correctAnswer: 1, explanation: "La rapidité est le premier signe de professionnalisme." }],
    exercises: ["Enregistrer sa phrase d'accueil et s'écouter."],
    tips: ["Souriez physiquement."]
  },
  {
    id: "mod_diagnostic",
    topic: "Vente",
    title: "Le Diagnostic Technique Expert",
    description: "Arrêtez d'exécuter, commencez à conseiller. Le diagnostic est la clé du panier moyen.",
    mini_course: "90% du montant du service se joue avant de toucher les cheveux.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>I. L'Écoute Active</h2>
      <p>Le diagnostic n'est pas une formalité, c'est un moment stratégique. Utilisez des questions ouvertes : "Comment trouvez-vous vos cheveux en ce moment ?" au lieu de "On fait quoi aujourd'hui ?".</p>
      <h2>II. La Reformulation Professionnelle</h2>
      <p>Preuve d'écoute ultime : répétez avec vos mots ce que le client a exprimé. "Si j'ai bien compris, vous souhaitez apporter de la brillance tout en gardant du volume...". Cela crée un climat de confiance totale.</p>
      <h2>III. Conclusion & Orientation</h2>
      <p><strong>Conseil Stratégique :</strong> Interdiction de toucher les cheveux avant d'avoir validé le projet avec le client. Votre expertise technique doit servir une solution, pas juste une envie passagère.</p>
    `,
    coach_tip: "Asseyez-vous à la hauteur du client pour le diagnostic, ne restez pas debout derrière lui.",
    strategic_mantra: "Le client achète votre solution, pas seulement votre temps.",
    quiz_questions: [{ question: "Pourquoi reformuler ?", options: ["Pour perdre du temps", "Pour valider le besoin et rassurer", "Pour paraître savant"], correctAnswer: 1, explanation: "La reformulation évite les déceptions et sécurise la vente." }],
    exercises: ["Pratiquer 3 diagnostics sans toucher les cheveux pendant 5 min."],
    tips: ["Notez les préférences sur la fiche client."]
  },
  {
    id: "mod_hygiene",
    topic: "Hygiène",
    title: "Protocoles d'Hygiène & Sécurité",
    description: "La propreté n'est pas une option, c'est votre meilleur argument marketing.",
    mini_course: "Faites de la rigueur sanitaire votre signature.",
    price: 500,
    aiCredits: 2,
    lesson_content: `
      <h2>I. L'Hygiène Visible</h2>
      <p>Le sol doit être balayé après chaque client. Les miroirs et tablettes doivent être impeccables. Si le client voit un cheveu traîner, il doute de tout votre professionnalisme.</p>
      <h2>II. La Mise en Scène de la Sécurité</h2>
      <p>Désinfectez vos outils (peignes, ciseaux) devant le client ou utilisez des sachets de stérilisation. Le bac doit être rincé et essuyé après CHAQUE utilisation.</p>
      <h2>III. Conclusion & Orientation</h2>
      <p><strong>Conseil Stratégique :</strong> La propreté est le premier critère de recommandation silencieux. Un client ne vous dira pas que c'est sale par pudeur, il ne reviendra simplement jamais.</p>
    `,
    coach_tip: "Laisse une lingette désinfectante bien en vue sur chaque poste de travail.",
    strategic_mantra: "Un salon sale est un salon qui meurt.",
    quiz_questions: [{ question: "Quand faut-il balayer le sol ?", options: ["Le soir", "Après chaque client", "Toutes les heures"], correctAnswer: 1, explanation: "La propreté doit être constante pour rassurer le client suivant." }],
    exercises: ["Créer une check-list de nettoyage horaire par collaborateur."],
    tips: ["Videz les poubelles régulièrement."]
  },
  {
    id: "mod_ergonomie",
    topic: "Organisation",
    title: "Ergonomie & Gain de temps",
    description: "Travaillez mieux, pas plus. Optimisez chaque geste pour augmenter votre rentabilité.",
    mini_course: "L'organisation est la mère de la rapidité.",
    price: 500,
    aiCredits: 2,
    lesson_content: `
      <h2>I. L'Organisation des Postes</h2>
      <p>Chaque outil doit avoir une place précise. Le désordre génère du stress et fait perdre des minutes précieuses à chaque prestation. Multiplié par 10 clients, c'est une heure perdue par jour.</p>
      <h2>II. La Gestion des Déplacements</h2>
      <p>Optimisez le trajet entre le bac et le poste. Préparez tout votre matériel avant que le client ne s'assoie. Moins vous marchez inutilement, plus vous gagnez d'argent.</p>
      <h2>III. Conclusion & Orientation</h2>
      <p><strong>Conseil Stratégique :</strong> Considérez votre poste de travail comme un cockpit d'avion. Tout doit être à portée de main. Une minute gagnée par client, c'est un rendez-vous supplémentaire possible en fin de journée.</p>
    `,
    coach_tip: "Range ton matériel après chaque client, ne laisse jamais le poste encombré.",
    strategic_mantra: "L'ordre est le premier pas vers la richesse.",
    quiz_questions: [{ question: "Pourquoi ranger systématiquement ?", options: ["Pour faire beau", "Pour gagner du temps et de l'argent", "Pour le patron"], correctAnswer: 1, explanation: "L'efficacité opérationnelle commence par le rangement." }],
    exercises: ["Chronométrer une préparation de couleur et essayer de gagner 2 minutes."],
    tips: ["Ayez des bacs de rangement étiquetés."]
  },
  {
    id: "mod_social_media",
    topic: "Digital",
    title: "Social Media : Rayonner sur Instagram & Facebook",
    description: "Si vous n'êtes pas sur le téléphone de vos clients, vous n'existez pas.",
    mini_course: "Attirez de nouveaux clients grâce au pouvoir de l'image.",
    price: 500,
    aiCredits: 5,
    lesson_content: `
      <h2>I. La Qualité Avant Tout</h2>
      <p>La lumière est votre meilleure amie. Investissez dans un anneau lumineux (Ring Light). Photographiez vos réalisations dans un coin dédié et propre. Le fond doit être neutre.</p>
      <h2>II. Le Pouvoir du 'Avant/Après'</h2>
      <p>C'est la preuve ultime de votre talent. Postez régulièrement (3 fois par semaine minimum). Racontez l'histoire de la transformation : quel était le problème du client et comment vous l'avez résolu.</p>
      <h2>III. Conclusion & Orientation</h2>
      <p><strong>Conseil Stratégique :</strong> Ne postez pas pour les autres coiffeurs, postez pour vos clients. Utilisez des mots simples et montrez que vous comprenez leurs besoins quotidiens.</p>
    `,
    coach_tip: "Demande toujours l'autorisation à ta cliente avant de poster sa photo, elle se sentira valorisée.",
    strategic_mantra: "Votre vitrine digitale est plus importante que votre vitrine physique.",
    quiz_questions: [{ question: "Quelle fréquence de post minimale ?", options: ["1 par mois", "3 par semaine", "Quand j'ai le temps"], correctAnswer: 1, explanation: "La régularité est la clé pour être favorisé par les algorithmes." }],
    exercises: ["Prendre 3 photos 'Avant/Après' avec une bonne lumière aujourd'hui."],
    tips: ["Utilisez des hashtags de votre ville/quartier."]
  },
  {
    id: "mod_management",
    topic: "Management",
    title: "Le Leader Inspirant : Piloter son équipe",
    description: "On ne gère pas des employés, on mène des talents vers un objectif commun.",
    mini_course: "Votre équipe est le reflet de votre leadership.",
    price: 500,
    aiCredits: 4,
    lesson_content: `
      <h2>I. La Communication Régulière</h2>
      <p>Organisez des réunions courtes (15 min) le matin pour donner le mot d'ordre du jour. Célébrez les succès de la veille. Une équipe informée est une équipe engagée.</p>
      <h2>II. Les Entretiens Individuels</h2>
      <p>Prenez le temps une fois par mois de parler en tête-à-tête avec chaque collaborateur. Écoutez ses difficultés et fixez des objectifs clairs. Ne recadrez jamais devant un client.</p>
      <h2>III. Conclusion & Orientation</h2>
      <p><strong>Conseil Stratégique :</strong> Soyez exemplaire. Si vous demandez la ponctualité, soyez le premier arrivé. Votre autorité vient de votre rigueur et de votre bienveillance, pas de vos cris.</p>
    `,
    coach_tip: "Remercie chaque employé pour un travail spécifique avant qu'il ne quitte le salon le soir.",
    strategic_mantra: "Une équipe motivée décuple le chiffre d'affaires sans effort.",
    quiz_questions: [{ question: "Où faire un recadrage ?", options: ["Devant le client", "En réunion d'équipe", "Dans un lieu neutre et privé"], correctAnswer: 2, explanation: "Le respect de l'intimité du collaborateur est crucial pour maintenir sa motivation." }],
    exercises: ["Faire un compliment sincère à chaque employé aujourd'hui."],
    tips: ["Déléguez une responsabilité par personne."]
  },
  {
    id: "mod_tarification",
    topic: "Gestion",
    title: "Prix & Rentabilité : Ne plus brader son talent",
    description: "Apprenez à calculer vos tarifs pour dégager un vrai salaire et investir.",
    mini_course: "Le prix est la valeur que vous donnez à votre expertise.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>I. Connaître son Coût à la Minute</h2>
      <p>Additionnez toutes vos charges (loyer, électricité, salaires, produits). Divisez par le nombre de minutes travaillées. Si une coupe vous coûte 3000 FCFA et que vous la vendez 2500, vous perdez de l'argent.</p>
      <h2>II. Le Positionnement Stratégique</h2>
      <p>Ne fixez pas vos prix en fonction du salon d'en face. Fixez-les en fonction de la qualité de votre service, de votre confort et de vos résultats. Soyez fier de vos tarifs élevés s'ils sont justifiés.</p>
      <h2>III. Conclusion & Orientation</h2>
      <p><strong>Conseil Stratégique :</strong> Un prix bas attire les clients opportunistes. Un prix juste attire les clients fidèles. Si vous êtes plein, c'est que vos prix sont trop bas : augmentez-les de 10%.</p>
    `,
    coach_tip: "Affiche tes tarifs clairement, l'absence de prix génère la peur de payer chez le client.",
    strategic_mantra: "Vendre à perte, c'est financer le luxe de vos clients avec votre propre vie.",
    quiz_questions: [{ question: "Faut-il baisser les prix en période de crise ?", options: ["Oui pour garder les clients", "Non, valoriser le service et la fidélité", "Faire des promotions permanentes"], correctAnswer: 1, explanation: "Baisser les prix dégrade durablement votre image de marque." }],
    exercises: ["Calculer le coût réel d'une prestation de couleur (produit + temps)."],
    tips: ["Revoyez vos prix une fois par an."]
  },
  {
    id: "mod_tresorerie",
    topic: "Gestion",
    title: "Maîtrise de la Trésorerie : L'oxygène du salon",
    description: "Suivez votre argent au jour le jour pour ne jamais être pris de court.",
    mini_course: "Le pilotage financier est votre tableau de bord de survie.",
    price: 500,
    aiCredits: 4,
    lesson_content: `
      <h2>I. Le Suivi Quotidien</h2>
      <p>Notez chaque centime qui entre et qui sort. Utilisez un cahier ou un tableau de bord. La différence entre le chiffre d'affaires et le bénéfice est la base de la richesse.</p>
      <h2>II. Anticiper les Charges</h2>
      <p>Mettez de côté chaque jour une petite somme pour vos charges futures (taxes, loyer, salaires). Ne dépensez jamais l'argent des taxes, il ne vous appartient pas.</p>
      <h2>III. Conclusion & Orientation</h2>
      <p><strong>Conseil Stratégique :</strong> Gardez toujours 3 mois de charges d'avance sur un compte séparé. C'est votre "matelas de sécurité" pour dormir tranquille et rester serein face aux imprévus.</p>
    `,
    coach_tip: "Ouvre un compte Wave ou bancaire uniquement pour les économies du salon.",
    strategic_mantra: "Le CA est une vanité, le bénéfice est une réalité, le cash est le roi.",
    quiz_questions: [{ question: "Qu'est-ce que le cash-flow ?", options: ["Le montant des factures", "L'argent réellement disponible en caisse", "Les dettes clients"], correctAnswer: 1, explanation: "Le cash-flow est l'argent liquide qui permet de payer les factures aujourd'hui." }],
    exercises: ["Lister toutes les charges fixes du mois prochain dès maintenant."],
    tips: ["Payez vos fournisseurs à temps."]
  }
  // Les autres modules suivent la même structure experte...
];

export const BADGES: Badge[] = [
  {
    id: "first_module",
    name: "Premier pas",
    icon: "🚀",
    description: "Premier module terminé.",
    condition: (u, mods) => mods.some(m => m.status === ModuleStatus.COMPLETED)
  },
  {
    id: "dedicated",
    name: "Déterminé",
    icon: "🏆",
    description: "5 modules terminés.",
    condition: (u, mods) => mods.filter(m => m.status === ModuleStatus.COMPLETED).length >= 5
  }
];

export const DIAGNOSTIC_QUESTIONS = [
  { id: 1, text: "Votre équipe est-elle formée aux techniques d'un bon accueil téléphonique ?", category: "Accueil", linkedModuleId: "mod_accueil_tel" },
  { id: 2, text: "L'équipe s'entraîne-t-elle à faire un bon diagnostic avant chaque prestation ?", category: "Technique", linkedModuleId: "mod_diagnostic" },
  { id: 3, text: "Les protocoles d'hygiène sont-ils affichés et respectés scrupuleusement par tous ?", category: "Hygiène", linkedModuleId: "mod_hygiene" },
  { id: 4, text: "Avez-vous un inventaire à jour chaque semaine pour éviter les ruptures de stock ?", category: "Gestion", linkedModuleId: "mod_stock" },
  { id: 5, text: "Publiez-vous régulièrement (au moins 3 fois par semaine) on vos réseaux sociaux ?", category: "Digital", linkedModuleId: "mod_social_media" },
  { id: 6, text: "Utilisez-vous un fichier client pour relancer ceux qui ne sont plus venus depuis 3 mois ?", category: "Vente", linkedModuleId: "mod_fidelisation" },
  { id: 7, text: "Réalisez-vous des entretiens individuels de motivation avec vos employés chaque mois ?", category: "Management", linkedModuleId: "mod_management" },
  { id: 8, text: "Connaissez-vous précisément votre coût à la minute pour fixer vos tarifs ?", category: "Gestion", linkedModuleId: "mod_tarification" },
  { id: 9, text: "Proposez-vous systématiquement un service additionnel (soin, massage) à chaque client ?", category: "Vente", linkedModuleId: "mod_upselling" },
  { id: 10, text: "Votre taux de revente de produits représente-t-elle plus de 15% de votre chiffre d'affaires ?", category: "Vente", linkedModuleId: "mod_retail" },
  { id: 11, text: "L'organisation de vos postes de travail est-elle optimisée pour éviter les pas inutiles ?", category: "Organisation", linkedModuleId: "mod_ergonomie" },
  { id: 12, text: "L'équipe porte-t-elle une tenue professionnelle harmonieuse reflétant l'image du salon ?", category: "Image", linkedModuleId: "mod_image_pro" },
  { id: 13, text: "Suivez-vous quotidiennement vos entrées/sorties d'argent sur un tableau de bord ?", category: "Gestion", linkedModuleId: "mod_tresorerie" },
  { id: 14, text: "Avez-vous une procédure écrite pour gérer calmement les réclamations clients ?", category: "Accueil", linkedModuleId: "mod_litiges" },
  { id: 15, text: "Vos clients peuvent-ils réserver leur prestation en ligne 24h/24 et 7j/7 ?", category: "Digital", linkedModuleId: "mod_booking" },
  { id: 16, text: "Avez-vous mis en place un système de parrainage actif pour attirer de nouveaux clients ?", category: "Vente", linkedModuleId: "mod_parrainage" }
];
