import { LegalPage, LegalSection, Missing } from "@/components/site/LegalPage";
import { pageMetadata } from "@/components/seo/metadata";
import { routes, siteContact } from "@/config/site";

export const metadata = pageMetadata({ title: "Mentions légales", description: "Mentions légales du site ALTERPARK.", path: routes.legal });

export default function LegalNoticePage() {
  return (
    <LegalPage title="Mentions légales" path={routes.legal} updated="20/11/2026">
      <LegalSection title="Éditeur du site">
        <p>
          Raison sociale : <Missing what="raison sociale et forme juridique" />
          <br />
          Siège social : {siteContact.address.join(", ")} (adresse du parking de Nantes, <Missing what="siège à confirmer" />)
          <br />
          Capital social : <Missing what="capital" /> — RCS / SIRET : <Missing what="RCS et SIRET" /> — TVA intracommunautaire : <Missing what="numéro de TVA" />
          <br />
          Téléphone : {siteContact.phone} — E-mail : {siteContact.email}
          <br />
          Directeur de la publication : <Missing what="nom du directeur de la publication" />
        </p>
      </LegalSection>
      <LegalSection title="Conception et développement">
        <p>OuiDev.</p>
      </LegalSection>
      <LegalSection title="Hébergement">
        <p>Vercel Inc., 440 N Barranca Ave, Suite 4133, Covina, CA 91723, États-Unis — vercel.com. Base de données : <Missing what="hébergeur et région de la base de données" /></p>
      </LegalSection>
      <LegalSection title="Propriété intellectuelle">
        <p>Les textes, logos, photographies et éléments graphiques du site sont la propriété d’ALTERPARK ou de ses partenaires. Toute reproduction sans autorisation est interdite.</p>
      </LegalSection>
      <LegalSection title="Données personnelles">
        <p>
          Le traitement de vos données est décrit dans la <a className="text-primary underline" href={routes.privacy}>politique de confidentialité</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
