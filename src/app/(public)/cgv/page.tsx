import { LegalPage, LegalSection, Missing } from "@/components/site/LegalPage";
import { pageMetadata } from "@/components/seo/metadata";
import { routes } from "@/config/site";

export const metadata = pageMetadata({ title: "Conditions générales de vente", description: "Conditions générales de vente des réservations de parking ALTERPARK.", path: routes.terms });

/*
 * DRAFT built from the business rules approved on 20/11/2026 (docs/AUDIT.md §3). Must be reviewed
 * by the client (and its legal adviser) before launch.
 */
export default function TermsPage() {
  return (
    <LegalPage title="Conditions générales de vente" path={routes.terms} updated="20/11/2026">
      <LegalSection title="1. Objet">
        <p>Les présentes conditions régissent la réservation en ligne d’une place de stationnement dans les parkings ALTERPARK situés à proximité des aéroports desservis, entre ALTERPARK (<Missing what="identité de la société" />) et toute personne réservant sur le site (le « client »).</p>
      </LegalSection>
      <LegalSection title="2. Réservation">
        <ul>
          <li>La réservation nécessite la création d’un compte client.</li>
          <li>Elle doit être effectuée au moins 2 heures avant l’arrivée au parking, dans la limite des places disponibles.</li>
          <li>Le prix est calculé pour les dates choisies ; toute période de 24 heures commencée est due.</li>
          <li>La réservation est confirmée par e-mail une fois le paiement validé. Elle porte une référence unique.</li>
        </ul>
      </LegalSection>
      <LegalSection title="3. Prix et paiement">
        <p>Les prix sont indiqués en euros toutes taxes comprises. Le paiement s’effectue en ligne, au moment de la réservation, par l’intermédiaire d’un prestataire de paiement sécurisé ; ALTERPARK ne conserve aucune donnée de carte bancaire. Tarifs en vigueur : <Missing what="grille tarifaire" /></p>
      </LegalSection>
      <LegalSection title="4. Annulation et remboursement">
        <ul>
          <li>Le client peut annuler gratuitement sa réservation depuis son espace client jusqu’à 24 heures avant l’heure d’arrivée prévue. Le montant payé est alors remboursé intégralement sur le moyen de paiement utilisé.</li>
          <li>Passé ce délai, le client peut adresser une demande d’annulation, étudiée par ALTERPARK. Conditions de remboursement éventuel : <Missing what="politique après 24 h" /></li>
          <li>La modification d’une réservation (dates, véhicule) se fait par annulation puis nouvelle réservation.</li>
        </ul>
      </LegalSection>
      <LegalSection title="5. Droit de rétractation">
        <p>Conformément à l’article L221-28 du Code de la consommation, le droit de rétractation ne s’applique pas aux prestations de services fournies à une date déterminée. Les conditions d’annulation ci-dessus s’appliquent. <Missing what="validation juridique" /></p>
      </LegalSection>
      <LegalSection title="6. Dépôt et restitution du véhicule">
        <p>Le client se présente à l’accueil du parking avec sa référence de réservation. Règles de dépôt, de restitution et de responsabilité : <Missing what="règlement du parking" /></p>
      </LegalSection>
      <LegalSection title="7. Réclamations et médiation">
        <p>Toute réclamation peut être adressée via la page Contact. Médiateur de la consommation : <Missing what="médiateur désigné" /></p>
      </LegalSection>
    </LegalPage>
  );
}
