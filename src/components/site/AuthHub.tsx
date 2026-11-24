import Image from "next/image";
import { accentTitle } from "@/components/ui/lib/accent-title";
import { assets } from "@/components/ui/lib/assets";
import { LoginForm, RegisterForm } from "@/components/site/AuthForms";
import { LineIcon, type LineIconName } from "@/components/site/pages/LineIcon";

/*
 * Sign-in and sign-up on one page (client design « Connexion »): a compact welcome band with the
 * account benefits, then two cards — « Déjà client ? » and « Première réservation ? ».
 */
const PERKS: { icon: LineIconName; text: string }[] = [
  { icon: "card", text: "Paiement en ligne ou sur place à votre retour" },
  { icon: "calendar", text: "Annulation gratuite jusqu’à 24 h avant l’arrivée" },
  { icon: "file", text: "Vos réservations et paiements au même endroit" },
];

export function AuthHub() {
  return (
    <>
      <section className="ap-root acc-band auth-band" aria-labelledby="auth-title">
        <div className="acc-band__bg" aria-hidden>
          <Image src={assets.servicesHeroPhoto.src} width={assets.servicesHeroPhoto.width} height={assets.servicesHeroPhoto.height} alt="" sizes="100vw" quality={50} preload />
        </div>
        <div className="page-wrap auth-band__inner">
          <p className="acc-id__hello">Espace client</p>
          <h1 id="auth-title" className="display ap-display">{accentTitle("Réservez votre place en quelques clics !")}</h1>
          <p className="auth-band__intro">Votre parking à proximité de l’aéroport de Nantes : connectez-vous ou créez votre compte en une minute.</p>
          <ul className="auth-perks">
            {PERKS.map((p) => (
              <li key={p.text}>
                <LineIcon name={p.icon} />
                {p.text}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="page-wrap auth-hub">
        <section className="auth-card" id="connexion" aria-labelledby="login-title">
          <header className="auth-card__head">
            <span className="auth-card__ico"><LineIcon name="user" /></span>
            <div>
              <h2 id="login-title" className="h2 ap-h2">{accentTitle("Déjà client ?")}</h2>
              <p>Connectez-vous pour retrouver vos réservations.</p>
            </div>
          </header>
          <LoginForm standalone={false} />
        </section>
        <section className="auth-card" id="inscription" aria-labelledby="register-title">
          <header className="auth-card__head">
            <span className="auth-card__ico"><LineIcon name="plus" /></span>
            <div>
              <h2 id="register-title" className="h2 ap-h2">{accentTitle("Première réservation ?")}</h2>
              <p>Créez votre compte : il vous servira pour toutes vos réservations.</p>
            </div>
          </header>
          <RegisterForm standalone={false} />
        </section>
      </div>
    </>
  );
}
