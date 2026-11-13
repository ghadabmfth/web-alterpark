import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CircleFx } from "@/components/lib/CircleFx";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "ALTERPARK", template: "%s | ALTERPARK" },
};

export const viewport: Viewport = {
  themeColor: "#313131",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        {/* Sans JavaScript, les titres tapés (TypeTitle) restent lisibles. */}
        <noscript>
          <style>{".ap-type__c{opacity:1}.ap-type__caret{display:none}"}</style>
        </noscript>
        <CircleFx />
        {children}
      </body>
    </html>
  );
}
