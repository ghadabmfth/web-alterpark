/* Formats français partagés (montants en centimes entiers, comme l'API du plugin). */

const EUR = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 4560 → « 45,60 € » (même format que bkEuro / fmtPrice du bundle). */
export function formatEuros(cents: number): string {
  return `${EUR.format(cents / 100)} €`;
}

/** « 1 jour », « 8 jours ». */
export function formatDays(days: number): string {
  return `${days} ${days > 1 ? "jours" : "jour"}`;
}
