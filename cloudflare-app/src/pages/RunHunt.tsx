// /cloudflare-app/src/pages/RunHunt.tsx
import { useEffect, useState } from "react";
import { getOrCreateGroupId } from "../lib/storage";
import ErrorBanner from "../components/ErrorBanner";

/**
 * Runner page
 * - Lives under /app/run?h=<huntId>
 * - Calls /api/scan/qr (relaxed mode) or NFC /api/scan/:tagId
 * - Handles cooldowns, mismatch, and completion states
 */
export default function RunHunt() {
  const params = new URLSearchParams(location.search);
  const h = params.get("h"); // huntId
  const [text, setText] = useState<string>("Scan the first QR to begin.");
  const [wait, setWait] = useState<number>(0);
  const [error, setError] = useState<string>("");

  // Countdown for cooldowns
  useEffect(() => {
    const id = setInterval(
      () => setWait((w) => (w > 0 ? Math.max(0, w - 1000) : 0)),
      1000
    );
    return () => clearInterval(id);
  }, []);

  // Expose a scan() helper for NFC/QR or the "Simulate" button
  (window as any).bq = {
    async scan() {
      if (!h) {
        setError("Missing hunt id in URL (?h=...)");
        return;
      }
      setError("");
      try {
        const res = await fetch(
          `/api/scan/qr?g=${getOrCreateGroupId()}&h=${h}`
        );
        const j = await res.json();

        if (j.status === "cooldown") {
          setWait(Math.ceil(j.waitMs / 1000) * 1000);
          setText("⏳ Cooldown active. Please wait...");
        } else if (j.status === "mismatch") {
          setText(j.message || "That's not the right spot yet. Keep searching!");
        } else if (j.status === "complete") {
          setText("🎉 Hunt complete! Nicely done.");
        } else if (j.status === "ok") {
          setText(j.clue?.text || "Next clue revealed.");
        } else {
          setError("Unexpected response from server.");
        }
      } catch (e: any) {
        setError(e?.message || "Network error. Please try again.");
      }
    },
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", textAlign: "center" }}>
      <h1>BetterQuest — Run</h1>

      {error && (
        <div style={{ marginBottom: 12 }}>
          <ErrorBanner kind="error" title="Runner issue" message={error} onClose={() => setError("")} />
        </div>
      )}

      <p>{text}</p>

      {wait > 0 && (
        <p>Please wait {Math.ceil(wait / 1000)}s before the next scan.</p>
      )}

      <button className="btn btn-primary" onClick={() => (window as any).bq.scan()}>
        Simulate Scan
      </button>

      <p style={{ marginTop: 16, fontSize: 12, color: "#666" }}>
        Tip: For NFC tags, program them to{" "}
        <code>
          /api/scan/&lt;tagId&gt;?g=&lt;group&gt;&amp;h=&lt;hunt&gt;
        </code>{" "}
        to enforce strict order.
        <br />
        For QR-only hunts, use{" "}
        <code>/api/scan/qr?g=&lt;group&gt;&amp;h=&lt;hunt&gt;</code>.
      </p>
    </div>
  );
}
