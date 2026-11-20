# VideoModal

Fenêtre plein écran qui lit une vidéo YouTube : voile sombre flouté, titre en Crossroads, bouton fermer rond, lecteur 16:9 aux coins arrondis.

**Origine :** Proposé à la demande du client, pour le bouton lecture de la section « changements » (vidéo de présentation ALTERPARK).

## Quand l'utiliser

Ouvert depuis un `IconButton variant="play"`. Une vidéo à la fois.

## Variantes

| Prop | Rôle |
|---|---|
| `open`, `onClose` | affichage contrôlé par la page |
| `video` | lien YouTube (`youtu.be/…`, `watch?v=…`) ou identifiant |
| `title` | titre affiché et nom accessible |
| `embed` | force ou bloque le lecteur intégré ; par défaut, désactivé dans les aperçus sécurisés (claude.ai), où un lien « Regarder la vidéo sur YouTube » le remplace |

## États

- À l'ouverture : fondu du voile, apparition du lecteur avec un léger rebond, lecture automatique, défilement de la page bloqué, focus sur le bouton fermer.
- Pour fermer : Échap, clic sur le voile ou bouton fermer (pivote au survol). Le focus revient au bouton lecture.
- Lecteur `youtube-nocookie.com` (pas de cookie YouTube avant lecture), sans vidéos suggérées d'autres chaînes.

## Responsive

Largeur max 1040 px, 16:9 ; marges de 16 px en mobile.

## Exemple

```jsx
<VideoModal open={open} video="https://youtu.be/zrJMs72gTJg" title="Découvrez ALTERPARK" onClose={() => setOpen(false)} />
```
