# FeatureList

Liste d'atouts : pictogramme orange dans un carré teinté, titre en gras, texte de 16 px, sur une carte `surface-raised`.

**Origine :** Proposé pour la section application de l'accueil. Réutilisable pour les services, les formules et les pages tarifs.

## Quand l'utiliser

Pour 2 à 6 avantages courts et parallèles. Pour un processus ordonné, utilisez `Steps`.

## Variantes

| Prop | Rôle |
|---|---|
| `items` | `{icon, title, text}` ; `icon` : `bolt`, `ticket`, `gift`, `pin`, `shield`, `bus` |
| `columns` | `1` force une colonne ; sinon 2 colonnes dès 520 px de large |

## États

Survol : la carte remonte de 2 px et prend un liseré orange (désactivé si l'utilisateur réduit les animations). Les cartes ne sont pas cliquables.

## Responsive

Une colonne sous 520 px de conteneur, deux au-delà (`@container`).

## Règles de composition

- Titre de 2 à 4 mots, texte d'une phrase au vouvoiement.
- Nombre pair d'atouts sur deux colonnes, pour éviter une carte isolée.

## Exemple

```jsx
<FeatureList items={[{ icon: 'bolt', title: 'Réservation express', text: 'Votre place est réservée en 4 étapes.' }]} />
```
