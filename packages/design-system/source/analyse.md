# Analyse du prototype

## Source

- **Fichier Figma « Alterpark »**, page « Accueil » : 1920 × 5690 px, desktop uniquement, export du 5 novembre 2026. C'est la seule page fournie.
- **Prototype XD « Flow 1 »** : 5 écrans, inaccessible depuis l'environnement de travail. Les 4 autres écrans ne sont pas couverts.
- **Police CROSSROADS PERSONAL USE** fournie par le client. Licence personnelle : le site n'est pas destiné à être mis en ligne avec cette police.

## Structure de la page d'accueil

| # | Section | Hauteur | Composants |
|---|---|---|---|
| 1 | Header + hero | 1008 | Header, Hero, Steps (hero), Button, SocialRail |
| 2 | « Que de changements… » | 793 | MediaSection, photos, RatingBadge, IconButton play, Button |
| 3 | Rallye du Cœur | 783 | Banner, Button |
| 4 | Fidélité | 685 | SectionHeading + sous-titres, Steps (loyalty), Button |
| 5 | Application mobile | 737 | MediaSection inversée, StoreBadges |
| 6 | Avis Google | 617 | SectionHeading centré, RatingBadge, ReviewCarousel, Button |
| 7 | Footer | 111 | Footer |

## Valeurs relevées

- **Couleurs :** #313131, #F6921E, #F05A28 (logo seul), #F6BB04 (étoiles), #FFFFFF. Gris de la voiture du logo : #585C61, #7A7A7E, #A2A1A3, #CAC8C9, #F5F5F6, #231F20 (hors interface). Voile : #313131 de 100 % à 55 %. Chiffres fantômes : blanc à 16 %.
- **Typographie :** voir les tokens de type. Polices : Crossroads, Montserrat (300, 400, 700, 800), Nunito (300, 800, 900), Font Awesome 6 Pro (étoiles et icônes sociales), Inter (quelques espaces, sans effet visible).
- **Rayons :** 10, 15, 20, 33 et 43 (pilule sur 64 px de haut).
- **Ombres :** 0 3 6 blanc 100 % (photos) ; 0 3 6 blanc 20 % + intérieure 0 3 6 blanc (onglets).
- **Traits :** 1 px pointillé 3/5 (séparateurs) ; 3 px (badge).
- **Grille :** marges 127 px, contenu 1666 px, navigation 1499 px.

## Incohérences relevées et décisions

| Constat | Décision |
|---|---|
| Texte blanc sur bouton orange : 2,32:1 (WCAG AA non atteint) | Valeur conservée (`on-primary`), signalée ; correctif en un token (#313131) |
| Flèche des boutons orange sur fond orange, donc invisible | Non reprise |
| Crossroads sans ponctuation, chiffres en filigrane ; le fichier compense à la main avec Montserrat et Inter | Remplacement automatique par Montserrat 800 (`unicode-range`) |
| Écart entre sections de 120 à 180 px, sans règle | Unifié : `space-30` (120), `space-40` après le hero |
| Padding horizontal des boutons de 40 à 46 px | `space-10` (40) |
| Interligne du texte courant de 40 ou 30 px pour la même taille | `body` (40) et `body-compact` (30) distincts, usages documentés |
| Nunito ponctuel à côté de Montserrat | Conservé et limité à trois styles |
| Halo blanc à 100 % sous les photos | Conservé (`shadow-photo`), à adoucir si besoin |
| Titres : mots Crossroads blancs, ponctuation et chiffres orange (styles mélangés à la main) | Automatisé par `accentTitle()` dans `SectionHeading` et `Hero` |
| Logo dessiné avec des découpes en #313131 | Utilisable sur `surface` uniquement |
| Font Awesome 6 Pro (payant) | Tracés exportés en SVG ; aucune police requise |

## Non couvert par la source

États interactifs, version mobile, formulaires, alertes, modale, fil d'Ariane, accordéon, couleurs de statut, points de rupture, z-index et durées : tout cela est **proposé** et marqué comme tel. Les 4 autres écrans du XD pourront ajouter des composants (tunnel de réservation, grille tarifaire, plan d'accès, formulaire de contact).
