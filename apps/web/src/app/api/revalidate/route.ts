import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { serverEnv } from "@/lib/env";
import { verify } from "@/lib/signature";

const payloadSchema = z.object({
  tags: z.array(z.string().regex(/^[a-z0-9:_-]{1,64}$/)).min(1).max(50),
});

/**
 * Webhook signé appelé par le thème et le plugin WordPress quand un contenu change.
 * Invalide uniquement les tags concernés (ISR à la demande).
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const timestamp = Number(request.headers.get("x-alterpark-timestamp"));
  const signature = request.headers.get("x-alterpark-signature") ?? "";

  const ok = verify(
    serverEnv().REVALIDATE_SECRET,
    { method: "POST", path: "/api/revalidate", body, timestamp },
    signature,
  );
  if (!ok) return NextResponse.json({ error: "Signature invalide" }, { status: 401 });

  const parsed = payloadSchema.safeParse(JSON.parse(body || "null"));
  if (!parsed.success) return NextResponse.json({ error: "Tags invalides" }, { status: 400 });

  for (const tag of parsed.data.tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ revalidated: parsed.data.tags });
}
