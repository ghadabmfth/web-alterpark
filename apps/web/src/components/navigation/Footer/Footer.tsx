import { cx } from "../../lib/cx";
import { SvgIcon } from "../../icons/SvgIcon";
import { ApImage } from "../../lib/ApImage";
import { IconOrImage } from "../../lib/IconOrImage";
import type { SocialRailItem } from "../SocialRail/SocialRail";

export interface FooterProps {
  year?: number;
  logoSrc?: string;
  homeHref?: string;
  legalLinks?: { label: string; href: string }[];
  address?: string[];
  phone?: string;
  email?: string;
  /** liens sociaux affichés sous 1024 px */
  social?: SocialRailItem[];
  className?: string;
}

/**
 * Pied de page : logo, droits, mentions légales, adresse, contact, filet orange de 10 px.
 * Les coordonnées et liens par défaut du bundle sont retirés : ils viennent des réglages WordPress.
 */
export function Footer({ year, logoSrc, homeHref, legalLinks, address, phone, email, social, className }: FooterProps) {
  const y = year ?? new Date().getFullYear();
  return (
    <footer className={cx("ap-root ap-footer", className)}>
      <div className="ap-footer__inner">
        <a className="ap-footer__logo" href={homeHref || "/"}>
          {logoSrc ? <ApImage src={logoSrc} alt="AlterPark, accueil" /> : <SvgIcon name="logo" label="AlterPark, accueil" className="ap-logo" />}
        </a>
        <p>
          Tous droits réservés © <strong>Alterpark</strong> {y}
        </p>
        {legalLinks?.length ? (
          <nav className="ap-footer__legal" aria-label="Informations légales">
            {legalLinks.map((l, i) => (
              <a key={i} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        ) : null}
        {address?.length ? (
          <address style={{ fontStyle: "normal" }}>
            {address.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </address>
        ) : null}
        {social ? (
          <ul className="ap-footer__social" aria-label="Réseaux sociaux">
            {social.map((it, i) => (
              <li key={i}>
                <a href={it.href} aria-label={it.label} title={it.label}>
                  <IconOrImage src={it.icon} />
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        {phone || email ? (
          <p>
            {phone ? <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a> : null}
            {phone && email ? <br /> : null}
            {email ? <a href={`mailto:${email}`}>{email}</a> : null}
          </p>
        ) : null}
      </div>
      <div className="ap-footer__bar" />
    </footer>
  );
}
