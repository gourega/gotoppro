
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
      <h2>I. La Psychologie du Premier Contact</h2>
      <p>Dans l'industrie de la beauté, l'expérience client commence bien avant que la personne ne franchisse votre porte. Le téléphone est la vitrine sonore de votre professionnalisme. Un accueil médiocre suggère une technique médiocre. À l'inverse, un accueil structuré justifie immédiatement vos tarifs premium.</p>
      
      <h2>II. Le Protocole des 3 Sonneries</h2>
      <p>La règle d'or est la réactivité : ne laissez jamais le téléphone sonner plus de trois fois. Au-delà, le client se sent ignoré. Votre phrase d'accueil doit être une signature. Évitez le simple "Allô". Utilisez systématiquement la structure suivante : "Salon [Nom], [Votre Prénom] à votre écoute, bonjour". Cette formule place immédiatement le client dans un univers de service professionnel.</p>
      
      <h2>III. Le Sourire Vocal et l'Art de l'Écoute</h2>
      <p>Le client ne vous voit pas, mais il "ressent" votre posture. Le sourire modifie physiquement la résonance de votre voix, la rendant plus chaleureuse et engageante. C'est ce qu'on appelle le sourire vocal. Pratiquez l'écoute active en validant régulièrement les propos du client par des expressions comme "Parfait", "Je prends note" ou "Je comprends tout à fait". Cela prouve que vous êtes 100% dédié à son besoin.</p>
      
      <h2>IV. La Maîtrise de l'Agenda : La Technique de l'Alternative</h2>
      <p>Ne demandez jamais "Quand voulez-vous venir ?". Cette question vous fait perdre le contrôle de votre rentabilité. Proposez toujours deux options précises : "Préférez-vous mardi matin à 10h ou jeudi après-midi vers 15h ?". Cette méthode, dite de l'alternative, guide le client tout en optimisant votre planning pour éviter les "trous" dans la journée.</p>
      
      <h2>V. Conclusion & Réassurance</h2>
      <p>Terminez toujours l'appel en reformulant le rendez-vous : "C'est noté, Madame Traoré. Nous vous attendons mardi prochain à 10h pour votre balayage expert. Nous avons hâte de vous recevoir". C'est la touche finale qui sécurise la vente.</p>
    `,
    coach_tip: "Installe un petit miroir devant le téléphone pour te forcer à sourire en parlant. Si tu te vois sourire, le client l'entendra.",
    strategic_mantra: "Un appel perdu est un client qui part enrichir votre concurrent direct.",
    quiz_questions: [{ question: "Quelle est la structure idéale de la phrase d'accueil ?", options: ["Allô, c'est pour quoi ?", "Salon [Nom], [Prénom] à votre écoute, bonjour", "Oui bonjour, on est ouvert"], correctAnswer: 1, explanation: "Cette formule établit immédiatement votre autorité et votre professionnalisme." }],
    exercises: ["S'enregistrer avec son téléphone et écouter si on entend le 'sourire' dans sa voix.", "Pratiquer la technique de l'alternative sur les 5 prochains appels."],
    tips: ["Restez calme même en période de forte affluence.", "Notez toujours le nom du client dès le début de l'appel."]
  },
  {
    id: "mod_diagnostic",
    topic: "Vente",
    title: "Le Diagnostic Technique : De l'Exécutant à l'Expert",
    description: "Arrêtez de simplement couper des cheveux. Devenez le consultant stratégique que vos clients recherchent.",
    mini_course: "90% du succès d'une prestation se joue avant même de toucher une paire de ciseaux.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>I. L'Importance Cruciale du Face-à-Face</h2>
      <p>Le diagnostic ne doit jamais se faire par-derrière, alors que le client regarde son reflet dans le miroir. Pour créer une connexion de confiance, asseyez-vous ou accroupissez-vous pour être à la même hauteur que les yeux de votre client. Ce geste montre que vous lui accordez toute votre attention et casse la barrière de domination du coiffeur debout.</p>
      
      <h2>II. La Méthode des Questions Ouvertes</h2>
      <p>Bannissez la question "On fait quoi aujourd'hui ?". C'est une question de débutant. Utilisez des questions qui forcent le client à exprimer ses besoins profonds : "Qu'est-ce que vous aimeriez changer dans votre routine actuelle ?", "Comment ressentez-vous vos cheveux le matin au réveil ?", "Quelle image souhaitez-vous projeter lors de votre prochain événement ?".</p>
      
      <h2>III. L'Analyse Technique Sensorielle</h2>
      <p>Touchez les cheveux. Expliquez ce que vous ressentez. Parlez de porosité, d'élasticité, de densité. En utilisant un vocabulaire technique précis, vous justifiez votre expertise et préparez le terrain pour la vente de produits de soin. Le client doit comprendre que votre recommandation est basée sur une analyse scientifique, pas sur une envie de vendre.</p>
      
      <h2>IV. La Reformulation de Sécurité</h2>
      <p>Avant de commencer, reformulez toujours : "Si j'ai bien compris, vous souhaitez apporter de la lumière sur les pointes tout en conservant votre longueur naturelle pour pouvoir les attacher, c'est bien cela ?". Cette étape élimine tout risque d'erreur et rassure totalement le client sur votre compréhension de son projet.</p>
      
      <h2>V. Conclusion : La Validation du Devis</h2>
      <p>Annoncez toujours le prix final après le diagnostic et avant de commencer. Cela évite les mauvaises surprises à la caisse et positionne votre service comme un investissement clair dans la beauté du client.</p>
    `,
    coach_tip: "Un diagnostic réussi dure minimum 7 minutes. Si tu commences à couper après 2 minutes, tu n'es pas un expert, tu es une machine.",
    strategic_mantra: "Le client n'achète pas une coupe, il achète la solution à son problème capillaire.",
    quiz_questions: [{ question: "Quelle est la meilleure posture pour un diagnostic ?", options: ["Debout derrière le client", "Assis à sa hauteur, face à lui", "En préparant sa couleur au labo"], correctAnswer: 1, explanation: "Le contact visuel à hauteur d'homme est le fondement de la confiance psychologique." }],
    exercises: ["Réaliser 3 diagnostics aujourd'hui sans toucher aux outils pendant les 10 premières minutes.", "Utiliser 3 mots techniques (porosité, kératine, reflets froids) avec chaque cliente."],
    tips: ["Utilisez des visuels ou un book pour valider les couleurs.", "Notez systématiquement le diagnostic sur la fiche client."]
  },
  {
    id: "mod_hygiene",
    topic: "Hygiène",
    title: "L'Hygiène comme Argument Marketing",
    description: "La propreté n'est pas une corvée ménagère, c'est votre premier outil de fidélisation et de réassurance.",
    mini_course: "Dans un salon, la poussière est le poison de la confiance.",
    price: 500,
    aiCredits: 2,
    lesson_content: `
      <h2>I. La Perception du Client vs La Réalité</h2>
      <p>Un client juge votre hygiène en 3 secondes : l'état du miroir, la propreté de la tablette et l'absence de cheveux au sol. Même si vous utilisez les meilleurs produits du monde, un cheveu qui traîne sur la tablette du client précédent détruira instantanément son sentiment de luxe et de sécurité.</p>
      
      <h2>II. Le Rituel du Nettoyage Flash</h2>
      <p>Adoptez la règle du 'Poste Impeccable' : entre chaque client, votre poste doit revenir à son état initial. Miroir essuyé, tablette désinfectée, fauteuil replacé. Ce rituel doit être visible. Quand un client s'assoit, il doit avoir l'impression d'être le premier de la journée à utiliser ce poste.</p>
      
      <h2>III. La Mise en Scène de la Stérilisation</h2>
      <p>Vos outils (peignes, ciseaux, tondeuses) doivent être désinfectés de manière théâtrale. Sortez-les d'une boîte de stérilisation ou utilisez un spray désinfectant devant le client. Ce n'est pas seulement de l'hygiène, c'est une preuve de respect pour son intégrité physique. C'est ce qui différencie un salon de quartier d'une enseigne de prestige.</p>
      
      <h2>IV. L'Hygiène du Bac : Le Point Critique</h2>
      <p>Le bac à shampoing est l'endroit où le client est le plus vulnérable, allongé, les yeux vers le plafond. Le bac doit être rincé, séché et les siphons vidés après CHAQUE passage. Une odeur d'humidité ou des résidus de couleur sont inacceptables dans un parcours client d'excellence.</p>
      
      <h2>V. Conclusion : La Tenue du Personnel</h2>
      <p>Votre propre image est le reflet de votre rigueur. Une tenue propre, des ongles soignés et une haleine fraîche sont les bases non négociables de l'expert en beauté. Vous vendez de l'esthétique, vous devez l'incarner.</p>
    `,
    coach_tip: "Si tu vois une tache ou un cheveu, ne l'ignore pas. Si tu le vois, le client l'a déjà vu 10 fois.",
    strategic_mantra: "La propreté est le marketing silencieux qui ramène les clients sans que vous ayez à parler.",
    quiz_questions: [{ question: "Quand doit-on nettoyer son poste de travail ?", options: ["Le soir après la fermeture", "Toutes les deux heures", "Entre chaque client, systématiquement"], correctAnswer: 2, explanation: "Chaque client mérite de s'installer dans un espace qui lui est exclusivement dédié et propre." }],
    exercises: ["Mettre en place une check-list d'hygiène par poste.", "Acheter des sprays désinfectants parfumés pour améliorer l'ambiance olfactive."],
    tips: ["Vérifiez l'état des toilettes toutes les heures.", "Lavez vos mains devant le client avant de commencer."]
  },
  {
    id: "mod_ergonomie",
    topic: "Organisation",
    title: "Le Cockpit de l'Expert : Ergonomie et Profit",
    description: "Apprenez à organiser votre espace pour réduire votre fatigue et augmenter votre vitesse d'exécution de 20%.",
    mini_course: "Moins vous faites de pas inutiles, plus vous faites de bénéfices.",
    price: 500,
    aiCredits: 2,
    lesson_content: `
      <h2>I. La Théorie du Cockpit</h2>
      <p>Imaginez un pilote de ligne : tout ce dont il a besoin est à portée de main, sans qu'il ait à se lever. Votre poste de travail doit fonctionner de la même manière. Vos peignes, ciseaux, sprays et pinces les plus utilisés doivent se situer dans une zone de 60 cm autour de votre main dominante. Chaque fois que vous devez vous lever pour chercher un outil, vous perdez du temps et brisez le lien avec votre client.</p>
      
      <h2>II. L'Optimisation des Déplacements</h2>
      <p>Analysez votre trajet entre le bac, le labo couleur et votre poste. L'objectif est de minimiser ces trajets. Préparez tout votre matériel (serviettes, bols, pinceaux) avant que le client n'arrive. Un expert préparé dégage une aura de calme et de maîtrise, tandis qu'un coiffeur qui court partout dégage du stress.</p>
      
      <h2>III. La Posture du Gérant Rentable</h2>
      <p>La fatigue physique est l'ennemie de la vente. Si vous avez mal au dos ou aux jambes en fin de journée, vous ne proposerez plus de soins ou de produits par épuisement. Utilisez des tabourets à roulettes ergonomiques. Réglez la hauteur du fauteuil du client pour que vos bras restent à 90 degrés. Votre corps est votre outil de travail, protégez-le pour durer.</p>
      
      <h2>IV. Le Rangement Logique du Labo</h2>
      <p>Le labo couleur est souvent le point noir de l'organisation. Classez vos tubes par nuances et par marques. Utilisez des étiquettes claires. Un labo rangé permet de préparer une couleur en 2 minutes au lieu de 5. Multiplié par 10 clientes, c'est une demi-heure de gagnée par jour pour accueillir une cliente supplémentaire.</p>
      
      <h2>V. Conclusion : Le Temps, c'est votre Argent</h2>
      <p>Une minute gagnée sur chaque prestation n'est pas un détail. Sur une année, c'est l'équivalent de deux semaines de travail en plus. L'organisation est la clé secrète de la richesse dans les métiers de services.</p>
    `,
    coach_tip: "Fais une vidéo de toi en train de travailler pendant 10 minutes, puis regarde combien de fois tu t'es déplacé inutilement. Tu vas être choqué.",
    strategic_mantra: "L'ordre physique dans votre salon crée l'ordre financier dans votre comptabilité.",
    quiz_questions: [{ question: "Qu'est-ce que la zone de proximité ergonomique ?", options: ["Le rayon de 60cm autour de votre main", "La distance entre le bac et la caisse", "La surface totale du salon"], correctAnswer: 0, explanation: "C'est dans cette zone que vos outils principaux doivent rester pour maximiser votre efficacité." }],
    exercises: ["Réorganiser son tiroir principal pour n'y laisser que l'essentiel.", "Chronométrer le temps de préparation d'une couleur et essayer de le diviser par deux."],
    tips: ["Utilisez des dessertes mobiles si votre poste est fixe.", "Investissez dans de bons tapis anti-fatigue."]
  },
  {
    id: "mod_social_media",
    topic: "Digital",
    title: "Branding Digital : Devenir la Référence sur Instagram",
    description: "Apprenez à créer un flux de nouveaux clients constant grâce à une image de marque forte et professionnelle.",
    mini_course: "Votre vitrine n'est plus dans la rue, elle est dans la poche de vos clients.",
    price: 500,
    aiCredits: 5,
    lesson_content: `
      <h2>I. La Qualité Visuelle Non Négociable</h2>
      <p>Sur Instagram, la qualité de votre travail ne suffit pas si la photo est mauvaise. Vous devez devenir un photographe amateur éclairé. Investissez dans un anneau lumineux (Ring Light) pour éliminer les ombres sur le visage et faire briller les reflets de la chevelure. Le fond doit être neutre : un mur blanc, gris ou un rideau sobre. Évitez les fonds encombrés (bouteilles de shampoing, poubelles) qui dévalorisent votre travail.</p>
      
      <h2>II. L'Art du 'Avant/Après' Stratégique</h2>
      <p>Le 'Avant/Après' est le contenu le plus puissant pour convertir un prospect en client. Mais attention : la photo du 'Avant' doit être nette et honnête, et la photo du 'Après' doit être spectaculaire. Cadrez de la même manière pour les deux photos pour que le changement soit frappant. Racontez l'histoire : 'Madame A. est venue avec des cheveux cassants, voici comment nous avons sauvé sa fibre capillaire'.</p>
      
      <h2>III. La Ligne Éditoriale : Apporter de la Valeur</h2>
      <p>Ne postez pas seulement des photos de coiffures. Partagez des conseils : '3 astuces pour garder son blond éclatant', 'Comment démêler les cheveux de ses enfants sans pleurs'. En donnant des conseils gratuits, vous vous positionnez comme l'expert de référence. Vos clients viendront chez vous parce qu'ils ont confiance en votre savoir, pas seulement en vos mains.</p>
      
      <h2>IV. L'Engagement et la Proximité</h2>
      <p>Les réseaux sociaux sont faits pour être... sociaux. Répondez à chaque commentaire, même par un simple coeur. Utilisez les Stories pour montrer les coulisses du salon : l'arrivée des nouveaux produits, la formation de l'équipe, le café offert. Montrez l'aspect humain. On choisit un coiffeur pour son talent, on y reste pour sa personnalité.</p>
      
      <h2>V. Conclusion : La Régularité bat l'Intensité</h2>
      <p>Mieux vaut poster 3 fois par semaine de manière constante que 10 fois en un jour puis plus rien pendant un mois. L'algorithme récompense la fidélité. Créez-vous un rendez-vous avec votre audience.</p>
    `,
    coach_tip: "Crée un 'coin photo' dédié dans ton salon avec un bon éclairage. Tes clientes vont adorer se faire prendre en photo et elles partageront le résultat sur leurs propres réseaux.",
    strategic_mantra: "Si un futur client ne peut pas voir la qualité de votre travail sur son téléphone, il n'entrera jamais dans votre salon.",
    quiz_questions: [{ question: "Quel est l'élément le plus important pour une photo réussie ?", options: ["Le prix du téléphone", "La qualité de l'éclairage (Ring Light)", "Le nombre de hashtags"], correctAnswer: 1, explanation: "Une bonne lumière révèle les détails techniques et sublime les couleurs." }],
    exercises: ["Prendre 5 photos de réalisations aujourd'hui avec un fond neutre.", "Rédiger un post conseil de 5 lignes pour ses abonnés."],
    tips: ["Taggez vos clientes satisfaites.", "Utilisez les Reels pour montrer le mouvement des cheveux."]
  },
  {
    id: "mod_management",
    topic: "Management",
    title: "Leadership de Salon : Devenir un Mentor Inspirant",
    description: "Apprenez à diriger une équipe qui s'investit autant que vous dans la réussite du salon.",
    mini_course: "On ne gère pas des employés, on mène des talents vers l'excellence.",
    price: 500,
    aiCredits: 4,
    lesson_content: `
      <h2>I. Le Pouvoir de l'Exemplarité</h2>
      <p>En tant que gérant, vous êtes le thermomètre du salon. Si vous arrivez en retard, votre équipe arrivera en retard. Si vous parlez mal aux clients, ils feront de même. Le leadership commence par l'auto-discipline. Incarnez les standards que vous exigez des autres. Votre autorité ne vient pas de votre titre, mais de votre comportement quotidien.</p>
      
      <h2>II. Le Rituel du Briefing Matinal</h2>
      <p>Consacrez 10 minutes chaque matin, avant l'ouverture, à réunir votre équipe. Ne parlez pas seulement technique. Donnez l'objectif de la journée : 'Aujourd'hui, nous mettons l'accent sur le diagnostic et la proposition de soins'. Célébrez les victoires de la veille. Une équipe qui connaît la direction marche plus vite et avec plus d'enthousiasme.</p>
      
      <h2>III. La Culture du Feedback Positif</h2>
      <p>Nous avons souvent tendance à ne parler qu'à nos employés quand quelque chose ne va pas. Changez de paradigme. Apprenez à féliciter en public et à recadrer en privé. Un compliment sincère devant une cliente ('Bravo Marie pour ce brushing, le lissage est parfait') booste l'ego du collaborateur et rassure la cliente sur le choix de son coiffeur.</p>
      
      <h2>IV. Les Objectifs et la Motivation</h2>
      <p>Donnez à votre équipe une raison de se dépasser. Fixez des objectifs clairs et atteignables : 'Si l'équipe vend 20 soins cette semaine, nous commandons des pizzas vendredi midi'. La motivation n'est pas toujours financière, elle est souvent liée au sentiment d'appartenance et à la reconnaissance du travail accompli.</p>
      
      <h2>V. Conclusion : Déléguer pour Grandir</h2>
      <p>Vous ne pouvez pas tout faire. Apprenez à déléguer des responsabilités : la gestion des stocks à l'un, l'animation d'Instagram à l'autre. En donnant de la responsabilité, vous créez de l'engagement. Votre rôle est de piloter le navire, pas de ramer tout seul.</p>
    `,
    coach_tip: "Demande à tes employés : 'De quoi as-tu besoin pour mieux travailler aujourd'hui ?'. Cette simple question change radicalement leur perception de toi en tant que leader.",
    strategic_mantra: "Le chiffre d'affaires d'un salon est limité par le temps du gérant, mais le profit d'une entreprise est illimité grâce à la force d'une équipe.",
    quiz_questions: [{ question: "Où doit se faire un recadrage ?", options: ["Devant toute l'équipe", "Devant le client pour montrer qui est le chef", "En tête-à-tête dans un bureau ou un coin calme"], correctAnswer: 2, explanation: "Le respect de l'individu est la base de la loyauté à long terme." }],
    exercises: ["Faire un compliment spécifique et sincère à chaque membre de l'équipe aujourd'hui.", "Animer son premier briefing de 5 minutes demain matin."],
    tips: ["Écoutez plus que vous ne parlez.", "Soyez transparent sur les objectifs du salon."]
  },
  {
    id: "mod_tarification",
    topic: "Gestion",
    title: "Psychologie des Prix : Valoriser son Expertise",
    description: "Arrêtez de brader vos services. Apprenez à fixer des tarifs qui reflètent votre valeur et garantissent votre profit.",
    mini_course: "Le prix est le reflet de l'estime que vous portez à votre propre talent.",
    price: 500,
    aiCredits: 3,
    lesson_content: `
      <h2>I. Sortir du Piège du 'Prix du Voisin'</h2>
      <p>La plupart des gérants fixent leurs prix en regardant ce que fait le salon d'en face. C'est une erreur fatale. Vos charges sont différentes, votre talent est différent, votre service est différent. Si vous vendez une coupe à 3000 FCFA parce que le voisin le fait, mais que votre loyer est plus cher, vous travaillez pour la gloire, pas pour le profit. Vos prix doivent être basés sur VOS coûts et VOTRE valeur ajoutée.</p>
      
      <h2>II. Comprendre le Coût à la Minute</h2>
      <p>Pour être rentable, vous devez savoir combien vous coûte chaque minute d'ouverture de votre salon (loyer + électricité + salaires + taxes / nombre de minutes d'ouverture). Si votre coût est de 50 FCFA par minute et qu'une coupe dure 45 minutes, elle vous coûte 2250 FCFA rien qu'en frais fixes. Si vous la vendez 3000 FCFA, il ne vous reste que 750 FCFA pour payer vos produits et dégager un bénéfice. Le calcul est la base de la survie.</p>
      
      <h2>III. Le Prix Psychologique et le Luxe</h2>
      <p>Un prix bas envoie un signal de mauvaise qualité. Dans l'univers de la beauté, les clients associent souvent 'cher' à 'compétent'. Si vous justifiez vos prix par un diagnostic expert, un accueil d'élite et des produits de haute technologie, vos clients seront fiers de payer plus cher pour un résultat garanti. Ne vendez pas une prestation, vendez une transformation.</p>
      
      <h2>IV. L'Art d'Annoncer les Augmentations</h2>
      <p>N'ayez pas peur d'augmenter vos prix. Faites-le une fois par an de 5 à 10%. Justifiez-le par l'augmentation de la qualité, vos nouvelles formations ou l'amélioration du confort du salon. Les clients fidèles qui apprécient votre valeur ne partiront pas pour 500 FCFA de plus. Ceux qui partent ne sont pas vos clients cibles, ce sont des chasseurs de prix.</p>
      
      <h2>V. Conclusion : La Clarté du Devis</h2>
      <p>L'absence de prix affiché génère de l'anxiété chez le client. Affichez vos tarifs clairement, mais parlez toujours de 'À partir de' pour vous laisser la marge d'ajuster en fonction de l'épaisseur ou de la longueur des cheveux. Le diagnostic doit toujours se conclure par la validation du prix.</p>
    `,
    coach_tip: "Si ton salon est tout le temps plein avec une liste d'attente de deux semaines, c'est le signal que tes prix sont trop bas. Augmente-les immédiatement de 15%.",
    strategic_mantra: "Vendre à perte n'est pas un service que vous rendez au client, c'est une condamnation à mort pour votre entreprise.",
    quiz_questions: [{ question: "Sur quoi doit se baser votre tarif ?", options: ["Sur les prix du salon voisin", "Sur vos coûts réels et votre valeur d'expertise", "Sur l'humeur du jour"], correctAnswer: 1, explanation: "La rentabilité est une science mathématique, pas une intuition." }],
    exercises: ["Calculer ses charges fixes mensuelles totales.", "Réviser ses tarifs de prestations phares en fonction du temps passé réel."],
    tips: ["Affichez vos prix sur vos réseaux sociaux.", "Ne vous excusez jamais de vos tarifs."]
  },
  {
    id: "mod_tresorerie",
    topic: "Gestion",
    title: "Maîtrise de la Trésorerie : Le Souffle du Salon",
    description: "Apprenez à gérer votre argent pour ne plus jamais être stressé par les fins de mois ou les factures imprévues.",
    mini_course: "Le chiffre d'affaires est une vanité, le bénéfice est une réalité, le cash est le roi.",
    price: 500,
    aiCredits: 4,
    lesson_content: `
      <h2>I. La Différence entre CA et Profit</h2>
      <p>Beaucoup de gérants font l'erreur de croire que l'argent en caisse le soir leur appartient. C'est faux. Cet argent sert d'abord à repayer vos produits, votre loyer, vos employés et vos taxes. Ce qui reste après TOUTES ces dépenses est votre véritable profit. Ne confondez jamais votre poche personnelle avec la caisse du salon. C'est la première cause de faillite.</p>
      
      <h2>II. Le Tableau de Bord Quotidien</h2>
      <p>Vous devez savoir exactement ce qui est entré et ce qui est sorti chaque jour. Notez tout, même le petit achat de café ou de produits d'entretien. Utilisez un cahier ou une application. Le suivi quotidien vous permet de voir venir les problèmes avant qu'ils ne deviennent des catastrophes. Si vos dépenses augmentent alors que votre CA stagne, vous devez réagir immédiatement.</p>
      
      <h2>III. Anticiper les Charges Fixes</h2>
      <p>Les taxes, le loyer et les salaires tombent tous les mois. Créez un 'compte de réserve'. Chaque soir, virez un pourcentage de votre recette (par exemple 20%) sur ce compte dédié uniquement aux charges. Ainsi, quand la facture d'électricité ou l'impôt arrive, l'argent est déjà là. Vous ne travaillez plus sous pression.</p>
      
      <h2>IV. Le Matelas de Sécurité de 3 Mois</h2>
      <p>L'objectif ultime d'un gérant d'élite est de disposer d'une réserve de cash équivalente à 3 mois de charges fixes. Ce matelas vous permet de rester serein en cas de baisse d'activité, de panne de matériel ou de crise sanitaire. C'est ce qui sépare les amateurs des véritables entrepreneurs.</p>
      
      <h2>V. Conclusion : Investir au bon moment</h2>
      <p>N'achetez pas de nouveau matériel juste parce que c'est joli. Achetez-le parce qu'il va vous rapporter plus d'argent ou vous faire gagner du temps. Chaque dépense doit être vue comme un investissement avec un retour sur investissement clair.</p>
    `,
    coach_tip: "Ouvre un compte séparé (Wave Business ou Bancaire) uniquement pour tes charges. Ne touche jamais à cet argent pour tes dépenses personnelles.",
    strategic_mantra: "Une bonne gestion financière vous donne la liberté de vous concentrer sur votre art sans avoir peur du lendemain.",
    quiz_questions: [{ question: "Qu'est-ce que le matelas de sécurité ?", options: ["L'argent pour les vacances", "3 mois de charges fixes mis de côté", "Le stock de produits de rechange"], correctAnswer: 1, explanation: "Cette réserve est l'assurance vie de votre entreprise face aux imprévus." }],
    exercises: ["Lister toutes ses charges fixes mensuelles de manière exhaustive.", "Commencer à mettre 10% de sa recette journalière de côté dès ce soir."],
    tips: ["Évitez les crédits de consommation pour le salon.", "Réglez vos fournisseurs dès réception des factures."]
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
