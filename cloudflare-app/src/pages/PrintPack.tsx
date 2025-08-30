import { useEffect, useMemo, useState } from "react";
import QRCodeCard from "../components/QRCodeCard";
import { getOrCreateGroupId } from "../lib/storage";
import { toDataURL } from "qrcode";

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
  const [downloading, setDownloading] = useState(false);

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
  const scanUrl = () => `${location.origin}/api/scan/qr?g=${group}&h=${hunt.id}`;

  async function downloadPdf(current: Hunt) {
    try {
      setDownloading(true);
      const { jsPDF } = await import("jspdf"); // dynamic import keeps main bundle lean

      // A4 portrait (pt)
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      // Layout: 2 cards / page
      const margin = 36; // 0.5"
      const cardH = (pageH - margin * 3) / 2;
      const cardW = pageW - margin * 2;

      const qrSize = Math.min(260, cardW * 0.4);
      const labelY = margin + 22;

      for (let i = 0; i < current.route.length; i++) {
        if (i > 0 && i % 2 === 0) pdf.addPage();

        const row = i % 2;
        const topY = margin + row * (cardH + margin);

        const clue = current.route[i];
        const label = `${i + 1}. ${clue.location}`;
        const url = `${location.origin}/api/scan/qr?g=${group}&h=${current.id}`;

        // QR as PNG
        const dataUrl = await toDataURL(url, { margin: 1, width: qrSize });

        // Card border
        pdf.setDrawColor(229, 231, 235);
        pdf.roundedRect(margin, topY, cardW, cardH, 12, 12);

        // Title
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text(label, margin + 16, labelY + row * (cardH + margin));

        // QR image
        pdf.addImage(dataUrl, "PNG", margin + 16, topY + 32, qrSize, qrSize, undefined, "FAST");

        // Runner link
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        const textX = margin + 16 + qrSize + 16;
        const textY = topY + 40;
        pdf.text("Runner:", textX, textY);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${location.origin}/app/run?h=${current.id}`, textX, textY + 14, {
          maxWidth: cardW - (qrSize + 48),
        });

        // Optional clue body
        // pdf.setFont("helvetica", "normal");
        // pdf.setFontSize(12);
        // pdf.text(clue.text, textX, textY + 40, { maxWidth: cardW - (qrSize + 48) });
      }

      pdf.save(`BetterQuest-QR-Pack-${current.id}.pdf`);
    } catch {
      alert("Failed to generate PDF. Try the Print button instead.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <main className="section" style={{ paddingTop: 20 }}>
      <div className="container" style={{ maxWidth: 980 }}>
        {/* Header (hidden in print) */}
        <div className="card" style={{ display: "grid", gap: 8 }}>
          <h1 className="m-0" style={{ fontSize: 22, fontWeight: 900 }}>
            Print Pack — {hunt.name || `Hunt ${hunt.id}`}
          </h1>
          <p className="text-sm text-muted m-0">
            Runner link: <a href={`/app/run?h=${hunt.id}`}>/app/run?h={hunt.id}</a>
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => window.print()}>Print</button>
            <button
              className="btn btn-secondary"
              onClick={() => downloadPdf(hunt)}
              disabled={downloading}
            >
              {downloading ? "Building PDF…" : "Download PDF"}
            </button>
            <a className="btn" href={`/app/builder`}>Back to Builder</a>
          </div>
        </div>

        {/* On-screen grid */}
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
              <QRCodeCard text={scanUrl()} label={`${i + 1}. ${clue.location}`} />
              <div className="text-sm text-muted" style={{ marginTop: 6 }}>
                Runner: <code style={{ fontSize: 12 }}>{runnerUrl}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print CSS */}
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
