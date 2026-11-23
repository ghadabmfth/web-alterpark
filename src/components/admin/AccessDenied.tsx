import { EmptyState } from "@/components/ui/feedback/EmptyState";

export function AccessDenied() {
  return <EmptyState icon="shield" title="Accès refusé" text="Votre rôle ne donne pas accès à cette section. Contactez un super-administrateur si nécessaire." />;
}
