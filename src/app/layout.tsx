import type { Metadata, Viewport } from "next";
import "./globals.css";
import { tokenValue } from "@/design-system/tokens";
import { CircleFx } from "@/components/ui/CircleFx";
import { siteIndexable, siteName, siteUrl } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName} — Parkings aéroport Nantes, Marseille, Paris-Roissy`, template: `%s | ${siteName}` },
  description: "Parkings sécurisés à proximité des aéroports de Nantes, Marseille et Paris-Roissy : réservation en ligne, navette gratuite, paiement sécurisé.",
  applicationName: siteName,
  // Indexable only in Production at launch (SITE_INDEXABLE=true); never on Preview.
  robots: siteIndexable ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: tokenValue("surface"),
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <body className="min-h-dvh">
        <a href="#contenu" className="sr-only rounded-md bg-surface-raised p-3 text-text-primary focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-1000">
          Aller au contenu
        </a>
        {/* Typed titles stay readable without JavaScript. */}
        <noscript>
          <style>{".ap-type__c{opacity:1}.ap-type__caret{display:none}"}</style>
        </noscript>
        <CircleFx />
        {children}
      </body>
    </html>
  );
}
