import { Hero } from "@/components/ui/patterns/Hero";
import { accentTitle } from "@/components/ui/lib/accent-title";
import { assets } from "@/components/ui/lib/assets";
import { Button } from "@/components/ui/actions/Button";
import { LoginForm, RegisterForm } from "@/components/site/AuthForms";
import { routes } from "@/config/site";

/*
 * Sign-in and sign-up on one page (client design « Connexion »): « Déjà client ? » on the left,
 * « Première réservation ? » on the right, separated by a dashed rule on large screens.
 */
export function AuthHub() {
  return (
    <>
      <Hero
        id="auth-title"
        typing={false}
        image={assets.servicesHeroPhoto}
        title="Réservez votre place de parking en quelques clics ! Avec votre parking à proximité de l’aéroport de Nantes"
        intro="Vous partez en voyage et cherchez une solution de stationnement pratique, économique et sécurisée ? Alterpark vous offre un service de réservation rapide et flexible : payez en ligne ou sur place à votre retour."
      >
        <Button href={routes.services}>Découvrez nos services +</Button>
      </Hero>
      <div className="ap-page">
        <section className="page-wrap auth-hub">
          <div className="auth-hub__col" id="connexion">
            <h2 className="h2 ap-h2 text-center">{accentTitle("Déjà client ?")}</h2>
            <LoginForm standalone={false} />
          </div>
          <div className="auth-hub__col" id="inscription">
            <h2 className="h2 ap-h2 text-center">{accentTitle("Première réservation ?")}</h2>
            <RegisterForm standalone={false} />
          </div>
        </section>
      </div>
    </>
  );
}
