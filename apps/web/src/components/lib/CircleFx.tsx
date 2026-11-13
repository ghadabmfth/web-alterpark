"use client";

import { useEffect } from "react";

const SEL = ".ap-btn, .ap-bk__submit, .ap-carousel__arrow";

/**
 * Effet cercle au survol (styles/circle-fx.css) : un disque part du point d'entrée du pointeur,
 * position transmise en --cx / --cy. Écouteur global unique, comme l'IIFE de bundle.js.
 * Monté une fois dans le layout racine ; ne rend rien.
 */
export function CircleFx() {
  useEffect(() => {
    const place = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>(SEL) : null;
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
