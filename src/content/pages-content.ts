/*
 * Copy of the client's page designs (Nov. 2026): « Comment ça marche », « Plan accès »,
 * « Qui sommes-nous ». Adapted only where the design contradicts how the site works
 * (see each comment); open questions are listed in docs/ROADMAP.md.
 */

import { siteContact } from "@/config/site";

export type RichLine = { strong?: string; text: string };

export type HowStep = {
  title: string;
  /** Pictogram drawn by HowStepIcon. */
  icon: "reserver" | "parking" | "camera" | "navette" | "route";
  intro: string;
  lines: RichLine[];
  /** Optional second group (title + lines). */
  group?: { title: string; lines: RichLine[] };
  outro: string;
};

export const HOW_PAGE = {
  title: "Votre parking à proximité de l’aéroport en 5 étapes simple, rapide et économique !",
  intro: "Chez Alterpark, nous avons simplifié le stationnement près de l’aéroport pour vous offrir une expérience fluide et sans stress. Suivez ces 5 étapes et voyagez l’esprit tranquille !",
};

export const HOW_STEPS: HowStep[] = [
  {
    title: "Réservez votre place facilement",
    icon: "reserver",
    intro: "Anticipez votre stationnement en toute simplicité :",
    lines: [
      { strong: "Cliquez sur « Réservez ma place »", text: "pour garantir votre place." },
      // Design: « Aucun paiement à l’avance ». Customers now choose (ADR-023): online or on site.
      { strong: "Paiement au choix :", text: "en ligne à la réservation, ou sur place à votre retour." },
      { strong: "Besoin d’aide ?", text: `Appelez-nous au ${siteContact.phone}, notre équipe est disponible pour vous guider.` },
    ],
    outro: "Réservez à l’avance pour plus de sérénité et éviter les imprévus !",
  },
  {
    title: "Déposez votre véhicule chez Alterpark",
    icon: "parking",
    intro: "Le jour du départ, voici comment se déroule la prise en charge :",
    lines: [
      { strong: "Arrivée à l’heure convenue :", text: "présentez-vous à l’accueil pour l’enregistrement de votre véhicule." },
      { strong: "Relevé du kilométrage et inspection :", text: "nous vérifions ensemble l’état de votre voiture pour une totale transparence." },
      { strong: "Stationnement sécurisé :", text: "notre équipe gare votre véhicule dans notre parking sécurisé, sous surveillance 24h/24." },
    ],
    group: {
      title: "Transfert rapide vers l’aéroport",
      lines: [
        { strong: "En moins de 5 minutes,", text: "notre navette privée vous emmène jusqu’à la desserte « P11 Eco » de l’aéroport." },
        { strong: "Temps total estimé :", text: "15 minutes (hors périodes de forte affluence)." },
      ],
    },
    outro: "Vous êtes prêt à embarquer l’esprit léger !",
  },
  {
    title: "Votre voiture est en sécurité durant votre séjour",
    icon: "camera",
    intro: "Pendant votre voyage, votre véhicule bénéficie d’une surveillance continue :",
    lines: [
      { strong: "Parking sécurisé 24h/24", text: "avec vidéosurveillance et présence sur site." },
      { strong: "Entretien et nettoyage possibles :", text: "profitez de votre absence pour retrouver une voiture impeccable à votre retour." },
    ],
    group: {
      title: "Nos Services Plus pour un véhicule comme neuf :",
      lines: [
        { text: "Nettoyage intérieur et extérieur" },
        { text: "Vidange et contrôle mécanique" },
        { text: "Remplacement des plaquettes de frein, pneus, et bien plus" },
      ],
    },
    outro: "Gagnez du temps et optimisez votre séjour en confiant l’entretien de votre véhicule à nos experts.",
  },
  {
    title: "À votre retour, contactez-nous pour la navette",
    icon: "navette",
    intro: "Dès que vous avez récupéré vos bagages et que vous êtes arrivé(e) à la desserte « P11 Eco », appelez-nous, et notre navette viendra vous chercher en quelques minutes.",
    lines: [],
    outro: "Un service réactif pour un retour sans attente !",
  },
  {
    title: "Récupérez votre véhicule et reprenez la route sereinement",
    icon: "route",
    intro: "À votre arrivée chez Alterpark :",
    lines: [
      { strong: "Votre voiture vous attend", text: "en zone de restitution pour un départ immédiat." },
      { strong: "Vérification finale :", text: "vous retrouvez votre véhicule dans le même état (ou encore plus propre si vous avez choisi nos Services Plus !)." },
      { strong: "Paiement sur place :", text: "si vous n’avez pas payé en ligne. Carte bancaire, espèces, chèques et chèques vacances acceptés." },
    ],
    outro: "Alterpark, la solution idéale pour un stationnement sans stress à proximité de l’aéroport !",
  },
];

export type RouteStep = { icon: "motorway" | "right" | "roundaboutLeft" | "roundaboutRight"; title: string; text: string; distance: string };

export const ACCESS_PAGE = {
  title: "Comment rejoindre Alterpark ? Accès à notre parking près de l’aéroport de Nantes !",
  intro: "L’itinéraire indiqué est donné à titre informatif et peut varier en fonction des conditions de circulation, des travaux ou des déviations. Assurez-vous de respecter le code de la route et la signalisation en vigueur.",
  destination: "1 Rue Dieudonné Costes, 44860 Saint-Aignan-de-Grandlieu",
};

export const ACCESS_ROUTES: { id: string; compass: "S" | "N"; title: string; exit: string; origin: string; steps: RouteStep[] }[] = [
  {
    id: "depuis-le-sud",
    compass: "S",
    title: "Vous arrivez du sud ?",
    exit: "Sortie 50 – Porte de Retz",
    origin: "Porte de Retz, Rezé",
    steps: [
      { icon: "motorway", title: "Prendre la direction nord sur Bd Nelson Mandela", text: "Prendre la direction nord vers Boulevard Nelson Mandela en suivant la direction de la Porte de Bouguenais, puis continuer sur la rue Ginsheim Gustavsburg.", distance: "1,4 km" },
      { icon: "right", title: "Tourner à droite sur Rue des Sencives", text: "Continuer sur la rue Maison David, puis sur la rue de la Croix Rouge sur 1,7 km.", distance: "1,7 km" },
      { icon: "right", title: "Tourner à droite sur la D85, direction « Saint-Aignan-de-Grandlieu »", text: "Continuer tout droit sur 450 m sur la route Château-Bougon.", distance: "450 m" },
      { icon: "roundaboutLeft", title: "Au rond-point, prendre la 3e sortie sur Rue de l’Aviation", text: "Traverser la voie ferrée jusqu’au rond-point suivant.", distance: "200 m" },
      { icon: "roundaboutLeft", title: "Au rond-point, prendre la 3e sortie sur Rue Santos Dumont", text: "Remonter la rue Santos Dumont en laissant l’usine Dasher sur votre droite jusqu’au rond-point suivant.", distance: "270 m" },
      { icon: "right", title: "Tourner à droite sur Rue Dieudonné Costes", text: "Le parking Alterpark de l’aéroport de Nantes se trouve à 40 m sur votre gauche.", distance: "40 m" },
    ],
  },
  {
    id: "depuis-le-nord",
    compass: "N",
    title: "Vous arrivez du nord ?",
    exit: "Sortie 51 – Porte de Grand Lieu",
    origin: "Porte de Grand Lieu, Bouguenais",
    steps: [
      { icon: "motorway", title: "Prendre la direction sud sur D85", text: "En arrivant sur le rond-point de l’aéroport de Nantes, prendre la sortie « Saint-Aignan-de-Grandlieu ».", distance: "2 km" },
      { icon: "roundaboutRight", title: "Au rond-point, prendre la 2e sortie sur Rue Charles Lindbergh", text: "À ce rond-point, prendre la 2e sortie, en face, toujours tout droit.", distance: "200 m" },
      { icon: "roundaboutLeft", title: "Au rond-point, prendre la 3e sortie sur Rue Santos Dumont", text: "Remonter la rue Santos Dumont en laissant l’usine Dasher sur votre droite jusqu’au rond-point suivant.", distance: "1,5 km" },
      { icon: "roundaboutRight", title: "Au rond-point, prendre la 2e sortie sur Rue Santos Dumont", text: "À ce rond-point, continuer tout droit, toujours sur la rue Santos Dumont.", distance: "400 m" },
      { icon: "roundaboutLeft", title: "Au rond-point, prendre la 3e sortie sur Rue Santos Dumont", text: "Remonter la rue Santos Dumont en laissant l’usine Dasher sur votre droite jusqu’au rond-point suivant.", distance: "270 m" },
      { icon: "right", title: "Tourner à droite sur Rue Dieudonné Costes", text: "Le parking Alterpark de l’aéroport de Nantes se trouve à 40 m sur votre gauche.", distance: "40 m" },
    ],
  },
];

export const ABOUT_PAGE = {
  title: "Votre voyage commence dès votre arrivée chez nous",
  intro: "Chez Alterpark, nous croyons que chaque voyage mérite de commencer sans stress et en toute sérénité. Depuis notre création, nous nous engageons à offrir aux voyageurs un service de parking près de l’aéroport simple, rapide et économique, tout en plaçant l’humain et l’environnement au cœur de notre démarche.",
  timelineTitle: "Alterpark, les dates clés !",
  timelineIntro: "Depuis sa création, ALTERPARK n’a cessé d’évoluer et d’innover pour offrir à ses clients un service de stationnement aéroportuaire toujours plus fiable, pratique et humain. Découvrez les grandes étapes qui ont jalonné notre histoire et qui ont forgé notre identité : des débuts pionniers aux nouveaux défis, en passant par les partenariats stratégiques et les évolutions technologiques.",
};

export type TimelineEntry = { month: string; year: string; paragraphs: string[]; bullets?: string[]; photo?: "entree" | "ombrieres" };

export const TIMELINE: TimelineEntry[] = [
  {
    month: "Mars",
    year: "2015",
    photo: "entree",
    paragraphs: [
      "Lancement de l’activité à partir de l’une de nos 3 agences nantaises de location de véhicules, située sur l’ancien site des Salins du Midi, à Saint-Aignan de Grandlieu. C’est la phase pionnière de la constitution de l’équipe au service de ses premiers clients et ce… H24 !",
      "La dépense d’énergie est considérable mais l’enthousiasme est là et les retours positifs de nos clients sont nos dividendes.",
    ],
  },
  {
    month: "Janvier",
    year: "2017",
    paragraphs: [
      "Le modèle économique a fait ses preuves et ALTERPARK intègre TEA Nantes, spécialiste de la logistique automobile (stockage, préparation et transport de véhicules), filiale du Groupe Charles André.",
      "TEA Nantes permet ainsi à ALTERPARK de renforcer son offre par la mise à disposition de ressources qualifiées et de moyens tels que des ateliers de préparation mécanique et carrosserie.",
    ],
  },
  {
    month: "Mars",
    year: "2020",
    paragraphs: ["De sinistre mémoire, cette date marque le coup d’arrêt d’une activité en pleine croissance. Le trafic aérien est totalement stoppé, la crise sanitaire frappe le monde et une longue période d’incertitude s’installe…"],
  },
  {
    month: "Avril",
    year: "2022",
    paragraphs: [
      "L’équipe ALTERPARK et son organisation ont été retenues par Aéroport Nantes Atlantique pour assurer la gestion opérationnelle de son nouveau parking P11 Navette et compléter ainsi sa capacité d’accueil en périodes de fortes affluences.",
      "Une desserte exclusive est mise en place. Elle permet aux clients P11 Navette et aux clients ALTERPARK de s’affranchir des contraintes de la dépose minute et d’accéder directement à l’aérogare, au pied du parking couvert, à l’abri d’éventuelles intempéries.",
    ],
  },
  {
    month: "Mars",
    year: "2024",
    photo: "ombrieres",
    paragraphs: ["ALTERPARK installe ses nouveaux locaux sur le site principal de TEA Nantes, bénéficiant ainsi d’infrastructures très nettement améliorées, tout en restant à 800 m de l’aéroport :"],
    bullets: [
      "Hall d’accueil plus vaste, plus confortable et plus chaleureux pour accueillir ses clients.",
      "Parking entièrement sous ombrières photovoltaïques et filets anti-grêle.",
      "Et toujours, la desserte exclusive au pied de l’aérogare.",
    ],
  },
  // « Juillet 2025 » is in the design, but its text repeats April 2022 word for word: it is left
  // out until the client sends the real text (docs/ROADMAP.md).
];

export const RALLYE_PAGE = {
  title: "Alterpark & le “Rallye du Cœur”",
  what: {
    title: "De quoi s’agit-il ?",
    intro: "Le Rallye du Cœur est un événement annuel à caractère caritatif dont l’objectif est double :",
    bullets: [
      "Collecter un maximum de dons pour financer la recherche contre les cancers pédiatriques.",
      "Faire vivre le temps d’une journée une parenthèse inoubliable à des enfants atteints d’un cancer ainsi que leurs proches.",
    ],
  },
  context: {
    title: "Le contexte ?",
    paragraphs: [
      "Chaque année en France, 2 500 familles sont touchées par l’une des 70 formes de cancers pédiatriques connues et 500 enfants en meurent.",
      "Insupportable ! Des chiffres « trop faibles » pour intéresser l’industrie pharmaceutique qui concentre l’essentiel de ses budgets sur la recherche contre les cancers des adultes. Le recours à des fonds privés est la seule alternative.",
    ],
  },
  commitment: {
    title: "L’engagement d’Alterpark",
    text: "Engagé en qualité de Partenaire Officiel depuis 2023, ALTERPARK et TEA NANTES contribuent activement et financièrement au succès de cet événement devenu incontournable à Nantes.",
  },
};
