import { assets, type BrandImage } from "@/components/ui/lib/assets";
import { siteContact } from "@/config/site";
import { NANTES_MAP, ROISSY_MAP, type AccessMapData } from "./access-maps";
import { NANTES_ROUTES, type AccessRoute } from "./pages-content";

/*
 * « Plan accès » of the three sites (client designs, Nov. 2026). Only what the client supplied:
 * Marseille has a meeting-point plan but no road itinerary yet; Roissy's street number, phone and
 * hours are unknown (docs/ROADMAP.md).
 */
export type AccessSlug = "nantes" | "marseille" | "paris-roissy";

export interface AccessSite {
  slug: AccessSlug;
  /** Short name in the site switcher. */
  label: string;
  name: string;
  title: string;
  intro: string;
  heroImage: BrandImage;
  /** Destination given to Google Maps / Waze. */
  destination: string;
  addressLines: string[];
  hours?: string;
  phone?: string;
  map?: AccessMapData;
  meetingPoint?: { image: BrandImage; alt: string; title: string; text: string; steps: string[] };
  routes: AccessRoute[];
  tips: string[];
}

const DISCLAIMER =
  "L’itinéraire indiqué est donné à titre informatif et peut varier en fonction des conditions de circulation, des travaux ou des déviations. Assurez-vous de respecter le code de la route et la signalisation en vigueur.";

const ROISSY_ROUTES: AccessRoute[] = [
  {
    id: "depuis-le-nord",
    compass: "N",
    title: "Vous arrivez du nord ?",
    exit: "Sortie A104 – Mitry-Mory / Villeparisis",
    origin: "A104 sortie 5, Mitry-Mory",
    steps: [
      { icon: "motorway", title: "Prendre la direction sud-est sur l’A104", text: "Rejoindre la Francilienne A104 en direction de Mitry-Mory / Villeparisis et continuer quelques mètres jusqu’à la sortie suivante.", distance: "80 m" },
      { icon: "right", title: "Prendre la sortie 5 vers Mitry-Mory / Villeparisis-Gare", text: "Quitter l’A104 par la sortie 5 en direction de Mitry-Mory / Villeparisis-Gare.", distance: "300 m" },
      { icon: "roundaboutLeft", title: "Au rond-point, prendre la 3e sortie sur la D84", text: "Au premier rond-point, emprunter la 3e sortie afin de rejoindre la D84 en direction de Mitry-Mory.", distance: "270 m" },
      { icon: "roundaboutRight", title: "Au rond-point, prendre la 1re sortie et continuer sur la D84", text: "Continuer tout droit sur la D84 en suivant la direction centre-ville / zones d’activités.", distance: "950 m" },
      { icon: "roundaboutRight", title: "Au rond-point, prendre la 2e sortie et continuer sur la D84", text: "Rester sur la D84 en poursuivant vers Mitry-Mory.", distance: "1,2 km" },
      { icon: "right", title: "Tourner légèrement à droite pour continuer sur la D84", text: "Suivre la courbe de la route et rester sur la D84 en direction des zones d’activités.", distance: "35 m" },
      { icon: "roundaboutRight", title: "Au rond-point, prendre la 2e sortie sur la Route de la Gare", text: "Prendre la Route de la Gare en direction de N2 / Compans / Dammartin-en-Goële.", distance: "240 m" },
      { icon: "roundaboutLeft", title: "Au rond-point, prendre la 3e sortie sur la Rue des Frères Lumière", text: "Entrer dans la zone d’activités par la Rue des Frères Lumière, où se situe Alterpark Roissy.", distance: "550 m" },
    ],
  },
  {
    id: "depuis-le-sud",
    compass: "S",
    title: "Vous arrivez du sud ?",
    exit: "Sortie N1104 – Mitry-Mory / Compans",
    origin: "N1104 Compans",
    steps: [
      { icon: "motorway", title: "Prendre la direction sud-ouest", text: "Se diriger vers la route principale en suivant la direction Mitry-Mory / Claye-Souilly.", distance: "92 m" },
      { icon: "right", title: "Prendre légèrement à droite vers D212 / Claye-Souilly / Mitry-Mory", text: "Suivre la bretelle en direction de D212 – Claye-Souilly / Mitry-Mory.", distance: "450 m" },
      { icon: "motorway", title: "Rejoindre la N1104", text: "S’insérer sur la N1104 en direction de Mitry-Mory / Compans. Rester sur la voie de gauche en suivant la direction Mitry-Mory / zones d’activités.", distance: "750 m" },
      { icon: "roundaboutRight", title: "Au rond-point, prendre la 1re sortie sur la D212", text: "Au rond-point, emprunter la 1re sortie pour rejoindre la D212.", distance: "700 m" },
      { icon: "right", title: "Prendre la sortie D9 en direction de Mitry-Mory / Compans / ZI Mitry-Compans", text: "Quitter la D212 en suivant la direction D9 – Mitry-Mory / Compans / Zone Industrielle Mitry-Compans.", distance: "280 m" },
      { icon: "roundaboutRight", title: "Au rond-point, prendre la 2e sortie sur la D9", text: "Continuer sur la D9 en direction de Mitry-Mory.", distance: "2,4 km" },
      { icon: "left", title: "Tourner légèrement à gauche sur la Rue des Frères Lumière", text: "Suivre les panneaux A104 / Villeparisis / Mitry-Mory pour rejoindre la Rue des Frères Lumière, où se situe Alterpark Roissy.", distance: "450 m" },
    ],
  },
];

export const ACCESS_SITES: AccessSite[] = [
  {
    slug: "nantes",
    label: "Nantes",
    name: "ALTERPARK Nantes Atlantique",
    title: "Comment rejoindre Alterpark ? Accès à notre parking près de l’aéroport de Nantes !",
    intro: DISCLAIMER,
    heroImage: assets.heroPhoto,
    destination: "1 Rue Dieudonné Costes, 44860 Saint-Aignan-de-Grandlieu",
    addressLines: [...siteContact.address],
    hours: "7 jours/7 et 24h/24",
    phone: siteContact.phone,
    map: NANTES_MAP,
    routes: NANTES_ROUTES,
    tips: [
      "Présentez-vous à l’accueil avec votre référence de réservation.",
      "Comptez environ 15 minutes entre l’accueil et votre arrivée au terminal (hors périodes d’affluence).",
      "À votre retour, appelez-nous depuis la desserte : la navette vient vous chercher en quelques minutes.",
    ],
  },
  {
    slug: "marseille",
    label: "Marseille",
    name: "ALTERPARK Marseille Provence",
    title: "Comment rejoindre Alterpark - Marseille ? Notre point de rencontre à l’aéroport Marseille Provence !",
    intro: "Retrouvez notre équipe au point de rencontre indiqué sur le plan, au Terminal 1 de l’aéroport Marseille Provence.",
    heroImage: assets.heroPhoto,
    destination: "Aéroport Marseille Provence, Terminal 1, 13700 Marignane",
    addressLines: ["Aéroport Marseille Provence", "Terminal 1 – zone loueurs"],
    meetingPoint: {
      image: { src: "/brand/photos/marseille-point-de-rencontre.webp", width: 1080, height: 662 },
      alt: "Plan du Terminal 1 de l’aéroport Marseille Provence : depuis les arrivées des halls A et B, suivre les flèches le long de la Dépose Express jusqu’au point de rencontre, devant la zone loueurs (Hertz, Europcar, Avis…), à côté du parking PB Minute.",
      title: "Le point de rencontre",
      text: "Le point de rencontre se trouve au Terminal 1, devant la zone des loueurs de voitures (Hertz, Europcar, Avis…), à côté du parking PB Minute.",
      steps: [
        "Depuis les arrivées du hall A ou du hall B, sortez du terminal.",
        "Longez la Dépose Express en direction du hall B, comme indiqué par les flèches.",
        "Le point de rencontre est devant la zone loueurs, à côté du parking PB Minute.",
      ],
    },
    routes: [],
    tips: [],
  },
  {
    slug: "paris-roissy",
    label: "Roissy",
    name: "ALTERPARK Roissy",
    title: "Comment rejoindre Alterpark - Roissy ? Accès à notre parking près de l’aéroport de Roissy !",
    intro: DISCLAIMER,
    heroImage: assets.heroPhoto,
    destination: "Rue des Frères Lumière, 77290 Mitry-Mory",
    addressLines: ["Rue des Frères Lumière", "77290 Mitry-Mory"],
    map: ROISSY_MAP,
    routes: ROISSY_ROUTES,
    tips: [],
  },
];

export function accessSite(slug: string): AccessSite | undefined {
  return ACCESS_SITES.find((s) => s.slug === slug);
}
