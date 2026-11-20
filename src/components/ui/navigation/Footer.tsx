import Image from "next/image";
import { cx } from "../lib/cx";
import { SmartLink } from "../lib/link";
import { SvgIcon } from "../icons/SvgIcon";
import { IconOrImage } from "../icons/IconOrImage";
import { siteContact, telHref, type SiteContact } from "@/config/site";
import type { SocialItem } from "./types";

/*
 * Footer — design system "Navigation". Logo, rights, legal links, address, contact, 10 px orange
 * rule. One row from 1024 px, otherwise one centred column. Social links shown below 1024 px.
 */
export interface FooterProps {
  /** Copyright year. Required: reading the clock inside a component would make the page dynamic
   * under Cache Components; the layout passes a cached value. */
  year: number;
  logoSrc?: string;
  homeHref?: string;
  legalLinks: { label: string; href: string }[];
  contact?: SiteContact;
  /** Social links displayed below 1024 px (the SocialRail is hidden there). */
  social?: SocialItem[];
  className?: string;
}

export function Footer({ year, logoSrc, homeHref = "/", legalLinks, contact = siteContact, social, className }: FooterProps) {
  return (
    <footer className={cx("ap-root ap-footer", className)}>
      <div className="ap-footer__inner">
        <SmartLink className="ap-footer__logo" href={homeHref}>
          {logoSrc ? (
            <Image src={logoSrc} alt="AlterPark, accueil" width={127} height={71} />
          ) : (
            <SvgIcon name="logo" label="AlterPark, accueil" className="ap-logo" />
          )}
        </SmartLink>
        <p>
          Tous droits réservés © <strong>Alterpark</strong> {year}
        </p>
        <nav className="ap-footer__legal" aria-label="Informations légales">
          {legalLinks.map((l, i) => (
            <SmartLink key={i} href={l.href}>{l.label}</SmartLink>
          ))}
        </nav>
        <address className="not-italic">
          {contact.address.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </address>
        {social ? (
          <ul className="ap-footer__social" aria-label="Réseaux sociaux">
            {social.map((it, i) => (
              <li key={i}>
                <SmartLink href={it.href} aria-label={it.label} title={it.label}>
                  <IconOrImage icon={it.icon} />
                </SmartLink>
              </li>
            ))}
          </ul>
        ) : null}
        <p>
          <a href={telHref(contact.phone)}>{contact.phone}</a>
          <br />
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </p>
      </div>
      <div className="ap-footer__bar" />
    </footer>
  );
}
