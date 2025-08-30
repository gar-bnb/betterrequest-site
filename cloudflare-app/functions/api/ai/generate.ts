import { Env, json, bad } from "../_types";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json<{ context: string; locations: string[]; style?: string }>();

    const useAi = (env.USE_AI || "false").toLowerCase() === "true";
    if (!useAi || !env.OPENAI_API_KEY) {
      const clues = body.locations.map((loc, i) => ({
        location: loc,
        text: `Riddle ${i + 1}: Seek the place called "${loc}" — look low, then high, and you will spy the hint you need.`,
      }));
      return json({ clues, model: "template-fallback" });
    }

    const prompt = `Create short, family-friendly treasure-hunt clues for these locations: ${body.locations.join(
      ", "
    )}. Tone: ${body.style || "playful premium"}. Keep each 1-2 sentences.`;

    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4.1-mini", input: prompt }),
    });

    if (!res.ok) {
      const fallback = body.locations.map((loc, i) => ({ location: loc, text: `Clue ${i + 1} at ${loc}.` }));
      return json({ clues: fallback, model: "fallback-error" });
    }

    const data = await res.json<any>();
    const text: string = data.output_text || "";
    const lines = text
      .split(/\n+/)
      .map((s) => s.replace(/^[-•\d\.\s]+/, "").trim())
      .filter(Boolean);

    const clues = body.locations.map((loc, i) => ({
      location: loc,
      text: lines[i] || `Clue ${i + 1} at ${loc}.`,
    }));
    return json({ clues, model: "gpt-4.1-mini" });
  } catch (e: any) {
    return bad(e?.message || "Bad request", 400);
  }
};
