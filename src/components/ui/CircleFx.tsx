"use client";

import { useEffect } from "react";

const SELECTOR = ".ap-btn, .ap-bk__submit, .ap-carousel__arrow";

/**
 * Hover circle effect of the design system: a disc grows from the pointer's entry point
 * (position written to --cx / --cy). Mounted once in the root layout; renders nothing.
 */
export function CircleFx() {
  useEffect(() => {
    const place = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>(SELECTOR) : null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--cx", `${e.clientX - r.left}px`);
      el.style.setProperty("--cy", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointerover", place, true);
    document.addEventListener("pointerout", place, true);
    return () => {
      document.removeEventListener("pointerover", place, true);
      document.removeEventListener("pointerout", place, true);
    };
  }, []);
  return null;
}
