"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** False during server rendering and hydration, true afterwards (safe gate for portals). */
export function useMounted(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
