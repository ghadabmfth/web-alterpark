import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/actions/Button";
import { IconButton } from "@/components/ui/actions/IconButton";
import { Header } from "@/components/ui/navigation/Header";
import { SocialRail } from "@/components/ui/navigation/SocialRail";
import { Footer } from "@/components/ui/navigation/Footer";
import { Tabs } from "@/components/ui/navigation/Tabs";
import { DropdownMenu } from "@/components/ui/navigation/DropdownMenu";
import { SectionHeading } from "@/components/ui/content/SectionHeading";
import { Steps } from "@/components/ui/content/Steps";
import { Stars } from "@/components/ui/content/Stars";
import { RatingBadge } from "@/components/ui/content/RatingBadge";
import { ReviewCarousel } from "@/components/ui/content/ReviewCarousel";
import { StoreBadges } from "@/components/ui/content/StoreBadges";
import { Accordion } from "@/components/ui/content/Accordion";
import { FeatureList } from "@/components/ui/content/FeatureList";
import { ServiceCard } from "@/components/ui/content/ServiceCard";
import { Highlights } from "@/components/ui/content/Highlights";
import { TextField } from "@/components/ui/forms/TextField";
import { Select } from "@/components/ui/forms/Select";
import { Checkbox } from "@/components/ui/forms/Checkbox";
import { Toggle } from "@/components/ui/forms/Toggle";
import { DateTimeField } from "@/components/ui/forms/DateTimeField";
import { FilterBar } from "@/components/ui/forms/FilterBar";
import { Alert } from "@/components/ui/feedback/Alert";
import { Modal } from "@/components/ui/feedback/Modal";
import { Badge } from "@/components/ui/feedback/Badge";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { LoadingRegion, Skeleton } from "@/components/ui/feedback/Skeleton";
import { Hero } from "@/components/ui/patterns/Hero";
import { MediaSection } from "@/components/ui/patterns/MediaSection";
import { Banner } from "@/components/ui/patterns/Banner";
import { AppShowcase } from "@/components/ui/patterns/AppShowcase";
import { Card } from "@/components/ui/layout/Card";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { DataTable } from "@/components/ui/data/DataTable";
import { Pagination } from "@/components/ui/data/Pagination";
import { StatGrid, StatTile } from "@/components/ui/data/StatTile";
import { DescriptionList } from "@/components/ui/data/DescriptionList";
import { assets } from "@/components/ui/lib/assets";
import { formatEuro } from "@/components/ui/lib/format";
import { BookingBarDemo, ConfirmDemo, ModalDemo, RadioDemo, ToastDemo, VideoDemo } from "./demos";
import { galleryEnabled } from "./gallery-gate";

/*
 * Design-system gallery: every component in its states, at real size. Development only, or on a
 * Preview deployment with DESIGN_SYSTEM_GALLERY=true. All data on this page is SAMPLE DATA.
 * The AppShell layout is shown separately at /dev/design-system/shell.
 */
export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

function Section({ id, title, note, children }: { id: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="flex flex-col gap-8 py-16">
      <div className="flex flex-col gap-2">
        <h2 id={`${id}-t`} className="h2 ap-h2">{title}</h2>
        {note ? <p className="ap-body max-w-col text-text-secondary">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Demo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="label m-0 text-text-secondary">{label}</p>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </div>
  );
}

const NAV = [
  { label: "Réserver", href: "#booking", active: true },
  { label: "Nos parkings", children: [{ label: "Nantes Atlantique", href: "#" }, { label: "Marseille Provence", href: "#" }, { label: "Paris-Roissy CDG", href: "#" }] },
  { label: "Comment ça marche", href: "#" },
  { label: "FAQ", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Mon compte", href: "#" },
];

const SOCIAL = [
  { label: "Facebook", href: "#", icon: "facebook", tone: "dark" as const },
  { label: "Espace client", href: "#", icon: "login", tone: "primary" as const },
  { label: "YouTube", href: "#", icon: "youtube", tone: "light" as const },
];

const STEPS = [
  { icon: "stepReserver", title: "Réservez en ligne", text: "En quelques clics" },
  { icon: "stepDeposer", title: "Déposez votre véhicule", text: "Au parking ALTERPARK" },
  { icon: "stepNavette", title: "Prenez la navette", text: "Gratuite, sans attente" },
  { icon: "stepVacances", title: "Profitez de vos vacances", text: "On veille sur votre voiture" },
];

const REVIEWS = [
  { name: "Sophie Martin", date: "il y a 2 semaines", text: "Accueil très sympathique, navette rapide jusqu’au terminal. Au retour, la voiture nous attendait. Je recommande sans hésiter." },
  { name: "Karim B.", date: "il y a 1 mois", rating: 4, text: "Réservation simple, prix correct et parking bien surveillé. Petite attente pour la navette au retour un samedi soir, mais rien de grave. Le personnel est disponible et explique tout clairement dès l’arrivée sur place." },
  { name: "Julie Lefèvre", date: "il y a 3 mois", text: "Troisième fois que je passe par ALTERPARK pour partir de Nantes : toujours aussi pratique." },
  { name: "Thomas Robert", date: "il y a 4 mois", text: "Parking propre, clair et sécurisé. La navette est ponctuelle." },
];

type SampleReservation = { ref: string; customer: string; site: string; arrival: string; total: string; status: ReactNode };
const RESERVATIONS: SampleReservation[] = [
  { ref: "AP-NTE-7K3Q9M", customer: "Sophie Martin", site: "Nantes", arrival: "12/08/2026 06:30", total: "57,60 €", status: <Badge tone="success">Confirmée</Badge> },
  { ref: "AP-MRS-2H8PLX", customer: "Karim Benali", site: "Marseille", arrival: "14/08/2026 09:15", total: "84,00 €", status: <Badge tone="warning">Paiement en attente</Badge> },
  { ref: "AP-CDG-9QW4ZT", customer: "Julie Lefèvre", site: "Paris-Roissy", arrival: "15/08/2026 18:40", total: "112,50 €", status: <Badge tone="error">Annulée</Badge> },
  { ref: "AP-NTE-4MB7RS", customer: "Thomas Robert", site: "Nantes", arrival: "16/08/2026 05:50", total: "45,00 €", status: <Badge tone="info">Arrivée enregistrée</Badge> },
];

export default function DesignSystemPage() {
  if (!galleryEnabled()) notFound();
  return (
    <>
      <Header links={NAV} cta={{ label: "Réservez ma place !", href: "#booking" }} sticky />
      <SocialRail items={SOCIAL} />
      <main id="contenu">
      <div className="mx-auto w-page max-w-site">
        <Alert tone="info" title="Galerie du design system" className="mt-8">
          Page de développement : toutes les données affichées sont des exemples.
        </Alert>

        <Section id="actions" title="Actions" note="Pilule orange par défaut ; survol au cercle, focus clavier, appui, désactivé et chargement (extension).">
          <Demo label="Variantes">
            <Button>Réservez maintenant</Button>
            <Button variant="secondary">Découvrez nos services +</Button>
            <Button variant="outline">En savoir +</Button>
            <Button variant="ghost">Annuler</Button>
          </Demo>
          <Demo label="États forcés et tailles">
            <Button state="hover">Survol</Button>
            <Button state="focus">Focus</Button>
            <Button state="active">Appui</Button>
            <Button disabled>Désactivé</Button>
            <Button loading loadingLabel="Envoi en cours…">Envoyer</Button>
            <Button size="sm">Petit (48 px)</Button>
          </Demo>
          <Demo label="IconButton">
            <IconButton icon="arrowLeft" label="Avis précédent" />
            <IconButton icon="arrowRight" label="Avis suivant" />
            <VideoDemo />
          </Demo>
        </Section>

        <Section id="navigation" title="Navigation" note="Header (au-dessus, collant ; burger sous 1024 px), rail social (à droite dès 1280 px), onglets et menu (extensions).">
          <Tabs label="Réservation" items={[{ label: "Détails", href: "#navigation", current: true }, { label: "Paiements", href: "#p" }, { label: "Historique", href: "#h" }]} />
          <Demo label="DropdownMenu">
            <DropdownMenu
              label="Sophie Martin"
              items={[{ label: "Mon profil", href: "#" }, { label: "Mes réservations", href: "#" }, { type: "separator" }, { label: "Se déconnecter", href: "#" }]}
            />
          </Demo>
        </Section>

        <Section id="content" title="Contenu">
          <SectionHeading title="Que de changements chez ALTERPARK depuis le 20 mars !" subtitle="Comment ça marche ?" eyebrow="Nouveau">
            <p>Une nouvelle navette, un accueil repensé et des ombrières photovoltaïques sur tout le parking.</p>
          </SectionHeading>
          <SectionHeading title="Votre parking [couvert] & sécurisé" typing={false} align="center" />
          <Steps items={STEPS} />
          <Steps
            variant="loyalty"
            items={[
              { icon: "fideliteCumulez", title: "Cumulez", text: "10 points par euro dépensé." },
              { icon: "fideliteCapitalisez", title: "Capitalisez", text: "Vos points n’expirent pas tant que vous voyagez." },
              { icon: "fideliteUtilisez", title: "Utilisez", text: "Réduisez le prix de vos prochains séjours." },
            ]}
          />
          <Demo label="Stars, RatingBadge (chiffres d’exemple)">
            <Stars value={4} />
            <Stars value={5} size="md" />
            <RatingBadge rating={4.4} count={843} />
            <RatingBadge rating={4.4} count={843} size="mini" href="#" />
          </Demo>
          <ReviewCarousel items={REVIEWS} autoplay={false} />
          <Accordion
            items={[
              { title: "Combien de temps avant mon vol dois-je arriver ?", content: <p>Prévoyez 15 minutes pour déposer votre véhicule et prendre la navette.</p> },
              { title: "Le parking est-il surveillé ?", content: <p>Oui : vidéosurveillance et gardiennage 24h/24, 7j/7.</p> },
              { title: "Puis-je annuler ma réservation ?", content: <p>Gratuitement jusqu’à 24 heures avant votre arrivée.</p> },
            ]}
            defaultOpen={0}
          />
          <FeatureList items={[{ icon: "bus", title: "Navette gratuite", text: "Terminal en 15 minutes." }, { icon: "shield", title: "Parking sécurisé", text: "Vidéosurveillance et gardiennage." }, { icon: "pin", title: "À 5 minutes de l’aéroport" }, { icon: "gift", title: "Programme fidélité", text: "10 points par euro." }]} />
          <div className="grid gap-6 md:grid-cols-2">
            <ServiceCard icon="carWash" title="Lavage extérieur" price={29} tagline="Votre voiture propre à votre retour" items={[{ title: "Prélavage et lavage haute pression" }, { title: "Séchage à la main" }]} cta={{ label: "Ajouter", href: "#" }} />
            <ServiceCard icon="evCharger" title="Recharge électrique" price="Sur devis" featured badge="Nouveau" notes={["Selon disponibilité des bornes."]} />
          </div>
          <Highlights items={[{ icon: "stopwatch", title: "15 min", text: "Jusqu’au terminal" }, { icon: "medal", title: "4,4/5", text: "Note moyenne (exemple)" }, { icon: "plantHand", title: "100 % solaire", text: "Ombrières photovoltaïques" }, { icon: "thumbStars", title: "24h/24", text: "Accueil et navette" }]} />
          <StoreBadges googlePlayHref="#" appStoreHref="#" />
        </Section>

        <Section id="forms" title="Formulaires" note="Libellé, aide, erreur ou succès avec icône ; mot de passe affichable ; date et heure en un seul groupe (extension).">
          <div className="grid gap-8 md:grid-cols-2">
            <TextField label="Adresse e-mail" type="email" placeholder="nom@domaine.fr" help="Votre confirmation sera envoyée à cette adresse." required />
            <TextField label="Mot de passe" type="password" defaultValue="motdepasse" required />
            <TextField label="Téléphone" type="tel" defaultValue="06 12" error="Numéro invalide. Exemple : 06 12 34 56 78" />
            <TextField label="Immatriculation" defaultValue="AB-123-CD" success="Véhicule enregistré." />
            <Select label="Parking" placeholder="Choisissez un parking" options={["Nantes Atlantique", "Marseille Provence", "Paris-Roissy CDG"]} />
            <TextField label="Message" multiline placeholder="Votre message" />
            <DateTimeField legend="Arrivée au parking" required dateProps={{ defaultValue: "2026-08-12" }} timeProps={{ defaultValue: "06:30" }} help="Heure locale du parking." />
            <DateTimeField legend="Retour" error="Le retour doit être après l’arrivée." dateProps={{ defaultValue: "2026-08-10" }} timeProps={{ defaultValue: "22:10" }} />
            <div className="flex flex-col gap-4">
              <Checkbox label="J’accepte les conditions générales de vente" defaultChecked />
              <Checkbox label="Champ obligatoire non coché" invalid />
              <Toggle label="Recevoir les offres par e-mail" />
            </div>
            <RadioDemo />
          </div>
        </Section>

        <Section id="feedback" title="Retours" note="Alertes (icône + mot), fenêtres, confirmations et notifications (extensions), chargement et listes vides.">
          <div className="grid gap-4">
            <Alert tone="success">Votre réservation est confirmée. Un e-mail vous a été envoyé.</Alert>
            <Alert tone="info">Le paiement est en cours de vérification.</Alert>
            <Alert tone="warning" title="Places limitées">Plus que 3 places pour ces dates.</Alert>
            <Alert tone="error" dismissible>Le paiement a échoué. Aucun montant n’a été débité.</Alert>
          </div>
          <Demo label="Badges">
            <Badge>Brouillon</Badge>
            <Badge tone="primary">Nouveau</Badge>
            <Badge tone="success">Confirmée</Badge>
            <Badge tone="warning">Paiement en attente</Badge>
            <Badge tone="error">Annulée</Badge>
            <Badge tone="info">Remboursée</Badge>
          </Demo>
          <Demo label="Modal, ConfirmDialog, Toast">
            <ModalDemo />
            <ConfirmDemo />
            <ToastDemo />
          </Demo>
          <Modal open inline title="Fenêtre (affichage dans le flux)">
            <p className="m-0">Aperçu statique de la modale du système.</p>
          </Modal>
          <div className="grid gap-6 md:grid-cols-2">
            <LoadingRegion label="Chargement des réservations…">
              <Card title="Chargement">
                <Skeleton width="60%" />
                <Skeleton />
                <Skeleton variant="block" />
              </Card>
            </LoadingRegion>
            <EmptyState title="Aucune réservation pour le moment" text="Vos réservations apparaîtront ici dès votre premier séjour." action={<Button size="sm" href="#booking">Réserver une place</Button>} />
          </div>
        </Section>

        <Section id="data" title="Données (extensions)" note="Tuiles d’indicateurs, tableau, pagination, filtres et fiche de détail du back-office.">
          <PageHeader
            title="Réservations"
            description="Toutes les réservations des trois parkings."
            breadcrumbs={[{ label: "Back-office", href: "#" }, { label: "Réservations" }]}
            actions={<Button size="sm" variant="secondary">Exporter (CSV)</Button>}
          />
          <StatGrid>
            <StatTile label="Réservations confirmées" value="128" trend={{ direction: "up", text: "+12 %" }} hint="vs. mois précédent" />
            <StatTile label="Chiffre d’affaires" value={formatEuro(7412.4)} hint="Paiements vérifiés" />
            <StatTile label="En attente de paiement" value="6" trend={{ direction: "down", text: "−2" }} hint="depuis hier" />
            <StatTile label="Taux d’occupation" value="74 %" hint="Nantes, aujourd’hui" />
          </StatGrid>
          <FilterBar resetHref="#data">
            <TextField label="Recherche" name="q" placeholder="Référence, nom, e-mail" />
            <Select label="Parking" name="site" placeholder="Tous" options={["Nantes", "Marseille", "Paris-Roissy"]} />
            <Select label="Statut" name="status" placeholder="Tous" options={["Confirmée", "Paiement en attente", "Annulée"]} />
          </FilterBar>
          <DataTable
            caption="Réservations (exemple)"
            rows={RESERVATIONS}
            rowKey={(r) => r.ref}
            columns={[
              { key: "ref", header: "Référence", cell: (r) => <a href="#">{r.ref}</a>, nowrap: true },
              { key: "customer", header: "Client", cell: (r) => r.customer },
              { key: "site", header: "Parking", cell: (r) => r.site },
              { key: "arrival", header: "Arrivée", cell: (r) => r.arrival, nowrap: true },
              { key: "total", header: "Montant", cell: (r) => r.total, align: "end" },
              { key: "status", header: "Statut", cell: (r) => r.status },
            ]}
          />
          <Pagination page={5} totalPages={20} hrefFor={(p) => `?page=${p}#data`} />
          <DataTable caption="Liste vide" rows={[] as SampleReservation[]} rowKey={(r) => r.ref} columns={[]} empty={<EmptyState icon="pin" title="Aucun résultat" text="Aucune réservation ne correspond à ces filtres." />} />
          <Card title="Réservation AP-NTE-7K3Q9M" subtitle="Créée le 02/08/2026" actions={<Badge tone="success">Confirmée</Badge>} footer={<Button size="sm" variant="secondary">Renvoyer la confirmation</Button>}>
            <DescriptionList
              items={[
                { term: "Client", value: "Sophie Martin — sophie.martin@example.com" },
                { term: "Parking", value: "Nantes Atlantique — ALTERPARK" },
                { term: "Séjour", value: "Du mar. 12 août 2026 à 06:30 au mer. 20 août 2026 à 22:10 (9 jours)" },
                { term: "Véhicule", value: "AB-123-CD" },
                { term: "Montant payé", value: "57,60 €" },
              ]}
            />
          </Card>
        </Section>

        <Section id="patterns" title="Patterns">
          <div id="booking">
            <BookingBarDemo />
          </div>
        </Section>
      </div>

      <Hero
        title="Votre parking à l’aéroport de Nantes !"
        intro="AlterPark, l’autre parking : navette gratuite sans attente, parking sécurisé, à 5 minutes du terminal."
        steps={STEPS}
        cta={{ label: "Réservez maintenant", href: "#booking" }}
        id="gallery-hero"
      />
      <div className="mx-auto flex w-page max-w-site flex-col gap-30 py-16">
        <MediaSection
          title="Que de changements chez ALTERPARK depuis le 20 mars !"
          subtitle="Un parking repensé"
          media={<AppShowcase />}
          cta={{ label: "Découvrez nos services +", href: "#" }}
        >
          <p>Ombrières photovoltaïques, nouvel accueil et navette électrique.</p>
        </MediaSection>
      </div>
      <Banner title="ALTERPARK partenaire du Rallye du Cœur" logo={assets.rallyeLogo} logoAlt="Rallye du Cœur" cta={{ label: "En savoir +", href: "#" }}>
        <p>Chaque année, ALTERPARK soutient le Rallye du Cœur au profit d’associations locales.</p>
      </Banner>
      </main>
      <Footer legalLinks={[{ label: "Mentions légales", href: "#" }, { label: "CGV", href: "#" }]} social={SOCIAL} year={2026} />
    </>
  );
}
