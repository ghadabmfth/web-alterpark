import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "./gallery.css";

import { Button } from "@/components/actions/Button/Button";
import { IconButton } from "@/components/actions/IconButton/IconButton";
import { Header } from "@/components/navigation/Header/Header";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs/Breadcrumbs";
import { SocialRail } from "@/components/navigation/SocialRail/SocialRail";
import { Footer } from "@/components/navigation/Footer/Footer";
import { SectionHeading } from "@/components/content/SectionHeading/SectionHeading";
import { Steps } from "@/components/content/Steps/Steps";
import { Stars } from "@/components/content/Stars/Stars";
import { RatingBadge } from "@/components/content/RatingBadge/RatingBadge";
import { ReviewCard } from "@/components/content/ReviewCard/ReviewCard";
import { ReviewCarousel } from "@/components/content/ReviewCarousel/ReviewCarousel";
import { StoreBadges } from "@/components/content/StoreBadges/StoreBadges";
import { Accordion } from "@/components/content/Accordion/Accordion";
import { ServiceCard } from "@/components/content/ServiceCard/ServiceCard";
import { Highlights } from "@/components/content/Highlights/Highlights";
import { TextField } from "@/components/forms/TextField/TextField";
import { Select } from "@/components/forms/Select/Select";
import { Checkbox } from "@/components/forms/Checkbox/Checkbox";
import { Toggle } from "@/components/forms/Toggle/Toggle";
import { Alert } from "@/components/feedback/Alert/Alert";
import { Modal } from "@/components/feedback/Modal/Modal";
import { Hero } from "@/components/patterns/Hero/Hero";
import { MediaSection } from "@/components/patterns/MediaSection/MediaSection";
import { Banner } from "@/components/patterns/Banner/Banner";
import { FeatureList } from "@/components/patterns/FeatureList/FeatureList";
import { AppShowcase } from "@/components/patterns/AppShowcase/AppShowcase";
import { SvgIcon } from "@/components/icons/SvgIcon";
import { SYSTEM_SVGS, type SystemIconName } from "@/components/icons/system-icons.data";
import { BookingStepper } from "@/components/booking/BookingStepper/BookingStepper";
import { OfferCard } from "@/components/booking/OfferCard/OfferCard";
import { OfferList } from "@/components/booking/OfferList/OfferList";
import { BookingSummary } from "@/components/booking/BookingSummary/BookingSummary";
import { PaymentPanel } from "@/components/booking/PaymentPanel/PaymentPanel";
import { BookingConfirmation } from "@/components/booking/BookingConfirmation/BookingConfirmation";
import { BookingLoading, BookingNotice, type BookingNoticeKind } from "@/components/booking/BookingState/BookingState";
import { BookingBarDemo, CustomerFormDemo, DateFieldErrorsDemo, ModalDemo, OfferListDemo, RadioDemo, SearchFormDemo, VideoDemo } from "./demos";
import { heroSteps, loyaltySteps, navLinks, priceLines, quotes, reviews, stay } from "./fixtures";

/* Galerie de développement : chaque composant et ses états. Non indexée, 404 hors développement. */
const IS_PROD = process.env.NODE_ENV === "production";

export const metadata: Metadata = {
  ...(IS_PROD ? {} : { title: "Galerie du design system" }),
  robots: { index: false, follow: false, nocache: true },
};

const SECTIONS = [
  ["icones", "Icônes"],
  ["actions", "Actions"],
  ["navigation", "Navigation"],
  ["contenu", "Contenu"],
  ["formulaires", "Formulaires"],
  ["retours", "Retours"],
  ["patterns", "Patterns"],
  ["tunnel", "Tunnel de réservation"],
  ["etats", "États du tunnel"],
] as const;

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="ap-gallery__section" aria-labelledby={`${id}-t`}>
      <h2 id={`${id}-t`}>{title}</h2>
      {children}
    </section>
  );
}

function Item({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div className="ap-gallery__item">
      <h3>{title}</h3>
      {note ? <p className="ap-gallery__note">{note}</p> : null}
      {children}
    </div>
  );
}

const NOTICES: BookingNoticeKind[] = ["no-availability", "quote-expired", "hold-expired", "payment-failed", "place-unavailable", "error"];

export default function DesignSystemGallery() {
  if (IS_PROD) notFound();
  const summary = (withCustomer: boolean) => (
    <BookingSummary
      parking={{ name: "ALTERPARK Nantes", address: "Adresse saisie dans l’administration" }}
      start={stay.start}
      end={stay.end}
      days={stay.days}
      offerName="Avec navette"
      lines={priceLines}
      totalCents={4560}
      customer={withCustomer ? { name: "Claire Martin", email: "claire.martin@example.fr", plate: "AB-123-CD", passengers: 2, flight: "AF1234" } : undefined}
      editDatesHref={withCustomer ? "#tunnel" : undefined}
      editOfferHref={withCustomer ? "#tunnel" : undefined}
      editCustomerHref={withCustomer ? "#tunnel" : undefined}
    />
  );
  return (
    <>
      <Header links={navLinks} cta={{ label: "Réservez maintenant", href: "#tunnel" }} logoBadge={<RatingBadge count={1240} rating={4.8} size="mini" />} phone="01 23 45 67 89" email="contact@example.fr" />
      <main className="ap-gallery">
        <div className="ap-gallery__intro">
          <SectionHeading as="h1" title="Galerie du design system !" typing={false} subtitle="Développement uniquement">
            <p>Composants portés du bundle et composants proposés pour le tunnel de réservation. Les contenus affichés ici sont des exemples.</p>
          </SectionHeading>
          <nav aria-label="Sections de la galerie">
            <ul className="ap-gallery__toc">
              {SECTIONS.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Section id="icones" title="Icônes (SvgIcon)">
          <div className="ap-gallery__row" style={{ color: "var(--primary)" }}>
            {(Object.keys(SYSTEM_SVGS) as SystemIconName[]).map((name) => (
              <span key={name} title={name} style={{ width: "var(--icon-lg)", height: "var(--icon-lg)", display: "inline-flex" }}>
                <SvgIcon name={name} label={name} className={name === "logo" ? "ap-logo" : undefined} />
              </span>
            ))}
          </div>
        </Section>

        <Section id="actions" title="Actions">
          <Item title="Button : variantes et tailles">
            <div className="ap-gallery__row">
              <Button>Réservez maintenant</Button>
              <Button variant="secondary">Découvrez nos services +</Button>
              <Button variant="outline">En savoir +</Button>
              <Button variant="ghost">Voir le détail</Button>
              <Button size="sm">Taille sm</Button>
              <Button href="#actions" iconEnd={<span>→</span>}>
                Lien bouton
              </Button>
            </div>
          </Item>
          <Item title="Button : états (forcés pour la documentation)">
            <div className="ap-gallery__row">
              <Button state="hover">Survol</Button>
              <Button state="focus">Focus</Button>
              <Button state="active">Appui</Button>
              <Button disabled>Désactivé</Button>
              <Button variant="outline" state="hover">
                Contour survol
              </Button>
            </div>
          </Item>
          <Item title="Button : pleine largeur">
            <div className="ap-gallery__narrow">
              <Button fullWidth>Continuer</Button>
            </div>
          </Item>
          <Item title="IconButton">
            <div className="ap-gallery__row">
              <IconButton icon="arrowLeft" label="Précédent" />
              <IconButton icon="arrowRight" label="Suivant" />
              <IconButton icon="arrowRight" label="Survol" state="hover" />
              <IconButton icon="arrowRight" label="Désactivé" disabled />
              <VideoDemo />
            </div>
          </Item>
        </Section>

        <Section id="navigation" title="Navigation">
          <Item title="Header" note="Affiché en haut de cette page : liens, sous-menu, bouton, badge au survol du logo, menu mobile sous 1024 px." >
            <span />
          </Item>
          <Item title="Breadcrumbs">
            <Breadcrumbs items={[{ label: "Accueil", href: "#" }, { label: "Nos parkings", href: "#" }, { label: "Nantes" }]} />
          </Item>
          <Item title="SocialRail (non fixé)">
            <SocialRail
              fixed={false}
              items={[
                { label: "Facebook", href: "#", icon: "facebook", tone: "dark" },
                { label: "Espace client", href: "#", icon: "login", tone: "primary" },
                { label: "YouTube", href: "#", icon: "youtube", tone: "light" },
              ]}
            />
          </Item>
          <Item title="Footer" note="Affiché en bas de cette page.">
            <span />
          </Item>
        </Section>

        <Section id="contenu" title="Contenu">
          <Item title="SectionHeading">
            <SectionHeading title="Que de changements chez ALTERPARK depuis le 20 mars !" eyebrow="Nouveau" subtitle="Votre parking [couvert]">
              <p>Titre tapé à la machine à l’entrée dans l’écran (désactivé si vous réduisez les animations).</p>
            </SectionHeading>
            <SectionHeading align="center" title="Vos avis, notre fierté !" typing={false} />
          </Item>
          <Item title="Steps : hero">
            <Steps items={heroSteps} />
          </Item>
          <Item title="Steps : fidélité">
            <Steps items={loyaltySteps} variant="loyalty" />
          </Item>
          <Item title="Stars">
            <div className="ap-gallery__row">
              <Stars value={5} />
              <Stars value={3} />
              <Stars value={4} size="md" />
            </div>
          </Item>
          <Item title="RatingBadge" note="Sans logo de source : le fichier officiel n’est pas versionné.">
            <div className="ap-gallery__row">
              <RatingBadge count={1240} rating={4.8} />
              <RatingBadge count={1240} rating={4.4} href="#contenu" />
              <RatingBadge count={1240} rating={4.8} size="mini" />
            </div>
          </Item>
          <Item title="ReviewCard">
            <div className="ap-gallery__grid">
              <ReviewCard {...reviews[0]!} />
              <ReviewCard {...reviews[1]!} />
              <ReviewCard {...reviews[2]!} href="#contenu" />
            </div>
          </Item>
          <Item title="ReviewCarousel">
            <ReviewCarousel items={reviews} autoplay={false} />
          </Item>
          <Item title="StoreBadges" note="Rien n’est affiché sans les badges officiels Google Play et App Store (fichiers à fournir).">
            <StoreBadges googlePlayHref="#" appStoreHref="#" />
          </Item>
          <Item title="Accordion">
            <div className="ap-gallery__narrow">
              <Accordion
                defaultOpen={0}
                items={[
                  { title: "Comment se passe la dépose ?", content: "Présentez-vous à l’accueil avec votre référence de réservation." },
                  { title: "Puis-je modifier ma réservation ?", content: "Oui, depuis votre espace client, selon les conditions générales de vente." },
                ]}
              />
            </div>
          </Item>
          <Item title="ServiceCard">
            <div className="ap-gallery__grid">
              <ServiceCard
                icon="carWash"
                title="Lavage extérieur"
                price={49}
                featured
                badge="Nouveau"
                tagline="Retrouvez un véhicule propre."
                items={[{ title: "Lavage", text: "Carrosserie et jantes." }]}
                notes={["Sur réservation."]}
                cta={{ label: "Ajoutez ce service", href: "#" }}
              />
              <ServiceCard icon="carDoc" title="Contrôle technique" price="Devis gratuit" intro="Nous déposons votre véhicule au centre agréé." />
              <ServiceCard icon="evCharger" title="Recharge électrique" price={15} priceNote="TTC par charge" />
            </div>
          </Item>
          <Item title="Highlights">
            <Highlights
              items={[
                { icon: "stopwatch", title: "15 minutes", text: "Du parking au terminal." },
                { icon: "medal", title: "Fidélité", text: "10 points par euro." },
                { icon: "thumbStars", title: "4,8/5", text: "Note moyenne des avis." },
                { icon: "plantHand", title: "Éco !", text: "Parking couvert d’ombrières." },
              ]}
            />
          </Item>
          <Item title="FeatureList">
            <FeatureList
              items={[
                { icon: "bus", title: "Navette", text: "Jusqu’au terminal." },
                { icon: "shield", title: "Sécurité", text: "Vidéosurveillance et gardiennage." },
                { icon: "pin", title: "Accès", text: "À 5 minutes de l’aéroport." },
                { icon: "gift", title: "Fidélité", text: "Vos points à chaque réservation." },
              ]}
            />
          </Item>
        </Section>

        <Section id="formulaires" title="Formulaires">
          <div className="ap-gallery__grid">
            <TextField label="Nom" placeholder="Votre nom" help="Tel qu’il figure sur votre pièce d’identité." />
            <TextField label="E-mail" type="email" required defaultValue="claire@" error="Adresse e-mail invalide. Exemple : nom@domaine.fr" />
            <TextField label="Immatriculation" defaultValue="AB-123-CD" success="Immatriculation enregistrée." />
            <TextField label="Survol" state="hover" />
            <TextField label="Focus" state="focus" />
            <TextField label="Mot de passe" type="password" defaultValue="motdepasse" />
            <TextField label="Désactivé" disabled defaultValue="Non modifiable" />
            <TextField label="Message" multiline placeholder="Votre message" />
            <Select label="Parking" placeholder="Choisissez un parking" options={["Roissy", "Nantes", "Marseille"]} />
            <Select label="Parking" options={["Roissy"]} error="Choisissez un parking." />
          </div>
          <div className="ap-gallery__grid">
            <Item title="Checkbox">
              <Checkbox label="Je souhaite recevoir les offres" />
              <Checkbox label="Coché" defaultChecked />
              <Checkbox label="En erreur" invalid />
              <Checkbox label="Désactivé" disabled />
            </Item>
            <Item title="RadioGroup">
              <RadioDemo />
            </Item>
            <Item title="Toggle">
              <Toggle label="Utiliser mes points" />
              <Toggle label="Activé" defaultChecked />
              <Toggle label="Désactivé" disabled />
            </Item>
          </div>
        </Section>

        <Section id="retours" title="Retours">
          <Item title="Alert">
            <div className="ap-gallery__narrow" style={{ display: "grid", gap: "var(--space-4)" }}>
              <Alert tone="success">Votre réservation est confirmée.</Alert>
              <Alert tone="info">Le parking ferme à 23 h le dimanche.</Alert>
              <Alert tone="warning" title="Places limitées">Il reste peu de places sur vos dates.</Alert>
              <Alert tone="error" dismissible>
                Le paiement n’a pas abouti.
              </Alert>
            </div>
          </Item>
          <Item title="Modal">
            <div className="ap-gallery__row">
              <ModalDemo />
            </div>
            <div className="ap-gallery__frame">
              <Modal open inline title="Fenêtre en ligne (documentation)" footer={<Button size="sm">Confirmer</Button>}>
                Contenu de la fenêtre.
              </Modal>
            </div>
          </Item>
          <Item title="VideoModal" note="Bouton lecture dans la section Actions (lien YouTube en mode non intégré).">
            <span />
          </Item>
        </Section>

        <Section id="patterns" title="Patterns">
          <Item title="Hero" note="Sans photo : les photos du design system ne sont pas versionnées.">
            <div className="ap-gallery__frame">
              <Hero title="Votre parking à 5 minutes de l’aéroport !" typing={false} intro="Réservez en ligne, déposez votre véhicule, la navette vous conduit au terminal." steps={heroSteps} cta={{ label: "Réservez maintenant", href: "#tunnel" }} />
            </div>
          </Item>
          <Item title="BookingBar : avec offres (exemple)">
            <BookingBarDemo withOffers />
          </Item>
          <Item title="BookingBar : recherche seule (offres affichées par OfferList)">
            <BookingBarDemo withOffers={false} />
          </Item>
          <Item title="MediaSection + AppShowcase">
            <MediaSection
              title="Votre réservation dans la poche !"
              subtitle="Application mobile"
              eyebrow="Bientôt"
              media={<AppShowcase />}
              after={<FeatureList columns={1} items={[{ icon: "ticket", title: "Billet dématérialisé" }]} />}
            >
              <p>Retrouvez vos réservations et vos points de fidélité.</p>
            </MediaSection>
          </Item>
          <Item title="Banner" note="Sans photo ni logo partenaire (non versionnés).">
            <Banner title="Partenaire du Rallye du Cœur !" cta={{ label: "En savoir +", href: "#" }}>
              <p>Texte du bandeau.</p>
            </Banner>
          </Item>
        </Section>

        <Section id="tunnel" title="Tunnel de réservation (proposé)">
          <Item title="BookingStepper : première étape, étape 3, dernière étape">
            <BookingStepper current={0} />
            <BookingStepper current={2} />
            <BookingStepper current={5} />
          </Item>
          <Item title="BookingSearchForm (parking, départ, retour)" note="Envoyez le formulaire vide pour voir les erreurs ; délai minimal de 2 h avant le départ.">
            <SearchFormDemo />
          </Item>
          <Item title="DateTimeField : erreurs affichées">
            <DateFieldErrorsDemo />
          </Item>
          <Item title="OfferList (cliquez pour choisir)">
            <OfferListDemo />
          </Item>
          <Item title="OfferCard : choisie, complète">
            <div className="ap-gallery__grid">
              <OfferCard offer={quotes[0]!} days={8} selected />
              <OfferCard offer={quotes[2]!} days={8} />
            </div>
          </Item>
          <Item title="CustomerForm">
            <div className="ap-gallery__narrow">
              <CustomerFormDemo />
            </div>
          </Item>
          <Item title="BookingSummary : avec coordonnées et liens de modification">
            <div className="ap-gallery__narrow">{summary(true)}</div>
          </Item>
          <Item title="PaymentPanel : prêt (emplacement du Payment Element), préparation, paiement en cours, refusé">
            <div className="ap-gallery__grid">
              <PaymentPanel amountCents={4560} status="ready" holdExpiresAt={stay.start - 86_400_000}>
                <div className="ap-gallery__slot">Emplacement du Payment Element Stripe (phase 5)</div>
              </PaymentPanel>
              <PaymentPanel amountCents={4560} status="loading" />
              <PaymentPanel amountCents={4560} status="processing">
                <div className="ap-gallery__slot">Emplacement du Payment Element Stripe (phase 5)</div>
              </PaymentPanel>
              <PaymentPanel amountCents={4560} status="failed" error="Votre carte a été refusée. Aucun montant n’a été débité.">
                <div className="ap-gallery__slot">Emplacement du Payment Element Stripe (phase 5)</div>
              </PaymentPanel>
            </div>
          </Item>
          <Item title="BookingConfirmation : en attente du webhook">
            <BookingConfirmation status="pending" reference="AP7K2Q9X" email="claire.martin@example.fr" headingAs="h2" />
          </Item>
          <Item title="BookingConfirmation : confirmée">
            <div className="ap-gallery__narrow">
              <BookingConfirmation
                status="confirmed"
                reference="AP7K2Q9X"
                email="claire.martin@example.fr"
                headingAs="h2"
                summary={summary(false)}
                actions={
                  <>
                    <Button href="#" size="sm">
                      Retour à l’accueil
                    </Button>
                    <Button href="#" size="sm" variant="outline">
                      Mon espace client
                    </Button>
                  </>
                }
              />
            </div>
          </Item>
          <Item title="BookingConfirmation : confirmation en retard">
            <div className="ap-gallery__narrow">
              <BookingConfirmation status="delayed" reference="AP7K2Q9X" email="claire.martin@example.fr" headingAs="h2" contact={<p>Contact : coordonnées saisies dans l’administration.</p>} />
            </div>
          </Item>
        </Section>

        <Section id="etats" title="États du tunnel (proposé)">
          <Item title="Chargement">
            <BookingLoading label="Recherche des places disponibles…" />
            <OfferList status="loading" offers={[]} days={8} />
          </Item>
          <Item title="BookingNotice : tous les cas">
            <div className="ap-gallery__grid">
              {NOTICES.map((k) => (
                <BookingNotice
                  key={k}
                  kind={k}
                  action={{ label: k === "payment-failed" ? "Réessayer le paiement" : k === "error" ? "Réessayer" : "Modifier mes dates", href: "#tunnel" }}
                  secondaryAction={k === "place-unavailable" ? { label: "Voir les autres offres", href: "#tunnel" } : undefined}
                />
              ))}
            </div>
          </Item>
          <Item title="OfferList : aucune disponibilité, erreur">
            <OfferList offers={[quotes[2]!]} days={8} changeDates={{ label: "Modifier mes dates", href: "#tunnel" }} />
            <OfferList status="error" offers={[]} days={8} retry={{ label: "Réessayer", href: "#etats" }} changeDates={{ label: "Modifier mes dates", href: "#tunnel" }} />
          </Item>
        </Section>
      </main>
      <Footer
        legalLinks={[{ label: "Mentions légales", href: "#" }, { label: "CGV", href: "#" }]}
        address={["Adresse saisie dans l’administration"]}
        phone="01 23 45 67 89"
        email="contact@example.fr"
        social={[
          { label: "Facebook", href: "#", icon: "facebookGlyph" },
          { label: "YouTube", href: "#", icon: "youtubeGlyph" },
        ]}
      />
    </>
  );
}
