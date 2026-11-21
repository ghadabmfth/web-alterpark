import { LegalPage, LegalSection, Missing } from "@/components/site/LegalPage";
import { pageMetadata } from "@/components/seo/metadata";
import { routes, siteContact } from "@/config/site";

export const metadata = pageMetadata({ title: "Politique de confidentialité", description: "Comment ALTERPARK traite vos données personnelles.", path: routes.privacy });

export default function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité" path={routes.privacy} updated="20/11/2026">
      <LegalSection title="Responsable du traitement">
        <p>ALTERPARK (<Missing what="identité de la société" />), joignable à {siteContact.email}.</p>
      </LegalSection>
      <LegalSection title="Données collectées et finalités">
        <ul>
          <li>Compte client : nom, prénom, e-mail, téléphone, mot de passe (stocké sous forme chiffrée irréversible) — gestion du compte.</li>
          <li>Réservations : dates, parking, véhicule (immatriculation), vols facultatifs — exécution du contrat.</li>
          <li>Paiements : montant et statut ; les données de carte sont traitées exclusivement par notre prestataire de paiement — exécution du contrat, obligations comptables.</li>
          <li>Messages de contact : nom, e-mail, téléphone facultatif, message — réponse à vos demandes.</li>
          <li>Sécurité : adresse IP conservée uniquement sous forme d’empreinte chiffrée — prévention des abus.</li>
        </ul>
      </LegalSection>
      <LegalSection title="Durées de conservation">
        <p><Missing what="durées de conservation par catégorie" /></p>
      </LegalSection>
      <LegalSection title="Destinataires">
        <p>Personnel habilité d’ALTERPARK, prestataire de paiement, hébergeur et prestataire d’envoi d’e-mails, dans la limite de leurs missions. <Missing what="liste des sous-traitants et transferts hors UE" /></p>
      </LegalSection>
      <LegalSection title="Cookies">
        <p>Le site utilise uniquement les cookies nécessaires à son fonctionnement (session de connexion, sécurité). Aucun cookie publicitaire ni de mesure d’audience n’est déposé.</p>
      </LegalSection>
      <LegalSection title="Vos droits">
        <p>Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité. Écrivez-nous à {siteContact.email}. Vous pouvez également saisir la CNIL (cnil.fr).</p>
      </LegalSection>
    </LegalPage>
  );
}
