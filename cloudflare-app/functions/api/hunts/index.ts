// /cloudflare-app/functions/api/hunts/index.ts
import { Env, json, bad, requireAdmin } from "../_types";

/**
 * Utility to list keys in KV with a given prefix.
 */
async function listKeys(kv: KVNamespace, prefix: string) {
  const out: any[] = [];
  let cursor: string | undefined = undefined;
  do {
    const r = await kv.list({ prefix, cursor });
    for (const k of r.keys) out.push(k.name.replace(prefix, ""));
    cursor = r.list_complete ? undefined : r.cursor;
  } while (cursor);
  return out;
}

/**
 * Handle GET (list hunts, admin only) and POST (create hunt).
 */
export const onRequest: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;

  if (request.method === "POST") return createHunt(ctx);

  if (request.method === "GET") {
    try {
      requireAdmin(request, env);
      const list = await listKeys(env.BQ_HUNTS, "hunt:");
      return json({ hunts: list });
    } catch {
      return bad("Unauthorized", 401);
    }
  }

  return bad("Method not allowed", 405);
};

/**
 * Create a new hunt and persist to KV.
 */
async function createHunt({ request, env }: Parameters<PagesFunction<Env>>[0]) {
  try {
    const body = await request.json();

    // --- basic validation ---
    if (
      !body ||
      !Array.isArray(body.route) ||
      body.route.length === 0 ||
      !body.route.every(
        (c: any) =>
          typeof c?.location === "string" && c.location.trim().length > 0
      )
    ) {
      return bad(
        "Route must be a non-empty array of clues with 'location' strings.",
        400
      );
    }

    const id = crypto.randomUUID().slice(0, 10);

    const config = {
      id,
      name:
        typeof body.name === "string" && body.name.trim().length > 0
          ? body.name.trim()
          : "Untitled Hunt",
      createdAt: new Date().toISOString(),
      template: body.template || null,
      route: body.route.map((c: any, i: number) => ({
        id: c.id || crypto.randomUUID().slice(0, 8),
        location: c.location.trim(),
        text:
          typeof c.text === "string" && c.text.trim().length > 0
            ? c.text.trim()
            : `Clue ${i + 1}`,
        tagId: c.tagId || null,
        order: i,
      })),
      cooldownSeconds:
        typeof body.cooldownSeconds === "number" &&
        body.cooldownSeconds >= 0 &&
        body.cooldownSeconds <= 3600
          ? body.cooldownSeconds
          : 60,
      public: !!body.public,
    };

    await env.BQ_HUNTS.put(`hunt:${id}`, JSON.stringify(config));

    return json({ ok: true, id });
  } catch (e: any) {
    return bad(e?.message || "Invalid payload", 400);
  }
}
