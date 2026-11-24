"use client";

import { useState } from "react";
import { LineIcon } from "./LineIcon";

/** Copies a text (e.g. the address for a GPS) and confirms it in a live region. */
export function CopyButton({ text, label = "Copier l’adresse" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="access-action"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2500);
        } catch {
          setDone(false);
        }
      }}
    >
      <LineIcon name="copy" />
      <span aria-live="polite">{done ? "Adresse copiée" : label}</span>
    </button>
  );
}
