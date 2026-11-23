import { AuthHub } from "@/components/site/AuthHub";
import { pageMetadata } from "@/components/seo/metadata";
import { routes } from "@/config/site";

export const metadata = pageMetadata({ title: "Connexion", description: "Connectez-vous ou créez votre compte pour réserver et retrouver vos réservations.", path: routes.login, noindex: true });

/* Same page as the other entry point (client design « Connexion »): sign-in and sign-up side by side. */
export default function Page() {
  return <AuthHub />;
}
