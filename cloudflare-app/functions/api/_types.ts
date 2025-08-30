export interface Env {
  BQ_HUNTS: KVNamespace;
  BQ_STATES: KVNamespace;
  BQ_TAGS: KVNamespace;
  SLACK_WEBHOOK_URL?: string;
  OPENAI_API_KEY?: string;
  APP_BASE_URL?: string;
  USE_AI?: string; // "true" | "false"
  ADMIN_TOKEN?: string; // simple bearer for admin endpoints
}

export const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });

export const bad = (msg: string, status = 400) =>
  json({ error: msg }, { status });

export function requireAdmin(req: Request, env: Env) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token !== env.ADMIN_TOKEN) throw new Error("Unauthorized");
}
