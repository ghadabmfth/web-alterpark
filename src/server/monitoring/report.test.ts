import { afterEach, describe, expect, it, vi } from "vitest";
import { reportError, stripQuery, toReport } from "./report";

describe("error reports", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.ERROR_WEBHOOK_URL;
  });

  it("never keep query strings (tokens) and stay bounded", () => {
    expect(stripQuery("/reinitialiser-mot-de-passe?token=secret")).toBe("/reinitialiser-mot-de-passe");
    expect(stripQuery("/a#b")).toBe("/a");
    const r = toReport({ source: "server", message: "x".repeat(5000), path: "/verification?token=t", stack: Array.from({ length: 50 }, (_, i) => `at ${i}`).join("\n") });
    expect(r.message).toHaveLength(1000);
    expect(r.path).toBe("/verification");
    expect(r.stack!.split("\n")).toHaveLength(12);
    expect(r.event).toBe("alterpark.error");
  });

  it("logs one JSON line and posts to the webhook when configured", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));
    await reportError({ source: "client", message: "boom" });
    expect(JSON.parse(log.mock.calls[0]![0] as string)).toMatchObject({ event: "alterpark.error", source: "client", message: "boom" });
    expect(fetchMock).not.toHaveBeenCalled();
    process.env.ERROR_WEBHOOK_URL = "https://hooks.example.invalid/x";
    fetchMock.mockRejectedValueOnce(new Error("network down"));
    await expect(reportError({ source: "server", message: "boom" })).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
