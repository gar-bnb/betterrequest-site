import { Env, bad } from "../_types";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token !== env.ADMIN_TOKEN) return bad("Unauthorized", 401);

  const rows: string[] = ["ts,event,label,path,ua,ip,ref"];
  let cursor: string | undefined;
  do {
    const list = await env.BQ_HUNTS.list({ prefix: "metric:", cursor });
    for (const k of list.keys) {
      const v = await env.BQ_HUNTS.get(k.name, "json");
      if (v) {
        const csv = (s: any) => {
          if (s == null) return "";
          const str = String(s);
          return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
        };
        rows.push([v.ts, v.event, v.label, v.path, v.ua, v.ip, v.ref].map(csv).join(","));
      }
    }
    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=metrics.csv",
    },
  });
};
