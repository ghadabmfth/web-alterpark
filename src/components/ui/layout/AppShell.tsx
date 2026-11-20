"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cx } from "../lib/cx";
import { SmartLink } from "../lib/link";
import { SvgIcon } from "../icons/SvgIcon";
import { CloseIcon, MenuIcon } from "../icons/icons";

/*
 * AppShell — EXTENSION (proposé). Layout of the back office and the customer area: sidebar
 * navigation (groups of links, current page marked) and a top bar for page-level controls
 * (user menu). Below 1024 px the sidebar is a drawer: burger to open, scrim / Escape / link to
 * close, `inert` while closed so hidden links are unreachable.
 */
export interface ShellNavGroup {
  title?: string;
  items: { label: string; href: string; current?: boolean }[];
}

export interface AppShellProps {
  /** Small caps label under the logo, e.g. « Back-office ». */
  context?: string;
  navLabel: string;
  nav: ShellNavGroup[];
  homeHref?: string;
  topbar?: ReactNode;
  children: ReactNode;
  className?: string;
}

const DESKTOP = "(min-width: 1024px)";
function subscribe(cb: () => void) {
  const mql = window.matchMedia(DESKTOP);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

export function AppShell({ context, navLabel, nav, homeHref = "/", topbar, children, className }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const desktop = useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => true);
  const burger = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const drawerOpen = open && !desktop;

  useEffect(() => {
    if (!drawerOpen) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        burger.current?.focus();
      }
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [drawerOpen]);

  return (
    <div className={cx("ap-root ap-shell", drawerOpen && "is-open", className)}>
      <div className="ap-shell__scrim" onClick={() => setOpen(false)} aria-hidden />
      <div className="ap-shell__side" inert={!desktop && !open}>
        <div className="ap-shell__brand">
          <SmartLink href={homeHref}>
            <SvgIcon name="logo" label="AlterPark, accueil" className="ap-logo" />
          </SmartLink>
          <button ref={closeBtn} type="button" className="ap-shell__close" aria-label="Fermer le menu" onClick={() => setOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        <nav className="ap-shell__nav" aria-label={navLabel}>
          {context ? <p className="ap-shell__context">{context}</p> : null}
          {nav.map((g, i) => (
            <div key={i} className="ap-shell__group">
              {g.title ? <p className="ap-shell__group-title">{g.title}</p> : null}
              <ul>
                {g.items.map((it) => (
                  <li key={it.href}>
                    <SmartLink href={it.href} aria-current={it.current ? "page" : undefined} onClick={() => setOpen(false)}>
                      {it.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="ap-shell__main">
        <div className="ap-shell__top">
          <button ref={burger} type="button" className="ap-shell__burger" aria-label="Ouvrir le menu" aria-expanded={drawerOpen} onClick={() => setOpen(true)}>
            <MenuIcon />
          </button>
          <div className="ml-auto flex items-center gap-3">{topbar}</div>
        </div>
        <main id="contenu" className="ap-shell__content">{children}</main>
      </div>
    </div>
  );
}
