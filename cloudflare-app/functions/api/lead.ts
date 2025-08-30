// /cloudflare-app/functions/api/lead.ts
import { Env, json, bad } from "./_types";

/**
 * Handle POST /api/lead
 * Stores a lead or preorder in KV and optionally notifies Slack.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const payload = await request.json();

    // --- basic validation ---
    if (typeof payload?.email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) {
      return bad("Invalid email", 400);
    }
    if (typeof payload?.type !== "string") {
      return bad("Missing type", 400);
    }

    const id = crypto.randomUUID();
    const record = {
      id,
      ...payload,
      ts: new Date().toISOString(),
    };

    // store in KV
    await env.BQ_HUNTS.put(`lead:${id}`, JSON.stringify(record));

    // optional Slack webhook
    if (env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(env.SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `📩 New lead: ${record.email} (${record.type})`,
          }),
        });
      } catch (err) {
        console.error("Slack webhook failed", err);
      }
    }

    return json({ ok: true, id });
  } catch (e: any) {
    return bad(e?.message || "Invalid payload", 400);
  }
};
