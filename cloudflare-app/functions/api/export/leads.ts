import { Env, bad } from "../_types";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token !== env.ADMIN_TOKEN) return bad("Unauthorized", 401);

  const rows: string[] = ["id,ts,name,email,notes"];
  let cursor: string | undefined = undefined;
  do {
    const list = await env.BQ_HUNTS.list({ prefix: "lead:", cursor });
    for (const k of list.keys) {
      const v = await env.BQ_HUNTS.get(k.name, "json");
      if (v) rows.push(`${v.id},${v.ts},${csv(v.name)},${csv(v.email)},${csv(v.notes || "")}`);
    }
    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=leads.csv",
    },
  });
};

function csv(s: string) {
  if (s == null) return "";
  const needs = /[",\n]/.test(s);
  return needs ? `"${String(s).replace(/"/g, '""')}"` : String(s);
}
