import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

/**
 * Internal paths use next/link (client navigation, prefetch); anything else is a plain anchor.
 * Downloads (`download`) are plain anchors too: prefetching would run the file's route handler.
 */
export function SmartLink({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  if (href.startsWith("/") && !href.startsWith("//") && rest.download === undefined) return <Link href={href} {...rest} />;
  return <a href={href} {...rest} />;
}
