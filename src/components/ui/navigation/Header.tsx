"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Image from "next/image";
import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import { SmartLink } from "../lib/link";
import { useMounted } from "../lib/mounted";
import { ArrowRightIcon, ChevronIcon, CloseIcon } from "../icons/icons";
import { SvgIcon } from "../icons/SvgIcon";
import { Button } from "../actions/Button";
import { siteContact, telHref, type SiteContact } from "@/config/site";
import type { LinkAction, NavLink } from "./types";

/*
 * Header — design system "Navigation". 10 px orange rule, navigation split in two halves around
 * the centred logo; below 1024 px a burger opens a drawer sliding from the right (scrim, page
 * scroll locked, Escape closes, focus moves to the close button).
 */
export interface HeaderProps {
  links: NavLink[];
  logoSrc?: string;
  homeHref?: string;
  cta?: LinkAction;
  defaultOpen?: boolean;
  /** Shown when hovering the logo (e.g. a mini RatingBadge). */
  logoBadge?: ReactNode;
  /** Sticks to the top, compact and opaque, after `stickyOffset` px of scrolling. */
  sticky?: boolean;
  stickyOffset?: number;
  /** Contact block of the drawer; `false` hides it. */
  contact?: SiteContact | false;
  className?: string;
}

/** A link is current when it matches the path (or is a parent section of it), unless `active` is set. */
function isCurrent(item: NavLink, pathname: string): boolean {
  if (item.active !== undefined) return item.active;
  const hrefs = [item.href, ...(item.children ?? []).map((c) => c.href)].filter((h): h is string => !!h && h.startsWith("/"));
  return hrefs.some((h) => (h === "/" ? pathname === "/" : pathname === h || pathname.startsWith(`${h}/`)));
}

function NavItem({ item }: { item: NavLink }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!item.children) {
    return (
      <li>
        <SmartLink className="ap-navlink" href={item.href ?? "#"} aria-current={item.active ? "page" : undefined}>
          {item.label}
        </SmartLink>
      </li>
    );
  }
  return (
    <li className="ap-dropdown" ref={ref}>
      <button type="button" className="ap-navlink" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        {item.label}
        <ChevronIcon />
      </button>
      {open ? (
        <ul id={id} className="ap-dropdown__menu">
          {item.children.map((c, i) => (
            <li key={i}>
              <SmartLink href={c.href ?? "#"}>{c.label}</SmartLink>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function DrawerItem({ item, index, onNavigate }: { item: NavLink; index: number; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const style = { "--i": index } as React.CSSProperties;
  if (!item.children) {
    return (
      <li style={style}>
        <SmartLink className="ap-navlink" href={item.href ?? "#"} aria-current={item.active ? "page" : undefined} onClick={onNavigate}>
          {item.label}
          <span className="ap-mnav__go" aria-hidden>
            <ArrowRightIcon />
          </span>
        </SmartLink>
      </li>
    );
  }
  return (
    <li style={style}>
      <button type="button" className="ap-navlink" aria-expanded={open} onClick={() => setOpen(!open)}>
        {item.label}
        <ChevronIcon />
      </button>
      {open ? (
        <ul className="ap-sub">
          {item.children.map((c, i) => (
            <li key={i}>
              <SmartLink href={c.href ?? "#"} onClick={onNavigate}>{c.label}</SmartLink>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function Header({
  links,
  logoSrc,
  homeHref = "/",
  cta,
  defaultOpen,
  logoBadge,
  sticky,
  stickyOffset = 160,
  contact = siteContact,
  className,
}: HeaderProps) {
  const half = Math.ceil(links.length / 2);
  const [open, setOpen] = useState(!!defaultOpen);
  const [stuck, setStuck] = useState(false);
  const drawerId = useId();
  const pathname = usePathname() ?? "/";
  const current = (it: NavLink): NavLink => ({ ...it, active: isCurrent(it, pathname) });
  const closeRef = useRef<HTMLButtonElement>(null);
  const mounted = useMounted();

  useEffect(() => {
    if (!sticky) return;
    const onScroll = () => setStuck(window.scrollY > stickyOffset);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sticky, stickyOffset]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => closeRef.current?.focus(), 50);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      clearTimeout(t);
    };
  }, [open]);

  const close = () => setOpen(false);

  const drawer = (
    <div className={cx("ap-root ap-mnav", open && "is-open")} aria-hidden={!open}>
      <div className="ap-mnav__scrim" onClick={close} />
      <aside id={drawerId} className="ap-mnav__panel" role="dialog" aria-modal="true" aria-label="Menu" inert={!open}>
        <div className="ap-mnav__head">
          <SmartLink className="ap-mnav__logo" href={homeHref} onClick={close}>
            <SvgIcon name="logo" label="AlterPark, accueil" className="ap-logo" />
          </SmartLink>
          <button ref={closeRef} type="button" className="ap-mnav__close" aria-label="Fermer le menu" onClick={close}>
            <CloseIcon />
          </button>
        </div>
        <nav className="ap-mnav__nav" aria-label="Menu mobile">
          <ul>
            {links.map((it, i) => (
              <DrawerItem key={i} item={current(it)} index={i} onNavigate={close} />
            ))}
          </ul>
        </nav>
        <div className="ap-mnav__foot">
          {cta?.href ? (
            <Button href={cta.href} fullWidth onClick={close}>{cta.label}</Button>
          ) : null}
          {contact ? (
            <div className="ap-mnav__contact">
              <a href={telHref(contact.phone)}>{contact.phone}</a>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );

  const list = (items: NavLink[]) => (
    <ul className="ap-header__list">
      {items.map((it, i) => (
        <NavItem key={i} item={current(it)} />
      ))}
    </ul>
  );

  return (
    <header className={cx("ap-root ap-header", sticky && "ap-header--sticky", stuck && "is-stuck", open && "is-open", className)}>
      <div className="ap-header__bar" />
      <div className="ap-header__inner">
        <nav className="ap-header__nav ap-header__nav--start" aria-label="Navigation principale">
          {list(links.slice(0, half))}
        </nav>
        <div className={cx("ap-header__brand", !!logoBadge && "has-badge")}>
          <SmartLink className="ap-header__logo" href={homeHref}>
            {logoSrc ? (
              <Image src={logoSrc} alt="AlterPark — L’autre parking, accueil" width={194} height={109} loading="eager" />
            ) : (
              <SvgIcon name="logo" label="AlterPark — L’autre parking, accueil" className="ap-logo" />
            )}
          </SmartLink>
          {logoBadge ? <div className="ap-header__badge">{logoBadge}</div> : null}
        </div>
        <nav className="ap-header__nav ap-header__nav--end" aria-label="Navigation secondaire">
          {list(links.slice(half))}
        </nav>
        <button
          type="button"
          className="ap-header__burger"
          aria-expanded={open}
          aria-controls={drawerId}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      {mounted ? createPortal(drawer, document.body) : null}
    </header>
  );
}
