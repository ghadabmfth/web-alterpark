import { PageIntro } from "@/components/site/PageIntro";
import { Section } from "@/components/site/Section";
import { ContactForm } from "@/components/site/ContactForm";
import { pageMetadata } from "@/components/seo/metadata";
import { Card } from "@/components/ui/layout/Card";
import { DescriptionList } from "@/components/ui/data/DescriptionList";
import { routes, siteContact, telHref } from "@/config/site";
import { listParkings } from "@/modules/parkings/queries";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Une question sur votre réservation, la navette ou un paiement ? Contactez l’équipe ALTERPARK.",
  path: routes.contact,
});

export default async function ContactPage() {
  const parkings = (await listParkings()).map((p) => ({ value: p.slug, label: p.name }));
  return (
    <>
      <PageIntro title="Contactez-nous" crumbs={[{ label: "Accueil", href: "/" }, { label: "Contact", href: routes.contact }]}>
        <p>Une question sur une réservation, la navette ou un paiement ? Notre équipe vous répond.</p>
      </PageIntro>
      <Section className="pt-0 lg:pt-0 xl:pt-0">
        <div className="grid gap-12 lg:grid-cols-3">
          <Card title="Votre message" titleAs="h2" className="lg:col-span-2">
            <ContactForm parkings={parkings} />
          </Card>
          <Card title="Nous joindre" titleAs="h2" as="div">
            <DescriptionList
              items={[
                { term: "Téléphone", value: <a className="text-primary" href={telHref(siteContact.phone)}>{siteContact.phone}</a> },
                { term: "E-mail", value: <a className="text-primary" href={`mailto:${siteContact.email}`}>{siteContact.email}</a> },
                { term: "Adresse (Nantes)", value: siteContact.address.join(", ") },
              ]}
            />
          </Card>
        </div>
      </Section>
    </>
  );
}
