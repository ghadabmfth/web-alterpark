/**
 * 45 → "45,00 €" (bundle `bkEuro` / `fmtPrice`). Amounts in euros, for display only.
 * A no-break space keeps "€" with its amount (French typography); fr-FR already groups
 * thousands with a narrow no-break space.
 */
export function formatEuro(amount: number): string {
  return `${amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\u00a0€`;
}

/** Integer cents → "45,00 €". Use this for every amount coming from the database. */
export function formatCents(cents: number): string {
  return formatEuro(cents / 100);
}
