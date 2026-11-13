# @alterpark/design-system

Source : design system AlterPark (artifact Claude `cee36d02-…`).

| Fichier | Rôle |
|---|---|
| `tokens.css` | Copie de `tokens.css` du système. Seule modification : `url("fonts/…")` devient `url("/fonts/…")`, servi depuis `apps/web/public/fonts`. |
| `decisions.css` | Arbitrages entre le README et `tokens.json` (`docs/DECISIONS.md`, ADR-004). |
| `tokens.json` | Source des tokens, pour l'outillage. |
| `source/` | Bundle d'origine (`bundle.js`, `bundle.css`, `index.d.ts`) et documentation. **Référence de portage uniquement**, jamais chargée par Next.js. |

Phase 2 : les composants sont portés en TSX dans `apps/web/src/components/` (classes `ap-*` et props de `index.d.ts` conservées), React 19, rendu serveur quand c'est possible.

## Polices

Montserrat (SIL Open Font License) est versionnée. **Crossroads ne l'est pas** : la version fournie est sous licence « personal use », interdite pour un site commercial et a fortiori dans un dépôt public. Après achat de la licence commerciale web, déposer le fichier dans `apps/web/public/fonts/Crossroads-Regular.ttf`. Sans lui, les titres retombent sur Montserrat.
