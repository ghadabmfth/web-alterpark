import type { Metadata, Viewport } from "next";
import "./globals.css";
import { tokenValue } from "@/design-system/tokens";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "ALTERPARK", template: "%s | ALTERPARK" },
  description: "Parkings aéroport à Nantes, Marseille et Paris-Roissy.",
  // Not indexable until launch (Phase 9): Preview deployments must never reach search engines.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: tokenValue("surface"),
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
