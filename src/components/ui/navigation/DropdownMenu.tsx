"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../lib/cx";
import { SmartLink } from "../lib/link";
import { ChevronIcon } from "../icons/icons";

/*
 * DropdownMenu — EXTENSION (proposé). Action menu (user menu, row actions). WAI-ARIA menu button:
 * Enter/Space/ArrowDown open on the first item, ArrowUp on the last; arrows, Home and End move;
 * Escape and Tab close; focus returns to the trigger. Panel styled like the Header dropdown.
 */
export type MenuEntry =
  | { type?: "item"; label: ReactNode; href?: string; onSelect?: () => void; disabled?: boolean }
  | { type: "separator" };

export interface DropdownMenuProps {
  label: ReactNode;
  /** Accessible name when `label` is not text (e.g. an icon). */
  ariaLabel?: string;
  items: MenuEntry[];
  align?: "start" | "end";
  className?: string;
}

export function DropdownMenu({ label, ariaLabel, items, align = "end", className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const focusOn = useRef<"first" | "last" | null>(null);

  const menuItems = () => Array.from(root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? []);

  useEffect(() => {
    if (!open) return;
    const list = menuItems();
    (focusOn.current === "last" ? list[list.length - 1] : list[0])?.focus();
    const onDoc = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      focusOn.current = e.key === "ArrowUp" ? "last" : "first";
      setOpen(true);
    }
  };

  const onMenuKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const list = menuItems();
    const i = list.indexOf(document.activeElement as HTMLElement);
    const move = (to: number) => {
      e.preventDefault();
      list[(to + list.length) % list.length]?.focus();
    };
    if (e.key === "ArrowDown") move(i + 1);
    else if (e.key === "ArrowUp") move(i - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(list.length - 1);
    else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") close(false);
  };

  return (
    <div ref={root} className={cx("ap-root ap-menu", align === "start" && "ap-menu--start", className)}>
      <button
        ref={trigger}
        type="button"
        className="ap-btn ap-btn--ghost ap-btn--sm"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        aria-label={ariaLabel}
        onClick={() => {
          focusOn.current = "first";
          setOpen(!open);
        }}
        onKeyDown={onTriggerKey}
      >
        <span>{label}</span>
        <span className="ap-btn__icon" aria-hidden><ChevronIcon /></span>
      </button>
      {open ? (
        <ul id={id} role="menu" className="ap-menu__list" onKeyDown={onMenuKey}>
          {items.map((it, i) =>
            it.type === "separator" ? (
              <li key={i} role="separator" className="ap-menu__sep" />
            ) : (
              <li key={i} role="none">
                {it.href && !it.disabled ? (
                  <SmartLink href={it.href} role="menuitem" tabIndex={-1} className="ap-menu__item" onClick={() => close(false)}>
                    {it.label}
                  </SmartLink>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    className="ap-menu__item"
                    aria-disabled={it.disabled || undefined}
                    onClick={() => {
                      if (it.disabled) return;
                      close();
                      it.onSelect?.();
                    }}
                  >
                    {it.label}
                  </button>
                )}
              </li>
            ),
          )}
        </ul>
      ) : null}
    </div>
  );
}
