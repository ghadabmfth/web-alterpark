/*
 * Browser errors → /api/monitoring/client-error (structured server log). At most 5 reports per
 * page load; only the message, error name, page path (no query string) and a short stack.
 */
let sent = 0;

function send(name: string, message: string, stack?: string) {
  if (sent >= 5 || !message) return;
  sent += 1;
  const body = JSON.stringify({ name, message: message.slice(0, 1000), path: location.pathname, stack: stack?.slice(0, 2000) });
  try {
    if (!navigator.sendBeacon?.("/api/monitoring/client-error", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/monitoring/client-error", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {
    /* never throw from the error reporter */
  }
}

window.addEventListener("error", (event) => {
  const err = event.error as Error | undefined;
  send(err?.name ?? "Error", err?.message ?? event.message, err?.stack);
});

window.addEventListener("unhandledrejection", (event) => {
  const r = event.reason as Error | undefined;
  send(r?.name ?? "UnhandledRejection", r?.message ?? String(event.reason), r?.stack);
});
