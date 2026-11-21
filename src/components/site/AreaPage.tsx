import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/layout/PageHeader";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import type { FeatureIconName } from "@/components/ui/icons/sets";

/*
 * Page of the customer area or back office that is not wired to data yet. It states which phase
 * wires it; it never shows sample figures presented as real.
 */
export function AreaPage({
  title,
  description,
  crumbs,
  phase,
  emptyTitle,
  emptyText,
  icon,
  actions,
  children,
}: {
  title: string;
  description?: string;
  crumbs: { label: string; href?: string }[];
  phase: string;
  emptyTitle: string;
  emptyText: string;
  icon?: FeatureIconName;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      <PageHeader title={title} description={description} breadcrumbs={crumbs} actions={actions} />
      {children ?? <EmptyState icon={icon} title={emptyTitle} text={`${emptyText} Branchement prévu : ${phase}.`} />}
    </>
  );
}
