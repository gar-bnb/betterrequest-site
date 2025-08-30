import { useEffect, useMemo, useState } from "react";
import QRCodeCard from "../components/QRCodeCard";
import { getOrCreateGroupId } from "../lib/storage";

type Hunt = {
  id: string;
  name?: string;
  route: Array<{ order: number; location: string; text: string }>;
};

export default function PrintPack() {
  const params = new URLSearchParams(location.search);
  const h = params.get("h") || "";
  const group = useMemo(() => getOrCreateGroupId(), []);
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        if (!h) throw new Error("Missing hunt id (?h=...)");
        const res = await fetch(`/api/hunts/${encodeURIComponent(h)}`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const j = (await res.json()) as Hunt;
        setHunt(j);
      } catch (e: any) {
        setErr(e?.message || "Failed to load hunt.");
      }
    })();
  }, [h]);

  if (err) {
    return (
      <main className="section" style={{ paddingTop: 28 }}>
        <div className="container">
          <div className="card" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>
            <strong style={{ color: "#991b1b" }}>Error: </strong>
            <span style={{ color: "#991b1b" }}>{err}</span>
          </div>
        </div>
      </main>
    );
  }

  if (!hunt) {
    return (
      <main className="section" style={{ paddingTop: 28 }}>
        <div className="container"><p>Loading…</p></div>
      </main>
    );
  }

  const runnerUrl = `${location.origin}/app/run?h=${hunt.id}`;
  const scanUrl = (index: number) =>
    `${location.origin}/api/scan/qr?g=${group}&h=${hunt.id}`;

  return (
    <main className="section" style={{ paddingTop: 20 }}>
      <div className="container" style={{ maxWidth: 980 }}>
        {/* Header (hidden in print via @media print) */}
        <div className="card" style={{ display: "grid", gap: 8 }}>
          <h1 className="m-0" style={{ fontSize: 22, fontWeight: 900 }}>
            Print Pack — {hunt.name || `Hunt ${hunt.id}`}
          </h1>
          <p className="text-sm text-muted m-0">
            Runner link: <a href={`/app/run?h=${hunt.id}`}>/app/run?h={hunt.id}</a>
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => window.print()}>Print</button>
            <a className="btn btn-secondary" href={`/app/builder`}>Back to Builder</a>
          </div>
        </div>

        {/* Grid of QR cards */}
        <div
          className="mt-4"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {hunt.route.map((clue, i) => (
            <div key={i} className="card round shadow" style={{ pageBreakInside: "avoid" }}>
              {/* Reuse your QR component; labels are big and legible */}
              <QRCodeCard text={scanUrl(i)} label={`${i + 1}. ${clue.location}`} />
              <div className="text-sm text-muted" style={{ marginTop: 6 }}>
                Runner: <code style={{ fontSize: 12 }}>{runnerUrl}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print CSS overrides */}
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          header, nav, .btn, a.btn, .card > a, .card > button { display: none !important; }
          .section { padding: 0 !important; }
          .container { max-width: none !important; }
          .card { box-shadow: none !important; }
          .text-muted, .text-sm { color: #000 !important; }
        }
      `}</style>
    </main>
  );
}
