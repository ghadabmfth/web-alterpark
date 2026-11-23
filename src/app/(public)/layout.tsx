import { Header } from "@/components/ui/navigation/Header";
import { Footer } from "@/components/ui/navigation/Footer";
import { SocialRail } from "@/components/ui/navigation/SocialRail";
import { RatingBadge } from "@/components/ui/content/RatingBadge";
import { googleRating, legalLinks, routes } from "@/config/site";
import { copyrightYear, publicNav, socialItems } from "./chrome";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const [links, year] = await Promise.all([publicNav(), copyrightYear()]);
  const social = socialItems();
  return (
    <>
      <div className="ap-site-top">
        <Header
          links={links}
          cta={{ label: "Réservez ma place !", href: routes.booking }}
          logoBadge={<RatingBadge count={googleRating.count} rating={googleRating.rating} size="mini" />}
          sticky
        />
      </div>
      <SocialRail items={social} />
      <main id="contenu">{children}</main>
      <Footer legalLinks={legalLinks} social={social} year={year} />
    </>
  );
}
