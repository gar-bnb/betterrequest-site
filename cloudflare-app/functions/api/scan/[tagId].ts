// /cloudflare-app/functions/api/scan/[tagId].ts
import { Env, json, bad } from "../_types";

/**
 * Scan endpoint
 * - Supports relaxed QR mode when :tagId === "qr"
 * - Enforces sequence for NFC when tagId is set on the next clue
 * - Tracks per-group progress and cooldowns in KV
 *
 * Query params:
 *   g = groupId (uuid stored client-side)
 *   h = huntId
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, params, env }) => {
  try {
    const tagId = (params?.tagId as string) || "qr";
    const url = new URL(request.url);
    const groupId = url.searchParams.get("g");
    const huntId = url.searchParams.get("h");

    if (!groupId || !huntId) return bad("Missing g (group) or h (hunt)", 400);

    // Load hunt
    const huntRaw = await env.BQ_HUNTS.get(`hunt:${huntId}`);
    if (!huntRaw) return bad("Hunt not found", 404);
    const hunt = JSON.parse(huntRaw) as {
      id: string;
      route: Array<{ order: number; location: string; text: string; tagId?: string | null }>;
      cooldownSeconds?: number;
    };

    // Load or init group state
    const stateKey = `state:${huntId}:${groupId}`;
    const now = Date.now();

    const stateRaw = await env.BQ_STATES.get(stateKey);
    let state:
      | {
          groupId: string;
          huntId: string;
          progressIndex: number;
          lastScanAt?: string;
          startedAt: string;
          completedAt?: string;
        }
      | undefined = stateRaw ? JSON.parse(stateRaw) : undefined;

    if (!state) {
      state = {
        groupId,
        huntId,
        progressIndex: 0,
        startedAt: new Date().toISOString(),
      };
    }

    // Cooldown
    const cooldownMs = (hunt.cooldownSeconds ?? 60) * 1000;
    if (state.lastScanAt && now - Date.parse(state.lastScanAt) < cooldownMs) {
      const waitMs = cooldownMs - (now - Date.parse(state.lastScanAt));
      return json({
        status: "cooldown",
        waitMs,
        message: "Please wait before the next scan.",
        nextAllowedAt: new Date(Date.now() + waitMs).toISOString(),
      });
    }

    // Determine expected next clue
    const expectedClue = hunt.route[state.progressIndex];

    // If there is no next clue, the hunt is already complete
    if (!expectedClue) {
      if (!state.completedAt) {
        state.completedAt = new Date().toISOString();
        await env.BQ_STATES.put(stateKey, JSON.stringify(state));
      }
      return json({
        status: "complete",
        message: "All clues have been completed.",
        index: state.progressIndex - 1,
        completedAt: state.completedAt,
      });
    }

    const relaxedQRMode = tagId === "qr";
    const expectedTag = expectedClue.tagId ?? null;

    // Matching logic:
    // - Relaxed QR mode: always allow progression
    // - Strict NFC mode: require expectedTag to match the scanned tagId when one is set
    const tagMatches =
      relaxedQRMode || expectedTag === null || expectedTag === "" ? true : expectedTag === tagId;

    if (!tagMatches) {
      return json({
        status: "mismatch",
        expectedIndex: state.progressIndex,
        message: "Not the correct location yet.",
      });
    }

    // Advance state
    const revealed = expectedClue;
    state.progressIndex += 1;
    state.lastScanAt = new Date().toISOString();

    // Completion check
    const justCompleted = state.progressIndex >= hunt.route.length;
    if (justCompleted && !state.completedAt) {
      state.completedAt = new Date().toISOString();
      // (Optional) Record a simple finish record for ad-hoc leaderboards
      await env.BQ_STATES.put(`finish:${huntId}:${state.groupId}`, state.completedAt);
    }

    await env.BQ_STATES.put(stateKey, JSON.stringify(state));

    return json({
      status: justCompleted ? "complete" : "ok",
      index: revealed.order,
      clue: { text: revealed.text, location: revealed.location },
      nextIndex: state.progressIndex,
      remaining: Math.max(0, hunt.route.length - state.progressIndex),
      completedAt: state.completedAt,
    });
  } catch (e: any) {
    return bad(e?.message || "Scan failed", 500);
  }
};
