export const onRequestPost: PagesFunction<{ LEADS: KVNamespace }> = async ({ request, env }) => {
  try {
    const data = await request.json();
    if (!data?.email) return new Response("email required", { status: 400 });

    const id = crypto.randomUUID();
    const when = new Date().toISOString();

    await env.LEADS.put(
      `lead:${id}`,
      JSON.stringify({ id, when, ...data }),
      { expirationTtl: 60 * 60 * 24 * 365 } // store for 1 year
    );

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response("bad request", { status: 400 });
  }
};
