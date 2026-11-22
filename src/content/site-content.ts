import type { StepItem } from "@/components/ui/content/Steps";

/*
 * Editorial content of the public site. Sources:
 * - client copy supplied in the design system (hero, steps, FAQ answers, Nantes news, Rallye du Cœur);
 * - business rules approved on 20/11/2026 (docs/AUDIT.md §3): online payment at booking, account
 *   required, free cancellation until 24 h before arrival, booking at least 2 h ahead.
 * Phase 7 moves editable content to the back office.
 */

/** Home hero (client design « Accueil », Nov. 2026). Words in [brackets] are accented. */
export const HERO = {
  title: "Votre parking [couvert] et [sécurisé] à [800 m] des pistes de l’aéroport de Nantes !",
};

/** The four steps of the hero (client copy). */
export const HOW_IT_WORKS_STEPS: StepItem[] = [
  { icon: "stepReserver", title: "Réservez votre place en ligne", text: "7 jours/7 et 24h/24" },
  { icon: "stepDeposer", title: "Déposez votre véhicule au parking", text: "Vidéo surveillance & gardiennage" },
  { icon: "stepNavette", title: "Nous vous déposons à l’aéroport", text: "Navette gratuite sans attente" },
  { icon: "stepVacances", title: "Profitez de vos vacances", text: "Découvrez nos Services Plus" },
];

/** Detailed explanation of each step (how-it-works page). Approved rules only. */
export const HOW_IT_WORKS_DETAILS = [
  {
    title: "Réservez votre place en ligne",
    text: "Choisissez votre parking, vos dates et votre formule. Le prix est calculé pour vos dates exactes et réglé en ligne, par paiement sécurisé. Réservez au moins 2 heures avant votre arrivée au parking.",
  },
  {
    title: "Déposez votre véhicule au parking",
    text: "Présentez-vous à l’accueil avec votre référence de réservation. Le parking est sous vidéosurveillance et gardiennage.",
  },
  {
    title: "Nous vous déposons à l’aéroport",
    text: "Avec la formule ALTERPARK, la navette gratuite vous dépose au pied du terminal, sans attente. Comptez 15 minutes entre l’accueil et votre arrivée au terminal (hors périodes d’affluence).",
  },
  {
    title: "Profitez de vos vacances",
    text: "À votre retour, la navette vous ramène au parking et vous récupérez votre véhicule. Vos réservations et paiements restent consultables dans votre espace client.",
  },
];

export const FAQ = [
  {
    title: "Combien de temps faut-il pour rejoindre le terminal ?",
    content: "Comptez 15 minutes entre l’accueil et votre arrivée au terminal (hors périodes d’affluence).",
  },
  { title: "La navette est-elle gratuite ?", content: "Oui, la navette est gratuite et sans attente, avec le service standard." },
  {
    title: "Quelle est la différence entre ALTERPARK et ALTERECO ?",
    content: "ALTERPARK inclut la navette jusqu’au terminal. ALTERECO est un parking couvert et sécurisé, sans navette, à 15 minutes à pied du terminal.",
  },
  {
    title: "Quand dois-je payer ma réservation ?",
    content: "Le paiement se fait en ligne au moment de la réservation, par paiement sécurisé. Votre place est confirmée dès que le paiement est validé.",
  },
  {
    title: "Puis-je annuler ma réservation ?",
    content:
      "Oui. L’annulation est gratuite jusqu’à 24 heures avant votre arrivée au parking, depuis votre espace client. Passé ce délai, vous pouvez envoyer une demande d’annulation qui sera étudiée par notre équipe.",
  },
  {
    title: "Combien de temps à l’avance dois-je réserver ?",
    content: "Vous pouvez réserver jusqu’à 2 heures avant votre arrivée au parking, dans la limite des places disponibles.",
  },
  {
    title: "Dois-je créer un compte ?",
    content: "Oui, un compte est créé pendant la réservation. Il vous permet de retrouver vos réservations, vos paiements et de gérer une annulation.",
  },
  {
    title: "Le parking est-il surveillé ?",
    content: "Oui, le parking est sous vidéosurveillance et gardiennage.",
  },
];

/** Nantes news section (client copy). */
export const NANTES_NEWS = {
  title: "Que de changements chez ALTERPARK depuis le 20 mars !",
  paragraphs: [
    "ALTERPARK a apporté de nombreux changements pour améliorer votre expérience. Nous avons agrandi et modernisé notre hall d’accueil pour vous offrir un espace plus vaste, confortable et chaleureux. Notre parking est désormais équipé d’ombrières photovoltaïques et de filets anti-grêle, assurant une protection optimale de votre véhicule contre les intempéries.",
    "De plus, nous avons créé un point de desserte exclusif au pied de l’aérogare (P1 Couvert), permettant un accès direct et pratique à l’aéroport de Nantes, à l’abri des conditions climatiques. Enfin, nous proposons une offre imbattable en termes de service, de sécurité et de prix, avec, par exemple, 8 jours de stationnement en août à partir de 57,60 € TTC avec notre service ALTERECO* (service sans navette).",
  ],
};

export const RALLYE = {
  title: "ALTERPARK soutient le “Rallye du Cœur”",
  text: "Pour chaque réservation effectuée, ALTERPARK reverse 0,50 € au Rallye du Cœur, une initiative qui rassemble passionnés d’automobile et bienfaiteurs pour soutenir la lutte contre le cancer chez l’enfant. En choisissant ALTERPARK, vous contribuez à cette cause importante tout en bénéficiant de nos services de stationnement de qualité.",
};

/** Selling points under the booking bar. Only verified facts. */
export const BOOKING_PERKS = [
  { icon: "card" as const, text: "Paiement sécurisé en ligne" },
  { icon: "shield" as const, text: "Vidéosurveillance et gardiennage" },
  { icon: "h24" as const, text: "Parking 7j/7 – 24h/24" },
];

/*
 * Loyalty programme (client design). Not yet available online (approved rule Q9: out of v1): the
 * page presents it as coming soon, never as something the customer can already use.
 */
export const LOYALTY = {
  title: "Fidélisez vos réservations avec ALTERPARK !",
  subtitle: "Comment ça marche ?",
  steps: [
    { icon: "fideliteCumulez", title: "Cumulez", text: "des points à chaque achat. Chaque euro dépensé vous rapporte 10 points" },
    { icon: "fideliteCapitalisez", title: "Capitalisez", text: "vos points. Pour chaque tranche de 100 points, vous obtenez 1 € de réduction" },
    { icon: "fideliteUtilisez", title: "Utilisez", text: "vos points en ligne pour bénéficier d’une remise sur votre prochaine réservation." },
  ] satisfies StepItem[],
  howTitle: "Comment utiliser vos points ?",
  how: "Lors de votre prochaine réservation, si vous avez accumulé au moins 1 000 points, une remise vous sera automatiquement proposée. Chaque tranche de 100 points équivaut à 1 € de réduction.",
  example: "Exemple : avec un capital de 1 200 points, vous bénéficierez d’une remise de 12 €.",
  soon: "Le programme de fidélité arrive bientôt dans votre espace client.",
};

/** Mobile application section (client design). Store badges appear only with real URLs. */
export const APP = {
  title: "Votre parking dans votre poche, sur Google Play & Apple Store !",
  text: "Réservez, payez et retrouvez votre billet en quelques gestes : l’application ALTERPARK réunit tout votre stationnement à l’aéroport de Nantes, du départ au retour de vacances.",
  features: [
    { icon: "bolt" as const, title: "Réservation express", text: "Dates, véhicule, paiement : votre place est réservée en 4 étapes." },
    { icon: "ticket" as const, title: "Billet dans votre poche", text: "Présentez votre billet à l’accueil, sans rien imprimer." },
    { icon: "gift" as const, title: "Fidélité intégrée", text: "Suivez vos points et appliquez vos remises au paiement." },
    { icon: "pin" as const, title: "Infos pratiques", text: "Adresse, plan d’accès et contact de l’accueil à portée de main." },
  ],
  available: "Application gratuite, sur iPhone et Android.",
  soon: "Bientôt disponible sur iPhone et Android.",
};

/** Latest Google reviews supplied with the design (« relevés le 13 nov. 2026 »), newest first. */
export const REVIEWS = {
  title: "Ce que nos clients disent de nous sur Google !",
  text: "Un grand merci à vous pour vos avis et votre confiance ! Vos retours nous motivent chaque jour à vous offrir un service de qualité. Continuez à partager votre expérience, c’est grâce à vous que nous progressons !",
  items: [
    { name: "Yann Calvez", rating: 5, date: "il y a 4 semaines", text: "Cela fait deux fois que je gare ma voiture chez ALTERPARK et c’est vraiment top, des vrais professionnels. Un service de prise en charge rapide, que ce soit pour aller à l’aéroport et pour le retour. Les véhicules sont bien garés. Je recommande cet établissement !" },
    { name: "Mathias MLN", rating: 5, date: "il y a un mois", text: "Une affaire de famille : on dépose toutes nos voitures chez Alterpark depuis presque 5 ans. Plus d’une quinzaine de dépôts, la mienne y est actuellement et je sais qu’elle ne…" },
    { name: "Sophie D So", rating: 5, date: "il y a 2 mois", text: "Une excellente expérience avec Alterpark. Une équipe incroyable, disponible, rapide et très efficace, avec une vraie bonne entente qui se ressent immédiatement. L’espace couvert est propre, sécurisé, calme et parfaitement organisé. Quand on…" },
    { name: "Camille Laboureur", rating: 5, date: "il y a 2 mois", text: "C’est vraiment le meilleur endroit pour laisser son véhicule. Le service est rapide, et le personnel est vraiment adorable. À chaque fois c’était parfait ! Merci, mention spéciale à l’équipe qui reste sympathique et fun en toutes circonstances, même à 4 h du mat." },
    { name: "Alain Julien", rating: 5, date: "il y a 3 mois", text: "Service et contacts parfaits. Notre avion a eu un retard de 2 heures, ils l’avaient déjà pris en compte. Pas de frais supplémentaires, disponible et répond rapidement au téléphone." },
  ],
};

/*
 * Services Plus (client design « services.html »). Services are not part of the online booking
 * yet: each card leads to a request through the contact form (no « added to your booking » that
 * would not happen). Prices are the client's.
 */
export const SERVICES_HERO = {
  title: "Les Services Plus d’ALTERPARK : l’entretien [sans frein] au [meilleur prix] !",
  introStart: "Pendant votre voyage, on s’occupe de votre voiture. Recharge, lavage, entretien ou carrosserie : ",
  introStrong: "vous retrouvez un véhicule prêt à rouler",
  introEnd: " et vous ne payez qu’à votre retour.",
};

export const SERVICES = [
  { id: "recharge", icon: "evCharger" as const, title: "Recharge électrique", price: 49, badge: "Prix de lancement", tagline: "Passez au vert avec Alterpark !", intro: "Rechargez votre véhicule électrique pendant que vous profitez de votre temps libre. Notre forfait comprend une prise en charge rapide et sécurisée de votre voiture.", notes: ["Temps estimé : flexible selon vos besoins."] },
  {
    id: "interieur", icon: "seatSpray" as const, title: "Nettoyage intérieur", price: 54,
    intro: "Offrez une seconde jeunesse à l’intérieur de votre voiture grâce à notre prestation complète. Notre équipe prend soin de chaque détail pour un habitacle propre et agréable.",
    items: [
      { title: "Aspiration minutieuse", text: "Habitacle et coffre." },
      { title: "Dépoussiérage des plastiques intérieurs", text: "Tableau de bord, portières, console centrale." },
      { title: "Nettoyage des vitres", text: "Intérieures et extérieures, pour une visibilité optimale." },
    ],
    notes: ["Temps estimé : 30 à 45 minutes."],
  },
  {
    id: "lavage", icon: "carWash" as const, title: "Lavage Business", price: 96, featured: true, badge: "Formule complète",
    intro: "Notre service premium pour un véhicule impeccable, à l’intérieur comme à l’extérieur. Cette prestation combine expertise, soins professionnels et finition haut de gamme.",
    items: [
      { title: "Extérieur", text: "Lavage au tunnel suivi d’une finition à la main pour éliminer les moindres traces." },
      { title: "Intérieur", text: "Aspiration complète, dépoussiérage des plastiques, nettoyage des vitres (intérieur et extérieur)." },
      { title: "Nettoyage des jantes", text: "Redonnez éclat et propreté à vos roues." },
    ],
    notes: ["Temps estimé : environ 1 heure."],
  },
  {
    id: "sur-demande", icon: "carDoc" as const, title: "Sur demande", price: "Devis gratuit",
    intro: "Bénéficiez de solutions personnalisées pour tous vos besoins mécaniques ou de carrosserie.",
    items: [
      { title: "Mécanique", text: "Confiez-nous votre véhicule pour des réparations ou entretiens courants.", lines: [
        { label: "Vidange", text: "huiles moteur adaptées et remplacement du filtre à huile." },
        { label: "Plaquettes de freins", text: "installation et vérification pour une sécurité optimale." },
        { label: "Pneus", text: "remplacement ou réparation, équilibrage et ajustement de pression." },
      ] },
      { title: "Carrosserie", text: "Rendez à votre voiture son apparence d’origine grâce à nos services sur mesure.", lines: [
        { label: "Bris de glace", text: "changement ou réparation de pare-brise et vitres latérales." },
        { label: "Tôlerie et peinture", text: "traitement des bosses, rayures ou peinture complète." },
      ] },
    ],
    notes: ["Gratuit et sans engagement : déposez simplement votre voiture chez Alterpark. Un devis détaillé vous est envoyé par e-mail dans l’heure."],
  },
];

export const SERVICES_WHY = [
  { icon: "thumbStars" as const, title: "Satisfaction garantie", text: "Aucun acompte à payer : vous réglez uniquement à votre retour. Nous travaillons jusqu’à ce que vous soyez 100 % satisfait." },
  { icon: "stopwatch" as const, title: "Efficacité & flexibilité", text: "Des services rapides qui s’adaptent à votre emploi du temps, avec un suivi personnalisé pour chaque client." },
  { icon: "medal" as const, title: "Experts passionnés", text: "Une équipe de professionnels qualifiés et passionnés d’automobile, avec des produits et équipements haut de gamme." },
  { icon: "plantHand" as const, title: "Écoresponsabilité", text: "Des lavages avec des produits respectueux de l’environnement et un service dédié aux véhicules électriques." },
];
