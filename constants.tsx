
import { TrainingModule, Badge, ModuleStatus } from './types';

export const COACH_KITA_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80";
export const SUPER_ADMIN_PHONE_NUMBER = "+2250001020304";

export const TRAINING_CATALOG: TrainingModule[] = [
  {
    id: "mod_accueil_tel",
    topic: "Accueil",
    title: "L'art de l'accueil téléphonique d'élite",
    description: "Le premier contact est le moment où vous gagnez ou perdez un client. Apprenez le protocole des salons de luxe.",
    mini_course: "Votre téléphone n'est pas un outil de communication, c'est votre première caisse enregistreuse.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <section>
        <h2>I. La Psychologie de la Voix au Téléphone</h2>
        <p>Dans l'univers du luxe, l'expérience commence au moment précis où le client compose votre numéro. Au téléphone, 100% de votre image repose sur votre voix. Sans le support visuel de votre salon ou de votre tenue, votre interlocuteur analyse inconsciemment votre professionnalisme à travers votre débit, votre ton et votre dynamisme.</p>
        <p>Un accueil hésitant ou trop familier dégrade immédiatement la valeur perçue de vos futures prestations techniques. Vous devez incarner la sérénité et l'expertise dès la première seconde.</p>
      </section>

      <section>
        <h2>II. Le Protocole de la Signature Sonore</h2>
        <p>Un expert ne répond jamais par un simple "Allô". Votre réponse doit être une signature institutionnelle. La structure recommandée par les plus grandes enseignes est : <strong>"Salon [Nom], [Votre Prénom] à votre écoute, bonjour"</strong>.</p>
        <p>Cette phrase remplit trois objectifs : elle identifie le lieu, elle humanise le contact par le prénom, et elle établit une posture de service par le mot "écoute". La règle d'or est la réactivité : au-delà de trois sonneries, le client commence à développer un sentiment d'abandon. Répondre vite, c'est prouver au client qu'il est une priorité absolue.</p>
      </section>
      
      <section>
        <h2>III. Le Sourire Vocal : Une Technique Physique</h2>
        <p>C'est une loi de la communication : le sourire s'entend. Lorsque vous souriez, les muscles de votre visage se tendent, modifiant la forme de votre conduit vocal et rendant votre voix plus claire et plus chaleureuse.</p>
        <p>Un client qui entend un sourire au téléphone est psychologiquement plus enclin à accepter des tarifs premium car il se sent accueilli dans un environnement bienveillant et expert. C'est la différence entre une transaction et une relation.</p>
      </section>
      
      <section>
        <h2>IV. L'Art de la Maîtrise de l'Agenda</h2>
        <p>Ne soyez jamais passif face à la demande du client. Au lieu de demander "Quand voulez-vous venir ?", ce qui crée souvent une confusion et des pertes de temps, utilisez la technique de l'Alternative Directive.</p>
        <p>Proposez deux options précises qui arrangent votre rentabilité : "Madame Traoré, je peux vous recevoir mardi à 10h ou jeudi à 15h30. Laquelle de ces deux options convient le mieux à votre emploi du temps ?". Vous reprenez ainsi le contrôle de votre flux de travail tout en offrant un service structuré.</p>
      </section>
      
      <section>
        <h2>V. Conclusion et Réassurance</h2>
        <p>La fin de l'appel est aussi cruciale que le début. Reformulez toujours le rendez-vous pour éviter les "No-Shows" : "Parfait, c'est noté pour votre coloration experte ce jeudi à 15h30 avec moi-même. Nous avons hâte de vous recevoir au salon". Cette petite phrase verrouille psychologiquement l'engagement du client et valorise son choix.</p>
      </section>
    `,
    coach_tip: "Installe un petit miroir devant le téléphone. Si tu te vois sourire, ton client l'entendra. C'est magique.",
    strategic_mantra: "Un appel mal géré est un billet de banque que vous offrez gracieusement à votre concurrent.",
    quiz_questions: [{ question: "Quelle est la structure idéale de la phrase d'accueil ?", options: ["Allô, c'est pour quoi ?", "Salon [Nom], [Prénom] à votre écoute, bonjour", "Oui bonjour, on est ouvert"], correctAnswer: 1, explanation: "Cette formule établit immédiatement votre autorité et votre professionnalisme." }],
    exercises: ["S'enregistrer avec son téléphone et écouter si on entend le 'sourire' dans sa voix.", "Pratiquer la technique de l'alternative sur les 5 prochains appels."],
    tips: ["Restez calme même en période de forte affluence.", "Notez toujours le nom du client dès le début de l'appel."]
  },
  {
    id: "mod_diagnostic",
    topic: "Vente",
    title: "Le Diagnostic : De l'Exécutant au Consultant",
    description: "Arrêtez de simplement couper des cheveux. Devenez le consultant stratégique que vos clients recherchent.",
    mini_course: "Le diagnostic est le moment où vous transformez une simple coupe en une ordonnance de beauté.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <section>
        <h2>I. La Rupture de la Barrière Physique</h2>
        <p>Le plus grand péché du coiffeur traditionnel est de faire son diagnostic à travers le miroir, en restant debout derrière le client. Pour passer au niveau supérieur, vous devez briser cette barrière psychologique.</p>
        <p>Asseyez-vous ou accroupissez-vous pour que vos yeux soient au même niveau que ceux de votre client. Cette posture de proximité élimine le rapport de force et crée une connexion de confiance immédiate. Vous n'êtes plus celui qui exécute, vous êtes celui qui conseille.</p>
      </section>

      <section>
        <h2>II. La Maïeutique : L'Art du Questionnement</h2>
        <p>Le diagnostic n'est pas une présentation de catalogue, c'est une enquête. Remplacez le classique "On fait quoi aujourd'hui ?" par des questions à haute valeur ajoutée qui forcent la réflexion.</p>
        <p>Demandez : "Quelle image de vous-même souhaitez-vous projeter ?", ou "Si vous aviez une baguette magique, que changeriez-vous sur vos cheveux ?". Écoutez 80% du temps. Le client vous donne lui-même les arguments pour lui vendre les produits et soins dont il a réellement besoin.</p>
      </section>
      
      <section>
        <h2>III. Le Toucher Technique et l'Analyse Sensorielle</h2>
        <p>Pendant que vous parlez, touchez les cheveux. Analysez la porosité, la densité et l'élasticité. Commentez ce que vous faites avec un vocabulaire d'expert.</p>
        <p>Utilisez des phrases comme : "Je sens une légère porosité sur les pointes qui va nécessiter un apport en kératine spécifique". En verbalisant votre analyse technique, vous justifiez naturellement le prix de vos soins avant même de les proposer officiellement.</p>
      </section>
      
      <section>
        <h2>IV. La Proposition de Valeur Globale</h2>
        <p>Un diagnostic d'élite inclut toujours trois piliers : la technique (couleur/coupe), le soin en salon et la prescription à domicile. Ne proposez jamais un soin comme une option facultative.</p>
        <p>Présentez-le comme une étape indispensable à la réussite : "Pour obtenir ce blond froid sans sensibiliser votre fibre, nous allons intégrer le protocole de reconstruction profonde". Vous ne vendez pas un extra, vous garantissez un résultat.</p>
      </section>
      
      <section>
        <h2>V. La Validation et le Devis</h2>
        <p>Finissez toujours par une reformulation claire et l'annonce du tarif. L'anxiété du prix est le premier frein à la relaxation du client au bac à shampoing.</p>
        <p>En étant transparent dès le diagnostic, vous permettez au client de profiter pleinement de sa prestation sans stress financier caché. La clarté est la politesse des experts.</p>
      </section>
    `,
    coach_tip: "Si ton diagnostic dure moins de 10 minutes, tu n'as pas fait un diagnostic, tu as juste pris une commande.",
    strategic_mantra: "Le client n'achète pas vos outils, il achète votre cerveau et votre regard d'expert.",
    quiz_questions: [{ question: "Quelle est la meilleure posture pour un diagnostic ?", options: ["Debout derrière le client", "Assis à sa hauteur, face à lui", "En préparant sa couleur au labo"], correctAnswer: 1, explanation: "Le contact visuel à hauteur d'homme est le fondement de la confiance psychologique." }],
    exercises: ["Réaliser 3 diagnostics aujourd'hui sans toucher aux outils pendant les 10 premières minutes.", "Utiliser 3 mots techniques (porosité, kératine, reflets froids) avec chaque cliente."],
    tips: ["Utilisez des visuels ou un book pour valider les couleurs.", "Notez systématiquement le diagnostic sur la fiche client."]
  },
  {
    id: "mod_ergonomie",
    topic: "Organisation",
    title: "Le Cockpit de l'Expert : Ergonomie et Profit",
    description: "Apprenez à organiser votre espace pour réduire votre fatigue et augmenter votre vitesse d'exécution de 20%.",
    mini_course: "L'ergonomie est la science cachée derrière les salons les plus rentables du monde.",
    price: 500,
    aiCredits: 2,
    lesson_content: `
      <section>
        <h2>I. La Théorie du Rayon d'Action</h2>
        <p>Chaque pas que vous faites inutilement dans votre salon est une seconde de profit qui s'envole. Un poste de travail d'élite doit être pensé comme un cockpit d'avion de chasse.</p>
        <p>Tout ce dont vous avez besoin pour 90% de vos gestes techniques doit se trouver dans un rayon de 60 centimètres. Ciseaux, peignes, pinces et sprays doivent être accessibles sans que vous ayez à décentrer votre regard de la chevelure de votre client. L'immobilité des pieds est le secret de la rapidité des mains.</p>
      </section>

      <section>
        <h2>II. L'Ingénierie du Flux de Travail</h2>
        <p>Analysez votre parcours quotidien entre le poste de coiffage, le bac à shampoing et le laboratoire de coloration. L'objectif est de créer un flux circulaire fluide, sans croisement inutile.</p>
        <p>Préparez vos plateaux techniques AVANT l'arrivée du client. Un coiffeur qui doit quitter son client pour aller chercher une serviette brise l'expérience de luxe et donne une image d'amateurisme désorganisé. L'anticipation est la marque des grands professionnels.</p>
      </section>
      
      <section>
        <h2>III. La Protection de votre Capital Santé</h2>
        <p>Votre corps est votre premier outil de travail et votre principal actif financier. La fatigue physique est l'ennemie de la vente additionnelle.</p>
        <p>Utilisez systématiquement des tabourets à roulettes réglables et assurez-vous que le fauteuil du client est à la hauteur parfaite pour que vos coudes restent à un angle de 90 degrés. Travailler intelligemment, c'est s'assurer de pouvoir exercer son art avec passion pendant des décennies.</p>
      </section>
      
      <section>
        <h2>IV. L'Organisation Visuelle et Mentale</h2>
        <p>Le désordre sur un poste de travail crée du stress visuel pour le client et du stress mental pour vous. Adoptez la méthode rigoureuse du "Poste Net".</p>
        <p>À chaque étape de la prestation, rangez ce que vous n'utilisez plus. Un plan de travail épuré renforce votre image d'expert méticuleux et permet au client de se concentrer exclusivement sur votre conseil. Un esprit clair commence par un espace dégagé.</p>
      </section>
      
      <section>
        <h2>V. Conclusion : Le Temps comme Unité de Mesure</h2>
        <p>Gagner seulement 5 minutes par client grâce à une meilleure ergonomie, c'est pouvoir accueillir une cliente supplémentaire par jour sans effort supplémentaire.</p>
        <p>Sur une année, cette petite optimisation représente des centaines de milliers de francs de bénéfice net. L'organisation n'est pas un luxe, c'est la fondation de votre richesse future.</p>
      </section>
    `,
    coach_tip: "Fais une vidéo de toi en accéléré pendant une prestation. Tu seras choqué du nombre de mouvements inutiles que tu fais.",
    strategic_mantra: "Moins vous bougez vos pieds, plus vous faites travailler vos mains et votre rentabilité.",
    quiz_questions: [{ question: "Qu'est-ce que la zone de proximité ergonomique ?", options: ["Le rayon de 60cm autour de votre main", "La distance entre le bac et la caisse", "La surface totale du salon"], correctAnswer: 0, explanation: "C'est dans cette zone que vos outils principaux doivent rester pour maximiser votre efficacité." }],
    exercises: ["Réorganiser son tiroir principal pour n'y laisser que l'essentiel.", "Chronométrer le temps de préparation d'une couleur et essayer de le diviser par deux."],
    tips: ["Utilisez des dessertes mobiles si votre poste est fixe.", "Investissez dans de bons tapis anti-fatigue."]
  }
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
