import { Alert } from "@/components/ui/feedback/Alert";

/** Banner of the customer area and back office until authentication and data are wired (Phase 4). */
export function PreviewNotice({ area }: { area: string }) {
  return (
    <Alert tone="warning" title="Aperçu de l’interface" className="mb-8">
      <p>{`${area} n’est pas encore relié(e) aux comptes ni aux données. L’accès sera protégé par connexion en phase 4 ; aucune donnée client n’est affichée.`}</p>
    </Alert>
  );
}
