
import { TrainingModule, Badge, ModuleStatus } from './types';

export const COACH_KITA_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80";
export const SUPER_ADMIN_PHONE_NUMBER = "+2250001020304";

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
      <section class="lesson-card">
        <h2>I. La signature vocale</h2>
        <p>Un expert ne répond jamais par un simple « Allô ». La formule qui rassure est : <strong>« Salon [Nom], [Votre prénom] à votre écoute, bonjour »</strong>. Le débit doit être lent, la voix posée et le sourire s'entendre. C'est ici que commence la valeur perçue de votre travail.</p>
      </section>
      <section class="lesson-card">
        <h2>II. La prise de rendez-vous active</h2>
        <p>Ne subissez pas l'agenda. Au lieu de demander « C'est pour quand ? », proposez : <strong>« Je peux vous recevoir mardi à 10h ou jeudi à 14h, quel créneau vous convient le mieux ? »</strong>. Diriger le client vers vos heures creuses est la clé d'un planning rentable.</p>
      </section>
      <section class="lesson-card">
        <h2>III. La clôture professionnelle</h2>
        <p>Avant de raccrocher, validez toujours les trois piliers : la date, l'heure et le nom du collaborateur. Finissez par une phrase de bienvenue : « Nous sommes ravis de vous recevoir mardi prochain, excellente journée à vous ».</p>
      </section>`,
    coach_tip: "Souriez en parlant, votre client l'entendra à travers le téléphone.",
    strategic_mantra: "Un appel raté est un client qui part chez le voisin.",
    quiz_questions: [{ question: "Quelle est la phrase d'accueil idéale ?", options: ["Allô ?", "Salon [Nom], [Prénom] à votre écoute, bonjour", "Oui c'est pour quoi ?"], correctAnswer: 1, explanation: "Cette formule établit immédiatement votre autorité professionnelle." }],
    exercises: ["Pratiquer la signature vocale sur les 10 prochains appels.", "Noter le nombre d'appels transformés en rendez-vous."],
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
      <section class="lesson-card">
        <h2>I. La posture de l'expert</h2>
        <p>Ne parlez jamais à votre client à travers le miroir pour un diagnostic. Asseyez-vous à sa hauteur, face à lui. Le contact visuel direct crée un lien de confiance immédiat. C'est à ce moment que vous passez du statut d'exécutant à celui de <strong>conseiller expert</strong>.</p>
      </section>
      <section class="lesson-card">
        <h2>II. L'analyse morphologique et technique</h2>
        <p>Observez trois points essentiels : la forme du visage, la texture naturelle du cheveu et le style de vie du client. Posez des questions ouvertes : « Comment entretenez-vous vos cheveux au quotidien ? » ou « Quelle image souhaitez-vous projeter ? ».</p>
      </section>
      <section class="lesson-card">
        <h2>III. La proposition de valeur</h2>
        <p>Ne proposez pas un prix, proposez un résultat. Utilisez des mots forts : <strong>« éclat », « restructuration », « harmonie »</strong>. Concluez toujours par une recommandation précise incluant une prestation technique et un soin profond.</p>
      </section>`,
    coach_tip: "Écoutez deux fois plus que vous ne parlez pendant le diagnostic.",
    strategic_mantra: "Le client n'achète pas vos outils, il achète votre regard d'expert.",
    quiz_questions: [{ question: "Quelle est la meilleure position pour un diagnostic ?", options: ["Debout derrière le client", "Assis à sa hauteur", "Au bac à shampoing"], correctAnswer: 1, explanation: "Le contact visuel direct à la même hauteur crée la confiance." }],
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
      <section class="lesson-card">
        <h2>I. La désinfection visible</h2>
        <p>La propreté ne doit pas seulement exister, elle doit être vue. Nettoyez vos ciseaux, peignes et tondeuses devant le client avec un spray antibactérien. Cela justifie vos tarifs et rassure instantanément sur votre professionnalisme.</p>
      </section>
      <section class="lesson-card">
        <h2>II. L'organisation du bac à shampoing</h2>
        <p>Le bac est le lieu de détente par excellence. Rien n'est plus décevant qu'un bac sale ou encombré. Nettoyez le fauteuil et le repose-nuque après chaque passage. Rangez vos bouteilles de produits par taille et par fonction.</p>
      </section>
      <section class="lesson-card">
        <h2>III. Le rituel des textiles</h2>
        <p>Chaque client doit bénéficier d'une serviette et d'un peignoir parfaitement propres et pliés. L'odeur du linge propre participe à l'expérience sensorielle de luxe. Ne laissez jamais de cheveux traîner au sol pendant une prestation.</p>
      </section>`,
    coach_tip: "Un bac à shampoing mal nettoyé fait fuir les meilleurs clients définitivement.",
    strategic_mantra: "L'excellence commence par un peigne sans cheveux.",
    quiz_questions: [{ question: "Quand faut-il nettoyer ses outils ?", options: ["Le soir après la fermeture", "Une fois par semaine", "Devant chaque client"], correctAnswer: 2, explanation: "La visibilité de la propreté rassure immédiatement le client." }],
    exercises: ["Mettre en place une fiche de contrôle hygiène quotidienne.", "Vérifier l'état des peignoirs toutes les 2 heures."],
    tips: ["Changez de serviette après chaque client, sans exception."]
  },
  {
    id: "mod_stock",
    topic: "Gestion",
    title: "Gestion des stocks : éviter les pertes",
    description: "Ne laissez plus votre argent dormir sur les étagères. Apprenez à commander juste ce qu'il faut.",
    mini_course: "Un tube de couleur périmé, c'est un billet de banque que vous jetez.",
    price: 500,
    aiCredits: 2,
    lesson_content: `
      <section class="lesson-card">
        <h2>I. L'inventaire tournant</h2>
        <p>N'attendez pas la fin de l'année pour compter. Mettez en place un inventaire hebdomadaire des produits les plus vendus (shampoings, soins, couleurs). Cela permet d'identifier les vols, les oublis de facturation et les surconsommations.</p>
      </section>
      <section class="lesson-card">
        <h2>II. Le seuil de rupture et d'alerte</h2>
        <p>Définissez un nombre minimal pour chaque produit (ex: 3 tubes de noir). Dès que ce seuil est atteint, la commande doit être déclenchée. Cela évite les urgences coûteuses et les prestations refusées par manque de produits.</p>
      </section>
      <section class="lesson-card">
        <h2>III. La pesée systématique</h2>
        <p>Le plus grand gaspillage se trouve dans le bol de préparation. Apprenez à votre équipe à peser chaque mélange au gramme près. Le surplus jeté en fin de journée peut représenter jusqu'à 10 % de votre bénéfice annuel.</p>
      </section>`,
    coach_tip: "Pesez vos bols de préparation. Le surplus jeté tue votre bénéfice.",
    strategic_mantra: "Vos étagères sont des comptes bancaires de produits.",
    quiz_questions: [{ question: "Quelle est la fréquence idéale d'inventaire ?", options: ["Tous les mois", "Toutes les semaines", "Une fois par an"], correctAnswer: 1, explanation: "Un suivi hebdomadaire permet de réagir avant la rupture." }],
    exercises: ["Créer un cahier de suivi des entrées et sorties de produits.", "Peser systématiquement 5 bols de couleur aujourd'hui."],
    tips: ["Utilisez les produits les plus anciens en premier."]
  },
  {
    id: "mod_social_media",
    topic: "Visibilité",
    title: "Réseaux sociaux : attirer de nouveaux clients",
    description: "Maîtrisez Facebook, Instagram et TikTok pour remplir votre salon sans payer de publicité.",
    mini_course: "Votre page est le premier salon que vos clients visitent virtuellement.",
    price: 500,
    aiCredits: 4,
    lesson_content: `
      <section class="lesson-card">
        <h2>I. L'algorithme et la régularité</h2>
        <p>La clé du succès sur les réseaux n'est pas la perfection, mais la régularité. Publiez une fois par jour à la même heure. L'algorithme favorise les comptes qui maintiennent l'attention de leur audience quotidiennement.</p>
      </section>
      <section class="lesson-card">
        <h2>II. La photo avant/après stratégique</h2>
        <p>Prenez vos photos avec une lumière naturelle. Le fond doit être neutre. Cadrez serré sur le travail technique. L'impact visuel d'un changement radical est l'élément qui déclenche le plus de partages et de prises de rendez-vous.</p>
      </section>
      <section class="lesson-card">
        <h2>III. L'interaction et le service client</h2>
        <p>Un commentaire sans réponse est une vente perdue. Répondez à chaque question dans l'heure. Utilisez des appels à l'action clairs : « Cliquez sur le lien dans la bio pour réserver votre place ».</p>
      </section>`,
    coach_tip: "Une vidéo « avant/après » réussie vaut plus que mille mots.",
    strategic_mantra: "Si vous n'êtes pas sur leur téléphone, vous n'existez pas.",
    quiz_questions: [{ question: "Où prendre la meilleure photo au salon ?", options: ["Sous les néons jaunes", "Face à la lumière du jour", "Avec le flash dans le noir"], correctAnswer: 1, explanation: "La lumière du jour respecte les reflets de votre travail." }],
    exercises: ["Publier une vidéo « avant/après » cette semaine.", "Répondre à tous les commentaires en retard."],
    tips: ["Répondez à chaque commentaire poliment."]
  },
  {
    id: "mod_fidelisation",
    topic: "Vente",
    title: "Fidélisation : faire revenir vos clients",
    description: "Apprenez à utiliser votre carnet client pour que vos clientes reviennent 8 fois par an au lieu de 4.",
    mini_course: "Garder un client coûte 5 fois moins cher qu'en trouver un nouveau.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <section class="lesson-card">
        <h2>I. Le carnet client numérique</h2>
        <p>Chaque visite doit être enregistrée : date, prestation, produits utilisés et préférences personnelles (ex: aime son thé bien chaud). Cette connaissance intime du client permet de personnaliser chaque visite future et de créer un attachement émotionnel.</p>
      </section>
      <section class="lesson-card">
        <h2>II. La pré-réservation systématique</h2>
        <p>Ne demandez jamais « Quand nous revoyons-nous ? ». Dites plutôt : <strong>« Pour maintenir la brillance de votre couleur, nous devons nous revoir dans 6 semaines, je vous bloque le mardi 12 ? »</strong>. C'est la base de la fidélité.</p>
      </section>
      <section class="lesson-card">
        <h2>III. La relance des inactifs</h2>
        <p>Identifiez les clients qui ne sont pas revenus depuis plus de 3 mois. Envoyez-leur un message de courtoisie personnalisé : « Bonjour [Nom], vos cheveux nous manquent... ». Un simple rappel réactive souvent 20 % de votre base perdue.</p>
      </section>`,
    coach_tip: "Notez les préférences de vos clientes. Se souvenir de son thé préféré crée l'émotion.",
    strategic_mantra: "Un client fidèle est votre meilleur ambassadeur.",
    quiz_questions: [{ question: "Quand faut-il relancer un client absent ?", options: ["Après 1 mois", "Après 3 mois", "Après 1 an"], correctAnswer: 1, explanation: "C'est le cycle moyen de renouvellement des prestations techniques." }],
    exercises: ["Envoyer 10 messages de relance personnalisés cette semaine.", "Proposer la pré-réservation à chaque client demain."],
    tips: ["Proposez le prochain rendez-vous dès la fin de la prestation actuelle."]
  },
  {
    id: "mod_management",
    topic: "Direction",
    title: "Direction d'équipe : motiver ses collaborateurs",
    description: "Passez du rôle de patron à celui de leader. Apprenez à inspirer votre équipe pour qu'elle produise plus.",
    mini_course: "Votre équipe traitera vos clients comme vous traitez votre équipe.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <section class="lesson-card">
        <h2>I. Le briefing matinal de 5 minutes</h2>
        <p>Avant l'ouverture, rassemblez l'équipe. Rappelez les objectifs de la journée, vérifiez les rendez-vous importants et donnez une dose d'énergie positive. Un salon bien dirigé commence par une équipe alignée dès le matin.</p>
      </section>
      <section class="lesson-card">
        <h2>II. La culture du feedback constructif</h2>
        <p>Ne critiquez pas en public. Utilisez la règle du <strong>« féliciter en public, recadrer en privé »</strong>. Les entretiens individuels mensuels sont indispensables pour comprendre les motivations de chacun et éviter les démissions surprises.</p>
      </section>
      <section class="lesson-card">
        <h2>III. La délégation et l'autonomie</h2>
        <p>Un bon leader ne fait pas tout. Apprenez à confier des responsabilités (stocks, réseaux sociaux, hygiène) à vos collaborateurs. L'autonomie augmente la motivation et vous libère du temps pour piloter la croissance.</p>
      </section>`,
    coach_tip: "Félicitez vos employés devant tout le monde, recadrez-les en tête-à-tête.",
    strategic_mantra: "Seul on va vite, ensemble on construit un empire.",
    quiz_questions: [{ question: "Quel est le meilleur moment pour motiver son équipe ?", options: ["Le soir en partant", "Le matin avant le premier client", "Pendant la pause déjeuner"], correctAnswer: 1, explanation: "Le matin lance l'énergie positive pour toute la journée." }],
    exercises: ["Organiser un entretien de 15 minutes avec chaque employé cette semaine.", "Déléguer une tâche de gestion aujourd'hui."],
    tips: ["Écoutez les idées de vos collaborateurs."]
  },
  {
    id: "mod_tarification",
    topic: "Gestion",
    title: "Tarification : calculer sa rentabilité à la minute",
    description: "Apprenez à calculer vos prix en fonction de vos charges réelles, pas en fonction du voisin.",
    mini_course: "Le chiffre d'affaires flatte l'ego, le bénéfice nourrit la famille.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <section class="lesson-card">
        <h2>I. Le coût minute du fauteuil</h2>
        <p>Additionnez toutes vos charges fixes (loyer, électricité, salaires, internet) et divisez-les par le nombre de minutes travaillées. Vous obtiendrez votre coût minute. C'est le prix que vous payez pour simplement exister chaque minute.</p>
      </section>
      <section class="lesson-card">
        <h2>II. La marge bénéficiaire réelle</h2>
        <p>Votre prix de vente doit couvrir le coût minute, le coût des produits utilisés et votre marge bénéficiaire (minimum 20 %). Si votre tarif est inférieur à ce calcul, vous travaillez à perte sans le savoir.</p>
      </section>
      <section class="lesson-card">
        <h2>III. La psychologie du prix juste</h2>
        <p>Ne vous excusez jamais de vos prix. Si vous apportez de l'expertise, de l'hygiène et du service, le client acceptera de payer le juste prix. Un tarif trop bas envoie un signal de mauvaise qualité.</p>
      </section>`,
    coach_tip: "Si vous bradez vos prix, vous bradez votre talent et votre avenir.",
    strategic_mantra: "On ne gère bien que ce que l'on mesure.",
    quiz_questions: [{ question: "Comment fixer un nouveau prix ?", options: ["Regarder les prix du quartier", "Calculer ses charges plus sa marge", "Demander l'avis des clients"], correctAnswer: 1, explanation: "C'est la seule méthode mathématique qui garantit votre salaire." }],
    exercises: ["Calculer le coût total de fonctionnement du salon par heure.", "Vérifier la marge sur votre prestation la plus vendue."],
    tips: ["Affichez vos prix clairement à l'entrée."]
  },
  {
    id: "mod_upselling",
    topic: "Vente",
    title: "Vente additionnelle : augmenter le panier moyen",
    description: "Apprenez à proposer systématiquement le soin ou le massage dont votre client a besoin.",
    mini_course: "Proposer n'est pas forcer. C'est apporter une solution complète au client.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <section class="lesson-card">
        <h2>I. La technique de la préconisation</h2>
        <p>Au lieu de demander « Voulez-vous un soin ? », utilisez une phrase d'expert : <strong>« Pour protéger vos mèches et maintenir cet éclat, je préconise l'application d'un rituel profond aujourd'hui »</strong>. Vous ne vendez pas, vous soignez.</p>
      </section>
      <section class="lesson-card">
        <h2>II. Le moment clé du bac à shampoing</h2>
        <p>C'est l'endroit où le client est le plus détendu et donc le plus ouvert à vos conseils. Profitez du massage crânien pour expliquer les bienfaits du soin que vous appliquez. C'est ici que 80 % des ventes additionnelles se réalisent.</p>
      </section>
      <section class="lesson-card">
        <h2>III. Gérer le refus avec élégance</h2>
        <p>Si le client refuse, ne le vivez pas comme un échec. Notez-le dans son carnet client et revenez-y la prochaine fois. Un « non » aujourd'hui est souvent un « oui » à la prochaine visite si le besoin persiste.</p>
      </section>`,
    coach_tip: "Un soin offert au bac aujourd'hui est une vente de soin garantie pour demain.",
    strategic_mantra: "Le meilleur moment pour proposer est quand le client est détendu au bac.",
    quiz_questions: [{ question: "Quelle phrase fait vendre le mieux ?", options: ["Vous voulez un soin ?", "Pour vos pointes abîmées, je préconise ce rituel", "Rien d'autre ?"], correctAnswer: 1, explanation: "L'expert préconise une solution au lieu de poser une question fermée." }],
    exercises: ["Réussir 5 ventes de services additionnels en une journée.", "Apprendre 3 phrases d'introduction de soins."],
    tips: ["Expliquez toujours le bénéfice pour le client."]
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
      <section class="lesson-card">
        <h2>I. La prescription post-salon</h2>
        <p>Votre travail ne s'arrête pas quand le client quitte le fauteuil. Il doit pouvoir entretenir son style chez lui. Présentez les 3 produits indispensables à la fin de la séance : le shampoing adapté, le soin et le produit de finition.</p>
      </section>
      <section class="lesson-card">
        <h2>II. Le merchandising attractif</h2>
        <p>Vos produits ne doivent pas prendre la poussière. Disposez-les à hauteur des yeux, avec des étiquettes de prix claires et des descriptions de bénéfices. Changez la mise en avant chaque mois pour créer de la nouveauté.</p>
      </section>
      <section class="lesson-card">
        <h2>III. L'éducation pendant le service</h2>
        <p>Expliquez chaque produit que vous utilisez pendant que vous le manipulez. « Je mets ce sérum pour éviter les frisottis dus à l'humidité ». Le client teste ainsi le produit en temps réel et comprend son utilité avant même de passer à la caisse.</p>
      </section>`,
    coach_tip: "Vos bacs à shampoing sont votre meilleure salle d'exposition de produits.",
    strategic_mantra: "Vendre un produit, c'est prendre soin du client jusque dans sa douche.",
    quiz_questions: [{ question: "Quand faut-il parler des produits ?", options: ["À la caisse au moment de payer", "Pendant toute la prestation", "Uniquement si le client demande"], correctAnswer: 1, explanation: "L'éducation du client se fait par étape pendant qu'il teste le produit." }],
    exercises: ["Vendre au moins un produit à 3 clientes consécutives.", "Nettoyer et réorganiser l'espace boutique."],
    tips: ["Faites sentir les textures et les parfums."]
  },
  {
    id: "mod_ergonomie",
    topic: "Organisation",
    title: "Organisation du salon : efficacité maximale",
    description: "Gagnez du temps et fatiguez-vous moins en organisant votre poste de travail comme un cockpit d'avion.",
    mini_course: "Chaque pas inutile est une seconde de profit perdue.",
    price: 500,
    aiCredits: 2,
    lesson_content: `
      <section class="lesson-card">
        <h2>I. Le rayon d'action de 60 centimètres</h2>
        <p>Vos outils les plus utilisés (ciseaux, peignes, brosses, tondeuse) doivent être accessibles dans un rayon de 60 cm autour de votre poste. Vous ne devez pas avoir à faire un pas pour les saisir. Moins de déplacements signifie moins de fatigue en fin de journée.</p>
      </section>
      <section class="lesson-card">
        <h2>II. L'organisation par zones de travail</h2>
        <p>Séparez clairement l'espace technique (coloration), l'espace coupe et l'espace détente. Chaque zone doit disposer de son propre matériel. Évitez les allers-retours incessants à la réserve qui cassent le rythme de votre prestation.</p>
      </section>
      <section class="lesson-card">
        <h2>III. La maintenance préventive</h2>
        <p>Un outil défaillant est un outil dangereux et lent. Affûtez vos ciseaux régulièrement, nettoyez les filtres de vos séchoirs et huilez vos tondeuses tous les soirs. Un matériel impeccable est la marque d'un salon de haut niveau.</p>
      </section>`,
    coach_tip: "Un poste de travail bien rangé réduit votre stress et celui de votre client.",
    strategic_mantra: "Moins vous bougez vos pieds, plus vos mains produisent de la valeur.",
    quiz_questions: [{ question: "Où doivent être vos outils principaux ?", options: ["Sur une étagère au fond", "Dans un rayon de 60 cm autour de vous", "Dans le placard fermé"], correctAnswer: 1, explanation: "C'est la zone d'efficacité maximale pour éviter la fatigue." }],
    exercises: ["Réorganiser sa desserte de travail pour ne plus avoir à se déplacer inutilement.", "Nettoyer les filtres de tous les séchoirs aujourd'hui."],
    tips: ["Utilisez des dessertes à roulettes de qualité."]
  },
  {
    id: "mod_image_pro",
    topic: "Image",
    title: "Image professionnelle : incarner la réussite",
    description: "Votre apparence et celle de votre équipe déterminent la valeur de vos tarifs aux yeux du client.",
    mini_course: "On ne peut pas vendre de l'élégance en portant des vêtements négligés.",
    price: 500,
    aiCredits: 2,
    lesson_content: `
      <section class="lesson-card">
        <h2>I. L'uniforme du succès</h2>
        <p>Une tenue harmonieuse pour toute l'équipe renforce instantanément votre autorité. Choisissez un code couleur ou un uniforme sobre et élégant. Cela évite les fautes de goût et envoie un signal fort de cohésion et de sérieux.</p>
      </section>
      <section class="lesson-card">
        <h2>II. La communication non verbale</h2>
        <p>Le sourire, le regard et la posture droite sont vos premiers outils de vente. Apprenez à votre équipe à se tenir droite et à marcher avec assurance. Votre langage corporel doit respirer la confiance et l'hospitalité.</p>
      </section>
      <section class="lesson-card">
        <h2>III. Les détails qui font la différence</h2>
        <p>Vérifiez quotidiennement les détails : chaussures propres, maquillage ou barbe soignés, badge avec prénom. Le client vous confie son image, vous devez donc être l'exemple parfait de ce que vous vendez.</p>
      </section>`,
    coach_tip: "Regardez vos chaussures. Les clientes les remarquent quand elles sont allongées au bac.",
    strategic_mantra: "Vous êtes votre première publicité.",
    quiz_questions: [{ question: "Pourquoi imposer un code vestimentaire ?", options: ["Pour faire joli", "Pour justifier des tarifs haut de gamme", "Parce que c'est la règle"], correctAnswer: 1, explanation: "L'image de l'équipe fixe la valeur perçue de la prestation." }],
    exercises: ["Définir une tenue commune (couleur ou uniforme) pour tout le salon.", "Inspecter les badges de l'équipe demain matin."],
    tips: ["Portez un badge avec votre prénom."]
  },
  {
    id: "mod_tresorerie",
    topic: "Gestion",
    title: "Mouvements de caisse : ne plus jamais être à sec",
    description: "Apprenez à gérer vos entrées et sorties d'argent au quotidien pour anticiper vos factures.",
    mini_course: "L'argent de la caisse n'est pas votre argent de poche personnel.",
    price: 500,
    aiCredits: 2,
    lesson_content: `
      <section class="lesson-card">
        <h2>I. La clôture de caisse quotidienne</h2>
        <p>Chaque soir, faites le point exact entre l'argent encaissé (espèces, cartes, chèques) et les prestations enregistrées. Les écarts de caisse, même petits, sont souvent le signe de problèmes de gestion plus profonds.</p>
      </section>
      <section class="lesson-card">
        <h2>II. Les provisions pour charges</h2>
        <p>Mettez de côté chaque jour une part de votre chiffre d'affaires pour payer vos factures à venir (loyer, taxes, produits). Séparez physiquement cet argent pour ne pas avoir de mauvaises surprises en fin de mois.</p>
      </section>
      <section class="lesson-card">
        <h2>III. Le contrôle des dépenses courantes</h2>
        <p>Chaque sortie d'argent de la caisse (pour acheter du café, du papier, etc.) doit être justifiée par un ticket et notée. Les petits frais accumulés sans contrôle peuvent détruire votre bénéfice mensuel.</p>
      </section>`,
    coach_tip: "Mettez de côté votre loyer et vos taxes un peu chaque jour.",
    strategic_mantra: "La caisse est le cœur du salon, si elle s'arrête, tout s'arrête.",
    quiz_questions: [{ question: "Que faire de la recette du jour ?", options: ["Payer ses courses personnelles", "La déposer sur le compte professionnel du salon", "La garder dans le tiroir sans compter"], correctAnswer: 1, explanation: "La rigueur bancaire est le début de la richesse." }],
    exercises: ["Vérifier le solde de sa caisse chaque matin avant l'ouverture.", "Mettre en place un tableau de bord des charges."],
    tips: ["Utilisez un petit cahier de caisse pour chaque dépense, même minime."]
  },
  {
    id: "mod_litiges",
    topic: "Relation client",
    title: "Clients difficiles : transformer un problème en succès",
    description: "Apprenez à gérer les réclamations et les mécontentements avec le sourire et professionnalisme.",
    mini_course: "Une plainte bien gérée crée un client fidèle pour la vie.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <section class="lesson-card">
        <h2>I. L'écoute active et l'empathie</h2>
        <p>Face à une réclamation, restez calme. Ne cherchez pas à vous justifier immédiatement. Écoutez le client sans l'interrompre. Utilisez des phrases comme : « Je comprends votre déception et je suis là pour trouver une solution ».</p>
      </section>
      <section class="lesson-card">
        <h2>II. La solution commerciale immédiate</h2>
        <p>Ne laissez jamais un client mécontent partir sans solution. Proposez de reprendre la prestation gratuitement ou offrez un service lors de la prochaine visite. Le coût de ce geste est dérisoire par rapport à l'impact négatif d'un mauvais avis.</p>
      </section>
      <section class="lesson-card">
        <h2>III. L'analyse post-litige</h2>
        <p>Une fois le calme revenu, analysez pourquoi le problème est survenu. S'agit-il d'un manque de technique, d'un mauvais diagnostic ou d'un malentendu ? Transformez chaque litige en une leçon pour améliorer vos procédures de salon.</p>
      </section>`,
    coach_tip: "Un client qui se plaint est un client qui vous donne une chance de vous améliorer.",
    strategic_mantra: "Le client mécontent veut surtout être entendu.",
    quiz_questions: [{ question: "Quelle est la première chose à faire face à une réclamation ?", options: ["Expliquer pourquoi il a tort", "Écouter en restant calme", "Lui demander de partir"], correctAnswer: 1, explanation: "L'écoute active désamorce 80 % des conflits." }],
    exercises: ["S'entraîner à répondre calmement à une critique imaginaire.", "Répertorier les 3 dernières plaintes et trouver une solution préventive."],
    tips: ["Cherchez toujours une solution « gagnant-gagnant »."]
  },
  {
    id: "mod_booking",
    topic: "Visibilité",
    title: "Réservation en ligne : le salon ouvert 24h/24",
    description: "Mettez en place la prise de rendez-vous automatique pour ne plus rater d'appels quand vous travaillez.",
    mini_course: "Beaucoup de clientes veulent réserver le soir quand vous dormez.",
    price: 500,
    aiCredits: 2,
    lesson_content: `
      <section class="lesson-card">
        <h2>I. L'accessibilité permanente</h2>
        <p>La plupart de vos clients sont occupés pendant vos heures d'ouverture. En offrant la réservation en ligne, vous permettez aux gens de prendre rendez-vous le soir ou le week-end depuis leur canapé. C'est un gain de temps pour vous et un confort pour eux.</p>
      </section>
      <section class="lesson-card">
        <h2>II. Les rappels de rendez-vous automatiques</h2>
        <p>L'un des plus grands fléaux des salons est le « rendez-vous oublié ». Un système de réservation automatique envoie un message ou un mail de rappel 24h avant. Cela réduit les rendez-vous manqués de plus de 50 %.</p>
      </section>
      <section class="lesson-card">
        <h2>III. La gestion optimisée de l'agenda</h2>
        <p>Le logiciel de réservation calcule automatiquement les durées des prestations techniques et de coupe. Cela évite les chevauchements impossibles et permet d'optimiser chaque minute de travail de vos collaborateurs.</p>
      </section>`,
    coach_tip: "Un rappel automatique par message réduit les rendez-vous oubliés de 70 %.",
    strategic_mantra: "Gagnez du temps pour ce qui compte : la beauté.",
    quiz_questions: [{ question: "Pourquoi automatiser ses rendez-vous ?", options: ["Pour faire moderne", "Pour ne plus rater de clients le soir", "Pour ne plus parler aux gens"], correctAnswer: 1, explanation: "Cela permet de capter les clients au moment où ils y pensent, même la nuit." }],
    exercises: ["Tester un lien de réservation simple sur son profil WhatsApp.", "Calculer le temps moyen perdu par les clients absents."],
    tips: ["Mettez votre lien de réservation sur Facebook."]
  },
  {
    id: "mod_parrainage",
    topic: "Vente",
    title: "Cercle de recommandation : le bouche-à-oreille",
    description: "Transformez vos clientes actuelles en une équipe de vente qui vous ramène leurs amies.",
    mini_course: "Vos meilleures clientes connaissent vos futurs meilleures clientes.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <section class="lesson-card">
        <h2>I. La mécanique du parrainage</h2>
        <p>Mettez en place une offre claire : « Ramenez une amie et bénéficiez toutes les deux de 20 % de remise sur votre prochain soin ». Le parrainage est l'outil le plus puissant pour attirer des clients qui vous ressemblent.</p>
      </section>
      <section class="lesson-card">
        <h2>II. Quand et comment proposer ?</h2>
        <p>Ne proposez pas au moment de payer. Le meilleur moment est quand le client se regarde dans le miroir à la fin de la prestation et exprime sa satisfaction. Dites : <strong>« Si vous êtes contente de votre look, n'hésitez pas à partager l'adresse avec vos amies »</strong>.</p>
      </section>
      <section class="lesson-card">
        <h2>III. Le suivi et la récompense</h2>
        <p>Remerciez systématiquement chaque parrain. Un petit mot manuscrit ou un message personnalisé renforce le lien. La reconnaissance est souvent plus motivante que la remise financière elle-même.</p>
      </section>`,
    coach_tip: "Le parrainage fonctionne mieux quand la récompense est un service de beauté plutôt que de l'argent.",
    strategic_mantra: "Le bouche-à-oreille se cultive avec générosité.",
    quiz_questions: [{ question: "À qui proposer de parrainer ?", options: ["À tout le monde sans distinction", "Uniquement à vos clientes les plus satisfaites", "À personne, c'est gênant"], correctAnswer: 1, explanation: "Vos clients satisfaits sont les seuls capables de bien vous vendre." }],
    exercises: ["Lancer son offre de parrainage cette semaine.", "Identifier 5 clients ambassadeurs."],
    tips: ["Remerciez toujours chaleureusement la personne qui vous a recommandé."]
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
    id: "dedicated",
    name: "Maître du salon",
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
  { id: 5, text: "Publiez-vous régulièrement (au moins 3 fois par semaine) sur vos réseaux sociaux ?", category: "Visibilité", linkedModuleId: "mod_social_media" },
  { id: 6, text: "Utilisez-vous un fichier client pour relancer ceux qui ne sont plus venus depuis 3 mois ?", category: "Vente", linkedModuleId: "mod_fidelisation" },
  { id: 7, text: "Réalisez-vous des entretiens individuels de motivation avec vos employés chaque mois ?", category: "Direction", linkedModuleId: "mod_management" },
  { id: 8, text: "Connaissez-vous précisément votre coût à la minute pour fixer vos tarifs ?", category: "Gestion", linkedModuleId: "mod_tarification" },
  { id: 9, text: "Proposez-vous systématiquement un service additionnel (soin, massage) à chaque client ?", category: "Vente", linkedModuleId: "mod_upselling" },
  { id: 10, text: "Votre taux de revente de produits représente-t-il plus de 15 % de votre chiffre d'affaires ?", category: "Vente", linkedModuleId: "mod_retail" },
  { id: 11, text: "L'organisation de vos postes de travail est-elle optimisée pour éviter les pas inutiles ?", category: "Organisation", linkedModuleId: "mod_ergonomie" },
  { id: 12, text: "L'équipe porte-t-elle une tenue professionnelle harmonieuse reflétant l'image du salon ?", category: "Image", linkedModuleId: "mod_image_pro" },
  { id: 13, text: "Suivez-vous quotidiennement vos entrées/sorties d'argent sur un tableau de bord ?", category: "Gestion", linkedModuleId: "mod_tresorerie" },
  { id: 14, text: "Avez-vous une procédure écrite pour gérer calmement les réclamations clients ?", category: "Relation client", linkedModuleId: "mod_litiges" },
  { id: 15, text: "Vos clients peuvent-ils réserver leur prestation en ligne 24h/24 et 7j/7 ?", category: "Visibilité", linkedModuleId: "mod_booking" },
  { id: 16, text: "Avez-vous un système de parrainage actif pour attirer de nouveaux clients ?", category: "Vente", linkedModuleId: "mod_parrainage" }
];
