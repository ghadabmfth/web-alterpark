import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

/** Internal paths use next/link (client navigation, prefetch); anything else is a plain anchor. */
export function SmartLink({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  if (href.startsWith("/") && !href.startsWith("//")) return <Link href={href} {...rest} />;
  return <a href={href} {...rest} />;
}
