# Header

En-tête du site : filet orange de 10 px, navigation en deux moitiés autour du logo centré ; burger et panneau en mobile.

**Origine :** Desktop observé (6 liens Montserrat Bold 20 blancs, logo 194 × 109 au centre, filet `primary`) ; logo réduit à 135 px et liens à 16 px à la demande du client. État actif, sous-menu, version mobile proposés.

## Quand l'utiliser

Une fois par page, en haut. Posé sur la photo du hero (fond transparent) ou sur `surface`.

## Variantes

| Prop | Rôle |
|---|---|
| `links` | liste `{label, href, active, children}` — la première moitié va à gauche du logo |
| `cta` | bouton en bas du menu mobile |
| `logoSrc` | logo (défaut : `assets/Logos/alterpark-logo.svg`) |
| `logoBadge` | contenu affiché sous le logo au survol et au focus (desktop uniquement), ex. `<RatingBadge size="mini" … />` |
| `sticky` | se fixe en haut, opaque et compact, après `stickyOffset` px de défilement (160 par défaut) |

## États

Lien : Default blanc · Hover `primary-hover` · Actif (`aria-current="page"`) `primary` + soulignement 2 px · Focus `shadow-focus`. Sous-menu : `surface-raised`, `shadow-elevated`, fermeture par Échap ou clic extérieur. Burger : croix quand ouvert.

## Responsive

Basé sur la largeur du conteneur (`@container`) :
- ≥ 1024 px : marges haute et basse égales (`space-6`), logo centré (135 px ; 120 px sous 1280 px), liens regroupés de part et d'autre du logo (`space-8` d'écart), 16 px puis 15 px sous 1280 px.
- < 1024 px : logo à gauche (110 px), burger à droite. Le menu est un panneau qui glisse depuis la droite (88 % de l'écran, 400 px max) sur un voile flouté : logo et bouton fermer, liens qui apparaissent l'un après l'autre, sous-menus en accordéon, bouton `cta` pleine largeur et contact en bas. Fermeture : bouton, voile, Échap ou choix d'un lien ; la page ne défile pas pendant l'ouverture.

## Règles de composition

- 6 liens au maximum, nombre pair de préférence pour équilibrer le logo.
- Le logo est un lien vers l'accueil.

## Exemple

```jsx
<Header links={[{label:'Accueil',href:'/',active:true},{label:'Comment ça marche ?',href:'/fonctionnement'},{label:'Nos tarifs',href:'/tarifs'},{label:'Services Plus',children:[{label:'Lavage',href:'/services/lavage'}]},{label:'Plan accès',href:'/acces'},{label:'Contactez-nous',href:'/contact'}]} cta={{label:'Réservez ma place !',href:'/reservation'}} />
```
