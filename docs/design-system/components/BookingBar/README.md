# BookingBar

Barre de réservation orange : choix du parking par un interrupteur à deux positions (ALTERPARK ou ALTERECO, avec prix « dès »), départ et retour (date et heure), « Rechercher », suivie des arguments commerciaux puis, après la recherche, du choix entre les deux services.

**Origine :** Proposé à partir de la barre demandée par le client et de l'ancien système de réservation : services Parking ALTERPARK et ALTERECO, « Le plus demandé ! », « Paiement uniquement à votre retour », « Aucun coût caché », « Parking 7j/7 – 24h/24 ».

## Quand l'utiliser

Dans le hero de l'accueil (prop `booking` de `Hero`) et en tête de la page tarifs. Une fois par page.

## Variantes

| Prop | Rôle |
|---|---|
| `offers` | services proposés `{id, name, badge, highlight, features[]}` ; par défaut ALTERPARK (avec navette, mis en avant) et ALTERECO (sans navette, 15 min à pied) |
| `pricing(offre, jours, recherche)` | renvoie le prix TTC ; sans fonction, la carte affiche « Tarif à l'étape suivante » |
| `perks` | arguments sous la barre (`{icon, text}`) |
| `onSearch`, `onSelect` | reçoivent les dates, le nombre de jours, puis le service choisi et son prix |
| `continueHref` | lien « Continuer la réservation » affiché après le choix |
| `submitLabel` | défaut « Rechercher » : affiché avec la loupe en mobile, nom accessible du bouton rond (loupe seule) en desktop |
| `defaultService` | parking présélectionné ; par défaut celui qui porte `highlight` |
| offre `short`, `tagline`, `from` | nom court, sous-titre et prix de départ (« dès 45,00 € ») ; sans `pricing`, les cartes affichent « À partir de » ce prix |

## États

- Interrupteur du parking : groupe de boutons radio (flèches gauche/droite au clavier) ; une pastille blanche glisse sous l'option choisie. L'onglet et la carte de résultat restent synchronisés ; le choix est transmis à `onSearch`.

- Champs : survol et focus éclaircissent le champ, avec un contour blanc au focus. Le sélecteur natif de date et d'heure s'ouvre d'un clic sur tout le champ.
- Erreurs, annoncées et en rouge : dates manquantes, retour avant le départ.
- Résultats : récapitulatif des dates et du nombre de jours (jour entamé = jour compté), puis les deux cartes qui apparaissent l'une après l'autre. Le service mis en avant a un liseré orange et la pastille « Le plus demandé ! ». La carte choisie est entourée et son bouton passe à « Sélectionné ».

## Responsive

- Sous 900 px : la barre devient une carte orange, chaque date sur une ligne et le bouton pleine largeur.
- À partir de 900 px : une seule pilule, comme la maquette.
- Les deux services sont côte à côte à partir de 680 px.

## Règles de composition

- Les prix « dès » (45 € et 35 €) reprennent l'ancien système ; vérifiez-les. Le prix exact pour les dates choisies doit venir du moteur de tarifs (`pricing`).
- Gardez exactement deux services. Le plus vendu porte `highlight`.

## Exemple

```jsx
<Hero title="…" booking={<BookingBar pricing={(o, jours) => tarif(o.id, jours)} continueHref="/reservation" />} />
```
