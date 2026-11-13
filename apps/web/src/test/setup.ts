import { afterEach } from "vitest";

// Démonte les rendus Testing Library entre deux tests (environnement jsdom uniquement).
afterEach(async () => {
  if (typeof document === "undefined") return;
  const { cleanup } = await import("@testing-library/react");
  cleanup();
});
