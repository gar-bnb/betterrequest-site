// POST /api/metrics  { event: string, label?: string, path?: string }
import type { Env } from "./_types";
import { json, bad } from "./_types";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json();
    const event = String(body?.event || "").trim();
    if (!event) return bad("Missing event", 400);

    const rec = {
      id: crypto.randomUUID(),
      ts: new Date().toISOString(),
      event,
      label: typeof body?.label === "string" ? body.label.slice(0, 128) : undefined,
      path: typeof body?.path === "string" ? body.path : new URL(request.url).searchParams.get("p") || undefined,
      ua: request.headers.get("user-agent") || "",
      ip: request.headers.get("cf-connecting-ip") || "",
      ref: request.headers.get("referer") || "",
    };

    await env.BQ_HUNTS.put(`metric:${rec.ts}:${rec.id}`, JSON.stringify(rec), { expirationTtl: 60 * 60 * 24 * 30 }); // 30 days
    return json({ ok: true });
  } catch (e: any) {
    return bad(e?.message || "Bad request", 400);
  }
};
