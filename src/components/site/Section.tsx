import type { ReactNode } from "react";
import { cx } from "@/components/ui/lib/cx";

/* Page section with the system's vertical rhythm (space-16 mobile → space-24 laptop → space-30 desktop). */
export function Section({ children, className, labelledBy }: { children: ReactNode; className?: string; labelledBy?: string }) {
  return (
    <section aria-labelledby={labelledBy} className={cx("ap-container py-16 lg:py-24 xl:py-30", className)}>
      {children}
    </section>
  );
}
