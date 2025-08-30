import { Env, json, bad } from "../_types";

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const id = params?.id as string;
  const raw = await env.BQ_HUNTS.get(`hunt:${id}`);
  if (!raw) return bad("Not found", 404);
  return json(JSON.parse(raw));
};
