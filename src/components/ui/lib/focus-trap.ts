"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

/**
 * While `active`: focuses the first focusable element of `ref`, keeps Tab / Shift+Tab inside it,
 * calls `onEscape` on Escape, optionally locks page scroll, and restores focus on close.
 * Shared by Modal, VideoModal and ConfirmDialog (behaviour of the bundle's dialogs).
 */
export function useDialogFocus(ref: RefObject<HTMLElement | null>, active: boolean, onEscape?: () => void, lockScroll = false) {
  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    el?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    const overflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape?.();
      if (e.key === "Tab" && el) {
        const list = el.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (!list.length) return;
        const first = list[0]!;
        const last = list[list.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (lockScroll) document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [ref, active, onEscape, lockScroll]);
}
