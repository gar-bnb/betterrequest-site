export const onRequestGet: PagesFunction = async ({ env }) => {
  const has = (x: any) => (x ? "yes" : "no");
  const info = {
    BQ_HUNTS: has((env as any).BQ_HUNTS),
    BQ_STATES: has((env as any).BQ_STATES),
    BQ_TAGS: has((env as any).BQ_TAGS),
    ADMIN_TOKEN: has((env as any).ADMIN_TOKEN),
    USE_AI: (env as any).USE_AI ?? null,
  };
  return new Response(JSON.stringify(info, null, 2), {
    headers: { "content-type": "application/json" },
  });
};
