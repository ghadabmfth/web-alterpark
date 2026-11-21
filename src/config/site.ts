/*
 * Company contact details shown in the header drawer and the footer.
 * Values come from the supplied design system (Nantes site). Phase 7 moves them to AppSetting so
 * staff can edit them in the back office; components receive them as props, never hard-coded.
 */
export const siteContact = {
  phone: "02 40 731 237",
  email: "contact@alterpark.fr",
  address: ["1 Rue Dieudonné Costes", "44860 Saint-Aignan-de-Grandlieu"],
} as const;

export type SiteContact = {
  phone: string;
  email: string;
  address: readonly string[];
};

/** "02 40 731 237" → "tel:0240731237" */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}
