export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Simple probe to confirm Worker is running
    if (url.pathname === "/hello" && request.method === "GET") {
      return new Response("hello from pages functions", {
        headers: { "content-type": "text/plain" },
      });
    }

    // API endpoint for leads
    if (url.pathname === "/api/lead" && request.method === "POST") {
      try {
        const data = await request.json();
        if (!data?.email) {
          return new Response("email required", { status: 400 });
        }
        const id = crypto.randomUUID();
        const when = new Date().toISOString();
        await env.LEADS.put(
          `lead:${id}`,
          JSON.stringify({ id, when, ...data }),
          { expirationTtl: 60 * 60 * 24 * 365 }
        );
        return new Response(JSON.stringify({ ok: true }), {
          headers: { "content-type": "application/json" },
        });
      } catch {
        return new Response("bad request", { status: 400 });
      }
    }

    // Fall through to static assets (built by Vite into /dist)
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

interface Env {
  ASSETS: Fetcher;           // Provided automatically by Pages for static 
files
  LEADS: KVNamespace;        // Bind this in Settings → Bindings
}

