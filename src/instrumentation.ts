import type { Instrumentation } from "next";

/* Server errors → structured log (+ optional webhook). See src/server/monitoring/report.ts. */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const { reportError } = await import("@/server/monitoring/report");
  const e = err as Partial<Error> & { digest?: string };
  await reportError({
    source: "server",
    name: e?.name,
    message: e?.message ?? String(err),
    digest: e?.digest,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    stack: e?.stack,
  });
};
