import { Header } from "@/components/ui/navigation/Header";
import { Footer } from "@/components/ui/navigation/Footer";
import { SocialRail } from "@/components/ui/navigation/SocialRail";
import { legalLinks, routes } from "@/config/site";
import { copyrightYear, publicNav, socialItems } from "./chrome";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const [links, year] = await Promise.all([publicNav(), copyrightYear()]);
  const social = socialItems();
  return (
    <>
      <Header links={links} cta={{ label: "Réservez ma place !", href: routes.booking }} sticky />
      <SocialRail items={social} />
      <main id="contenu">{children}</main>
      <Footer legalLinks={legalLinks} social={social} year={year} />
    </>
  );
}
