"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../lib/cx";
import type { Href } from "../../lib/types";
import { ArrowRightIcon, ChevronIcon, CloseIcon } from "../../icons/ui";
import { SvgIcon } from "../../icons/SvgIcon";
import { Button } from "../../actions/Button/Button";
import { ApImage } from "../../lib/ApImage";

export interface NavLink {
  label: string;
  href?: string;
  active?: boolean;
  children?: { label: string; href?: string }[];
}

export interface HeaderProps {
  links: NavLink[];
  logoSrc?: string;
  homeHref?: string;
  cta?: Href;
  defaultOpen?: boolean;
  /** contenu affiché au survol du logo (ex. RatingBadge size="mini") */
  logoBadge?: ReactNode;
  /** se fixe en haut, compact, après défilement */
  sticky?: boolean;
  stickyOffset?: number;
  /** Coordonnées en bas du menu mobile (réglages WordPress). Absentes : bloc masqué. */
  phone?: string;
  email?: string;
  className?: string;
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
        <a className="ap-navlink" href={item.href || "#"} aria-current={item.active ? "page" : undefined}>
          {item.label}
        </a>
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
              <a href={c.href || "#"}>{c.label}</a>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function DrawerItem({ item, index, onNavigate }: { item: NavLink; index: number; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const style = { "--i": index } as CSSProperties;
  if (!item.children) {
    return (
      <li style={style}>
        <a className="ap-navlink" href={item.href || "#"} aria-current={item.active ? "page" : undefined} onClick={onNavigate}>
          {item.label}
          <span className="ap-mnav__go" aria-hidden>
            <ArrowRightIcon />
          </span>
        </a>
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
              <a href={c.href || "#"} onClick={onNavigate}>
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

const noop = () => () => {};

/** En-tête du site : filet orange de 10 px, navigation en deux moitiés autour du logo centré ; burger et panneau en mobile. */
export function Header({ links, logoSrc, homeHref, cta, defaultOpen, logoBadge, sticky, stickyOffset, phone, email, className }: HeaderProps) {
  const half = Math.ceil(links.length / 2);
  const [open, setOpen] = useState(!!defaultOpen);
  const [stuck, setStuck] = useState(false);
  const drawerId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  // Le panneau est rendu dans <body> (portail) une fois côté client, hors du conteneur de l'en-tête.
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  /* sticky : l'en-tête se fixe en haut, compact et opaque, après `stickyOffset` px de défilement. */
  useEffect(() => {
    if (!sticky) return;
    const off = stickyOffset || 160;
    const onScroll = () => setStuck(window.scrollY > off);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sticky, stickyOffset]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  /* Menu mobile : panneau qui glisse depuis la droite, voile cliquable, défilement de la page bloqué. */
  useEffect(() => {
    if (!open) return;
    const ov = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = ov;
      clearTimeout(t);
    };
  }, [open]);

  const close = () => setOpen(false);
  const drawer = (
    <div className={cx("ap-root ap-mnav", open && "is-open")} aria-hidden={!open}>
      <div className="ap-mnav__scrim" onClick={close} />
      <aside id={drawerId} className="ap-mnav__panel" role="dialog" aria-modal="true" aria-label="Menu" inert={!open}>
        <div className="ap-mnav__head">
          <a className="ap-mnav__logo" href={homeHref || "/"} onClick={close}>
            <SvgIcon name="logo" label="AlterPark, accueil" className="ap-logo" />
          </a>
          <button ref={closeRef} type="button" className="ap-mnav__close" aria-label="Fermer le menu" onClick={close}>
            <CloseIcon />
          </button>
        </div>
        <nav className="ap-mnav__nav" aria-label="Menu mobile">
          <ul>
            {links.map((it, i) => (
              <DrawerItem key={i} item={it} index={i} onNavigate={close} />
            ))}
          </ul>
        </nav>
        <div className="ap-mnav__foot">
          {cta ? (
            <Button href={cta.href} fullWidth onClick={close}>
              {cta.label}
            </Button>
          ) : null}
          {phone || email ? (
            <div className="ap-mnav__contact">
              {phone ? <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a> : null}
              {email ? <a href={`mailto:${email}`}>{email}</a> : null}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );

  const list = (items: NavLink[]) => (
    <ul className="ap-header__list">
      {items.map((it, i) => (
        <NavItem key={i} item={it} />
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
          <a className="ap-header__logo" href={homeHref || "/"}>
            {logoSrc ? (
              <ApImage src={logoSrc} alt="AlterPark — L’autre parking, accueil" priority />
            ) : (
              <SvgIcon name="logo" label="AlterPark — L’autre parking, accueil" className="ap-logo" />
            )}
          </a>
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
      {mounted ? createPortal(drawer, document.body) : drawer}
    </header>
  );
}
