"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Alert } from "./Alert";
import type { StatusTone } from "../icons/icons";

/*
 * Toasts — EXTENSION (proposé). Transient feedback after an action, rendered with the system's
 * Alert in a polite live region. Success and info disappear after `duration`; errors and warnings
 * stay until dismissed (WCAG 2.2.1: no time limit on important messages).
 */
export interface ToastInput {
  tone?: StatusTone;
  title?: string;
  message?: ReactNode;
  duration?: number;
}

interface ToastItem extends ToastInput {
  id: number;
}

const ToastContext = createContext<((t: ToastInput) => void) | null>(null);

export function useToast(): (t: ToastInput) => void {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/** Toasts when a provider is present, otherwise a no-op (components usable everywhere). */
export function useOptionalToast(): (t: ToastInput) => void {
  return useContext(ToastContext) ?? noop;
}
const noop = () => {};

function AutoDismiss({ item, onDone }: { item: ToastItem; onDone: (id: number) => void }) {
  useEffect(() => {
    const tone = item.tone ?? "info";
    if (tone === "error" || tone === "warning") return;
    const t = setTimeout(() => onDone(item.id), item.duration ?? 6000);
    return () => clearTimeout(t);
  }, [item, onDone]);
  return null;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const next = useRef(0);
  const remove = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);
  const push = useCallback((t: ToastInput) => {
    next.current += 1;
    const id = next.current;
    setItems((list) => [...list.slice(-3), { ...t, id }]);
  }, []);
  const value = useMemo(() => push, [push]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ul className="ap-toasts" aria-live="polite" aria-relevant="additions">
        {items.map((t) => (
          <li key={t.id}>
            <AutoDismiss item={t} onDone={remove} />
            <Alert tone={t.tone ?? "info"} title={t.title} dismissible onDismiss={() => remove(t.id)}>
              {t.message}
            </Alert>
          </li>
        ))}
      </ul>
    </ToastContext.Provider>
  );
}
