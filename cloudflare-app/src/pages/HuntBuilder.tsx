// /cloudflare-app/src/pages/HuntBuilder.tsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import QRCodeCard from "../components/QRCodeCard";
import { getOrCreateGroupId } from "../lib/storage";
import ErrorBanner from "../components/ErrorBanner";

type ClueIn = { location: string; text?: string };

const DEFAULT_LOCATIONS = [
  "Front Gate",
  "Big Oak",
  "Bench by Pond",
  "Blue Door",
  "Stone Arch",
  "Flag Pole",
  "Playground Slide",
  "Picnic Table",
  "Bike Rack",
  "Notice Board",
];

export default function HuntBuilder() {
  const [name, setName] = useState("My First Hunt");
  const [style, setStyle] = useState("playful premium");
  const [locations, setLocations] = useState<ClueIn[]>(
    DEFAULT_LOCATIONS.map((l) => ({ location: l }))
  );
  const [clues, setClues] = useState<ClueIn[] | null>(null);
  const [huntId, setHuntId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [notice, setNotice] = useState<string>("");

  useEffect(() => {
    setGroupId(getOrCreateGroupId());
  }, []);

  async function generate() {
    setError(""); setNotice("");
    try {
      const r = await api<{ clues: ClueIn[] }>(`/ai/generate`, {
        method: "POST",
        body: JSON.stringify({
          context: name,
          locations: locations.map((l) => l.location),
          style,
        }),
      });
      setClues(r.clues);
      setNotice("Draft clues generated. Review before creating the hunt.");
    } catch (err: any) {
      setError(err?.message || "Failed to generate clues.");
    }
  }

  async function createHunt() {
    setError(""); setNotice("");
    try {
      const route = (clues || locations).map((c, i) => ({
        location: c.location,
        text: c.text || `Clue ${i + 1} at ${c.location}`,
        order: i,
      }));
      const r = await api<{ ok: boolean; id: string }>(`/hunts`, {
        method: "POST",
        body: JSON.stringify({
          name,
          route,
          cooldownSeconds: 45,
          public: true,
        }),
      });
      setHuntId(r.id);
      setNotice("Hunt created. QR pack and runner link are ready.");
    } catch (err: any) {
      setError(err?.message || "Failed to create hunt.");
    }
  }

  return (
    <div style={{ maxWidth: 960, margin: "40px auto", padding: 16 }}>
      <h1>BetterQuest — Builder (MVP)</h1>

      {error && (
        <div className="mt-2">
          <ErrorBanner kind="error" title="Could not complete that action" message={error} onClose={() => setError("")} />
        </div>
      )}
      {notice && (
        <div className="mt-2">
          <ErrorBanner kind="success" message={notice} onClose={() => setNotice("")} />
        </div>
      )}

      <label>
        Name{" "}
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <div style={{ marginTop: 12 }}>
        <label>
          Clue style{" "}
          <input value={style} onChange={(e) => setStyle(e.target.value)} />
        </label>
      </div>

      <h3 style={{ marginTop: 20 }}>Locations</h3>
      {locations.map((l, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <input
            value={l.location}
            onChange={(e) => {
              const copy = locations.slice();
              copy[i] = { ...copy[i], location: e.target.value };
              setLocations(copy);
            }}
          />
        </div>
      ))}

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button className="btn btn-secondary" onClick={generate}>Generate clues (AI or fallback)</button>
        <button className="btn btn-primary" onClick={createHunt}>Create hunt</button>
      </div>

      {clues && (
        <div style={{ marginTop: 24 }}>
          <h3>Preview Clues</h3>
          <ol>
            {clues.map((c, i) => (
              <li key={i}>
                <strong>{c.location}:</strong> {c.text}
              </li>
            ))}
          </ol>
        </div>
      )}

      {huntId ? (
        <div style={{ marginTop: 24 }}>
          <h3>Print Pack</h3>
          <p>
            Print these QR codes. Each links to the scan endpoint. Order implies
            sequence.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {locations.map((l, i) => {
              // Relaxed QR mode: tagId = "qr"
              const url = `${location.origin}/api/scan/qr?g=${groupId}&h=${huntId}`;
              return (
                <QRCodeCard
                  key={i}
                  text={url}
                  label={`${i + 1}. ${l.location}`}
                />
              );
            })}
          </div>
          <p>
            Runner page:{" "}
            <a href={`/app/run?h=${huntId}`}>/app/run?h={huntId}</a>
            <button
              className="btn btn-secondary"
              style={{ marginLeft: 8 }}
              onClick={async () => {
                const url = `${location.origin}/app/run?h=${huntId}`;
                try {
                  await navigator.clipboard.writeText(url);
                  setNotice("Runner link copied to clipboard.");
                } catch {
                  setNotice(url);
                }
              }}
            >
              Copy link
            </button>
          </p>
        </div>
      ) : (
        <p className="text-muted" style={{ marginTop: 12 }}>
          Create the hunt to generate your runner link and QR cards.
        </p>
      )}
    </div>
  );
}
