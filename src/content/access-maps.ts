/*
 * Schematic access maps of the client designs « Plan accès » (Nantes, Roissy), redrawn as data so
 * the SVG stays sharp, uses the design tokens and is described in text. Coordinates follow the
 * client's drawings; nothing here is to scale.
 */

export type MapPlace = { x: number; y: number; label: string | string[]; side?: "left" | "right" | "below" };
/**
 * A blue sign (motorway exit, airport) with text above, below or beside it. `align: "end"` puts the
 * text on the left of the sign (beside) or right-aligns it with the sign (above / below).
 */
export type MapSign = { x: number; y: number; size?: number; above?: string[]; below?: string[]; beside?: string[]; align: "start" | "end" };

export interface AccessMapData {
  title: string;
  viewBox: [number, number];
  /** Minimum rendered width on phones (the map scrolls horizontally below it). */
  minWidth: number;
  road: { outer: number; inner: number };
  roads: string[];
  roundabouts: [number, number][];
  roundaboutRadius: number;
  route: string;
  /** Arrow heads [x, y, angle in degrees, 0 = pointing right]. */
  arrows?: [number, number, number][];
  places: MapPlace[];
  motorways: MapSign[];
  airport: MapSign;
  parkingSigns?: { x: number; y: number; label: string }[];
  badges?: { x: number; y: number; text: string }[];
  streets?: { x: number; y: number; text: string; rotate?: number }[];
  brand?: { pin: [number, number]; x: number; y: number; size: number };
  /** Filled areas (buildings, car parks) with an optional centred label. */
  areas?: { d: string; tone: "building" | "parking" | "parking-alt" | "zone" | "road"; label?: string[]; lx?: number; ly?: number }[];
  /** Free labels (e.g. « TERMINAL 1 »). */
  labels?: { x: number; y: number; text: string; strong?: boolean; ink?: boolean }[];
  /** Meeting point star with its label. */
  meeting?: { x: number; y: number; label: string[] };
  fontSize: number;
}

export const NANTES_MAP: AccessMapData = {
  title:
    "Plan d’accès schématique : Alterpark se trouve rue Dieudonné Costes à Saint-Aignan-de-Grandlieu, au sud-ouest de l’aéroport Nantes Atlantique, entre la sortie 51 (Porte de Grand Lieu, D85) et la sortie 50 (Porte de Retz, D823).",
  viewBox: [1500, 950],
  minWidth: 760,
  road: { outer: 30, inner: 26 },
  roads: [
    "M20 274H1410",
    "M550 274V100H752V274",
    "M750 274V400",
    "M40 400H750",
    "M750 400L1088 588L1420 760",
    "M185 400V780H20",
    "M20 588H1088",
    "M462 400V780",
    "M462 476H575M462 520H575",
    "M750 588V780",
    "M928 600V780",
  ],
  roundabouts: [[750, 274], [750, 400], [185, 400], [185, 588], [462, 588], [750, 588], [1088, 588]],
  roundaboutRadius: 27,
  route: "M1395 274H785M750 300V372M720 400H215M185 430V560M185 618V795H160M1400 748L1118 600M1058 588H780M720 588H492M432 588H215",
  places: [
    { x: 243, y: 347, label: "IDEA Group" },
    { x: 624, y: 350, label: "Dasher" },
    { x: 840, y: 382, label: "Oceania" },
    { x: 330, y: 453, label: "Tipiak" },
    { x: 515, y: 447, label: "HERTZ / Avis" },
    { x: 40, y: 548, label: "Bollore" },
    { x: 515, y: 541, label: "Groupe PLG" },
    { x: 945, y: 541, label: "IRT Jules Verne", side: "left" },
    { x: 1217, y: 572, label: "AIRBUS" },
    { x: 278, y: 633, label: "Val PG" },
    { x: 840, y: 635, label: "Daher", side: "below" },
    { x: 227, y: 746, label: "TEA Nantes" },
    { x: 968, y: 746, label: "Techno Campus" },
    { x: 1260, y: 717, label: "Un zest d’aroma", side: "below" },
  ],
  motorways: [
    { x: 1433, y: 275, above: ["Sortie 51", "Porte de Grand Lieu"], below: ["D85"], align: "end" },
    { x: 54, y: 400, above: ["D85"], below: ["St Aignan", "de Gd Lieu"], align: "start" },
    { x: 1432, y: 757, above: ["D823"], below: ["Sortie 50", "Porte de Retz"], align: "end" },
  ],
  airport: { x: 567, y: 43, beside: ["Aéroport Nantes", "Atlantique"], align: "start", size: 38 },
  parkingSigns: [
    { x: 810, y: 216, label: "P5 Nord" },
    { x: 445, y: 312, label: "P3 Sud" },
  ],
  brand: { pin: [148, 800], x: 64, y: 868, size: 40 },
  fontSize: 17,
};

export const ROISSY_MAP: AccessMapData = {
  title:
    "Plan d’accès schématique : Alterpark Roissy se trouve rue des Frères Lumière, dans la zone d’activités de Mitry-Mory, au sud de l’aéroport Paris-Charles de Gaulle, accessible par la sortie A104 Mitry-Mory / Villeparisis (D84) ou par la N1104 et la D9.",
  viewBox: [1710, 1370],
  minWidth: 900,
  road: { outer: 46, inner: 42 },
  roads: [
    "M1516 0V1345",
    "M30 351H1700",
    "M1516 104H1675M1675 0V200",
    "M392 677H1595",
    "M150 884L392 677",
    "M0 884H150",
    "M150 884L370 1072H1280V677",
    "M473 677V1225",
    "M725 677V1225",
    "M1045 677V1233",
    "M473 768H725",
    "M1045 1233H1585",
  ],
  roundabouts: [[1516, 104], [1675, 104], [1516, 247], [1516, 505], [1516, 675], [150, 884], [473, 1072], [725, 1072], [1045, 1072], [1045, 1233], [1516, 1233]],
  roundaboutRadius: 30,
  route:
    "M60 884H112M178 860L395 678H712M725 690V736M182 906L370 1072H436M473 1040V768H712M507 1072H688M725 1040V800M735 797H758M1675 22V66M1640 104H1556M1516 38V70M1516 138V212M1516 282V470M1672 351H1528M1516 540V640M1482 677H738M1516 1328V1270M1480 1233H1082M1045 1198V1108M1012 1072H762",
  arrows: [
    [112, 884, 0], [712, 677, 0], [725, 736, 90], [436, 1072, 0], [712, 768, 0], [688, 1072, 0], [758, 797, 0],
    [1675, 66, 90], [1556, 104, 180], [1516, 212, 90], [1516, 470, 90], [1528, 351, 180], [1516, 640, 90],
    [1516, 1270, -90], [1082, 1233, 180], [1045, 1108, -90], [762, 1072, 180],
  ],
  places: [
    { x: 1412, y: 218, label: "VOR PGS", side: "left" },
    { x: 1330, y: 408, label: ["Cimetière communal", "de Mitry-Bourg"], side: "left" },
    { x: 1287, y: 468, label: "PLURITECH", side: "left" },
    { x: 1455, y: 502, label: "Sports Field", side: "left" },
    { x: 1397, y: 560, label: "Evernex", side: "left" },
    { x: 1352, y: 620, label: ["DIMOTRANS", "Group"], side: "left" },
    { x: 1457, y: 620, label: ["DHL", "Solutions"], side: "left" },
    { x: 941, y: 602, label: "Sports Field", side: "left" },
    { x: 304, y: 663, label: "SUPER Mitry-Mory", side: "left" },
    { x: 198, y: 787, label: "McDonald’s", side: "left" },
    { x: 151, y: 966, label: "CDG Express", side: "left" },
    { x: 683, y: 721, label: "Agrana", side: "left" },
    { x: 857, y: 716, label: ["Cat R", "Formation"], side: "right" },
    { x: 1005, y: 762, label: "DUFOUR", side: "left" },
    { x: 1091, y: 721, label: "CDL", side: "right" },
    { x: 1435, y: 718, label: ["GENIAL", "TRANSPORT"], side: "left" },
    { x: 1237, y: 801, label: ["Entrepôt", "Darty"], side: "left" },
    { x: 887, y: 879, label: ["Transports", "Prevost"], side: "left" },
    { x: 615, y: 916, label: "Bio-Rad", side: "right" },
    { x: 768, y: 961, label: ["Transports", "Lucas Lefevre"], side: "right" },
    { x: 1001, y: 961, label: "Metro", side: "left" },
    { x: 683, y: 1021, label: "DEKRA", side: "left" },
    { x: 768, y: 1147, label: "Sansetsu France", side: "right" },
    { x: 422, y: 1188, label: "Le gabriel peri", side: "left" },
  ],
  motorways: [
    { x: 1460, y: 32, beside: ["Sortie N1104", "Mitry-Mory/Compans"], align: "end", size: 34 },
    { x: 1683, y: 276, beside: ["Sortie N2", "Claye-Souilly", "Mitry-Mory"], align: "end", size: 34 },
    { x: 16, y: 818, beside: ["Sortie A104", "Mitry-Mory", "Villeparisis"], align: "start", size: 34 },
  ],
  airport: { x: 1233, y: 134, beside: ["Aéroport", "Paris CDG"], align: "end", size: 34 },
  badges: [
    { x: 1675, y: 12, text: "D212" },
    { x: 1675, y: 195, text: "D83" },
    { x: 1405, y: 329, text: "N2" },
    { x: 1589, y: 677, text: "D9" },
    { x: 1045, y: 719, text: "D139E" },
    { x: 223, y: 849, text: "D84A4" },
    { x: 25, y: 884, text: "D84" },
    { x: 255, y: 1009, text: "D84" },
    { x: 473, y: 1218, text: "D139" },
    { x: 1516, y: 1350, text: "D212" },
  ],
  streets: [
    { x: 598, y: 668, text: "Rue de Juilly" },
    { x: 598, y: 762, text: "Rue Gustave Eiffel" },
    { x: 600, y: 1090, text: "Rte. de la gare" },
    { x: 888, y: 1066, text: "Rue Marcellin Berthelot" },
    { x: 268, y: 770, text: "Rue de Villeparisis", rotate: -40 },
    { x: 466, y: 885, text: "Av. du 8 mai 1945", rotate: -90 },
    { x: 718, y: 885, text: "Rue des Frères Lumière", rotate: -90 },
    { x: 1049, y: 880, text: "Rue Isaac Newton", rotate: -90 },
    { x: 1284, y: 882, text: "Rue Mercier", rotate: -90 },
  ],
  brand: { pin: [772, 795], x: 790, y: 792, size: 22 },
  fontSize: 14,
};

/**
 * Marseille Provence, Terminal 1: redrawn from the client's meeting-point plan (car parks, hall A and
 * hall B arrivals, Dépose Express, walking routes to the meeting point). Not to scale.
 */
export const MARSEILLE_MAP: AccessMapData = {
  title:
    "Plan schématique du Terminal 1 de l’aéroport Marseille Provence : depuis les arrivées des halls A et B, suivre le trottoir le long de la Dépose Express jusqu’au point de rencontre, devant la zone loueurs (Hertz, Europcar, Avis…), à côté du parking PB Minute.",
  viewBox: [1080, 662],
  minWidth: 720,
  road: { outer: 24, inner: 20 },
  roads: ["M335 300H820", "M235 300V662", "M510 300V430H640V560", "M662 560H700"],
  roundabouts: [[640, 560]],
  roundaboutRadius: 20,
  route: "M350 232V300L378 322M545 228V274H352",
  arrows: [[350, 270, 90], [545, 252, 90], [450, 274, 180], [378, 322, 38]],
  areas: [
    { d: "M90 140L300 50L325 75L190 130H800V245H560V225H330V245H110Z", tone: "building" },
    { d: "M880 130H1080V245H880Z", tone: "building" },
    { d: "M430 234H510V262H430Z", tone: "zone", label: ["Taxi"], lx: 470, ly: 248 },
    { d: "M120 252H325V292H120Z", tone: "parking-alt", label: ["P6 Premium"], lx: 222, ly: 272 },
    { d: "M830 280H1080V320H830Z", tone: "zone", label: ["Gare routière"], lx: 955, ly: 300 },
    { d: "M245 322H380V440H245Z", tone: "parking", label: ["PB", "Minute"], lx: 312, ly: 381 },
    { d: "M392 322H500V410H392Z", tone: "zone", label: ["Zone", "loueurs"], lx: 446, ly: 366 },
    { d: "M522 322H680V410H522Z", tone: "parking-alt", label: ["P1", "Premium"], lx: 601, ly: 366 },
    { d: "M690 322H790V410H690Z", tone: "parking", label: ["PA", "Minute"], lx: 740, ly: 366 },
    { d: "M40 330H220V520H40Z", tone: "zone", label: ["Parc", "croisiéristes"], lx: 130, ly: 425 },
    { d: "M700 440H1080V662H700Z", tone: "parking", label: ["P3", "Eco"], lx: 890, ly: 551 },
    { d: "M250 590H560V662H250Z", tone: "parking-alt", label: ["P7"], lx: 405, ly: 626 },
  ],
  labels: [
    { x: 560, y: 168, text: "TERMINAL 1", strong: true, ink: true },
    { x: 980, y: 193, text: "TERMINAL 2", strong: true, ink: true },
    { x: 220, y: 205, text: "Hall B", strong: true, ink: true },
    { x: 700, y: 205, text: "Hall A", strong: true, ink: true },
    { x: 350, y: 220, text: "Arrivées", ink: true },
    { x: 545, y: 215, text: "Arrivées", ink: true },
    { x: 640, y: 305, text: "DÉPOSE EXPRESS" },
  ],
  places: [{ x: 610, y: 620, label: ["Station", "Total"], side: "right" }],
  motorways: [],
  airport: { x: 60, y: 60, beside: ["Aéroport", "Marseille Provence"], align: "start", size: 34 },
  meeting: { x: 390, y: 335, label: ["Point de rencontre", "Meeting point"] },
  fontSize: 15,
};
