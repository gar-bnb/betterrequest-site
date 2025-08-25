// functions/api/lead.ts

interface Env {
  LEADS: KVNamespace;
  WEBHOOK_URL?: string; // Add in Pages → Settings → Environment variables
}

type LeadPayload = {
  type?: "notify" | "preorder" | string;
  email: string;
  org?: string;
  qty?: number;
  price?: number;
  currency?: string;
  source?: string; // e.g. "tier2-landing"
};

const ONE_YEAR_TTL = 60 * 60 * 24 * 365;

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "POST,OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders },
  });
}

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { headers: corsHeaders });

export const onRequestPost: PagesFunction<Env> = async ({ request, env, cf }) => {
  try {
    // 1) Parse & validate
    const data = (await request.json()) as Partial<LeadPayload>;
    const email = (data.email || "").toString().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: "invalid email" }, 400);
    }

    const now = new Date();
    const id = crypto.randomUUID();

    // 2) Compose record
    const record = {
      id,
      when: now.toISOString(),
      type: (data.type || "notify").toString(),
      email,
      org: (data.org || "").toString() || undefined,
      qty: Number.isFinite(data.qty) ? Number(data.qty) : undefined,
      price: Number.isFinite(data.price) ? Number(data.price) : undefined,
      currency: (data.currency || "").toString() || undefined,
      source: (data.source || "").toString() || undefined,
      ua: request.headers.get("user-agent") || undefined,
      ipHash: await sha256Hex(
        // Hash the connecting IP for light dedupe without storing raw IP
        (request.headers.get("cf-connecting-ip") || "") +
          "|" +
          (request.headers.get("x-forwarded-for") || "")
      ),
      colo: (cf && (cf as any).colo) || undefined,
    };

    // 3) Store to KV
    await env.LEADS.put(`lead:${id}`, JSON.stringify(record), {
      expirationTtl: ONE_YEAR_TTL,
    });

    // 4) Optional webhook ping (Slack or Discord)
    if (env.WEBHOOK_URL) {
      const summary =
        `🟢 BetterQuest lead: ${record.type} — ${record.email}` +
        (record.qty ? ` ×${record.qty}` : "") +
        (record.org ? ` — ${record.org}` : "");

      const isSlack = /slack\.com/.test(env.WEBHOOK_URL);
      const payload = isSlack ? { text: summary } : { content: summary };

      // Fire-and-forget, but don’t crash if it fails
      try {
        await fetch(env.WEBHOOK_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.error("webhook error:", e);
      }
    }

    return json({ ok: true, id });
  } catch (e: any) {
    console.error("lead error:", e);
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
};

// ---- helpers ----
async function sha256Hex(input: string) {
  const enc = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}
