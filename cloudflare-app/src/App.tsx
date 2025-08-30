// import "./App.css";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HuntBuilder from "./pages/HuntBuilder";
import RunHunt from "./pages/RunHunt";

/**
 * App wrapper that preserves the public landing at "/"
 * and mounts the portal app only under "/app/*".
 */
export default function App() {
  const isPortal =
    typeof window !== "undefined" && window.location.pathname.startsWith("/app");
  return isPortal ? <PortalApp /> : <Landing />;
}

/* ------------------------- PORTAL (under /app/*) ------------------------- */

function PortalApp() {
  return (
    <BrowserRouter basename="/app">
      <nav style={{ padding: 12, borderBottom: "1px solid #eee" }}>
        <Link to="/">Portal</Link> • <Link to="/builder">Builder</Link> •{" "}
        <Link to="/run">Run</Link>
        <span style={{ marginLeft: 12, fontSize: 12, color: "#666" }}>
          (Public site: <a href="/">/</a>)
        </span>
      </nav>
      <Routes>
        <Route path="/" element={<PortalHome />} />
        <Route path="/builder" element={<HuntBuilder />} />
        <Route path="/run" element={<RunHunt />} />
      </Routes>
    </BrowserRouter>
  );
}

function PortalHome() {
  return (
    <div style={{ padding: 24 }}>
      <h1>BetterQuest — App Portal</h1>
      <p>This internal area won’t affect your public landing page.</p>
      <ul>
        <li>
          <Link to="/builder">Create a Hunt (Builder)</Link>
        </li>
        <li>
          <Link to="/run">Run a Hunt (Runner)</Link>
        </li>
      </ul>
      <p style={{ fontSize: 12, color: "#666" }}>
        We can add login/admin gating here later.
      </p>
    </div>
  );
}

/* --------------------------- LANDING (at "/") ---------------------------- */
/* This is your original landing page, unchanged except for an "App Portal" link. */

function Landing() {
  const [openPre, setOpenPre] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  return (
    <main>
      {/* Header */}
      <header className="header">
        <div className="container header-inner">
          <div className="brand">
            <div className="logo">BQ</div>
            <span>BetterQuest</span>
          </div>
          <nav className="nav">
            <a href="#how">How it works</a>
            <a href="#kit">What’s in the kit</a>
            <a href="#faq">FAQ</a>
            {/* Link to the portal */}
            <a href="/app" style={{ marginLeft: 12 }}>
              App Portal
            </a>
          </nav>
          <button className="btn btn-primary" onClick={() => setOpenPre(true)}>
            Preorder €249
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="section hero">
        <div className="container grid-2" style={{ alignItems: "center" }}>
          <div>
            <h1>
              Movie-Level Treasure Hunts for Teams —
              <span className="m-0" style={{ display: "block" }}>
                No Apps. Tap &amp; Play in Minutes.
              </span>
            </h1>
            <p className="lead">
              Our premium NFC kit turns any venue into a smart, story-driven
              challenge. Tap tags, unlock clues, track progress in real-time.
              Perfect for teams, schools, and events.
            </p>
            <ul className="bullets">
              <li>60–90 minute experience for 10–40 players</li>
              <li>Zero setup apps — works with any modern phone</li>
              <li>Live leaderboard + anti-cheat cooldowns</li>
            </ul>

            <div className="cta-row">
              <button className="btn btn-primary" onClick={() => setOpenPre(true)}>
                Preorder Kit — €249
              </button>
              <button
                className="btn btn-secondary"
                onClick={() =>
                  document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See how it works
              </button>
            </div>
            <p className="note">
              No charge today. Reserve now, pay only when your kit ships. Cancel
              anytime.
            </p>
          </div>

          <div style={{ position: "relative" }}>
            <figure className="figure">
              <img
                src="/hero-kit.jpg"
                alt="BetterQuest NFC treasure hunt kit — tags, cards, and host guide"
                width={1200}
                height={900}
                onError={(e) => ((e.currentTarget.style.display = "none"))}
              />
              <div className="text-muted text-sm" style={{ padding: 24 }}>
                (Hero image placeholder — add <code>/public/hero-kit.jpg</code>)
              </div>
            </figure>
            <div className="badge">
              <strong>Pilot batch:</strong> limited early-bird pricing. No charge today.
            </div>
          </div>
        </div>
      </section>

      {/* Social strip */}
      <section className="strip">
        <div className="container" style={{ padding: "14px 16px" }}>
          <div className="strip-grid">
            <div>✅ No apps to install</div>
            <div>✅ Runs on Cloudflare (fast)</div>
            <div>✅ Designed for teams &amp; schools</div>
            <div>✅ Made in Ireland 🇮🇪</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="section">
        <div className="container">
          <h2 className="m-0" style={{ fontSize: 28, fontWeight: 800 }}>How it works</h2>
          <div className="grid-3 mt-4">
            {[
              {
                title: "Place the tags",
                body:
                  "Stick the NFC/QR tags around your venue using the host guide. No tools or power needed.",
              },
              {
                title: "Teams tap to unlock clues",
                body:
                  "Players tap a tag with their phone to get the next clue in the mobile web app.",
              },
              {
                title: "Track live progress",
                body:
                  "Host console shows team positions, time penalties, and the winner in real time.",
              },
            ].map((s, i) => (
              <div key={i} className="card">
                <div
                  className="logo"
                  style={{ width: 40, height: 40, borderRadius: 12 }}
                >
                  {i + 1}
                </div>
                <h3 className="mt-2" style={{ marginBottom: 4 }}>{s.title}</h3>
                <p className="text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's in the kit */}
      <section id="kit" className="section">
        <div className="container">
          <h2 className="m-0" style={{ fontSize: 28, fontWeight: 800 }}>What’s in the kit</h2>

          <div className="kit-grid mt-4">
            <ul className="card">
              <li>• 16x NFC tags (NTAG215) pre-programmed</li>
              <li>• 16x pro-printed clue cards (laminated)</li>
              <li>• Host guide (setup, hints, safety)</li>
              <li>• Access to BetterQuest web console</li>
              <li>• Leaderboard + anti-cheat cooldowns</li>
              <li>• Email support for first event</li>
            </ul>

            <div className="card">
              <p className="text-sm text-muted m-0">Pilot batch details</p>
              <ul className="mt-2">
                <li>• Early-bird price: <strong>€249</strong></li>
                <li>• Ideal group size: <strong>10–40 players</strong></li>
                <li>• Duration: <strong>60–90 minutes</strong></li>
                <li>• Ships from Ireland 🇮🇪</li>
                <li>• Works on iOS &amp; Android — no app installs</li>
              </ul>

              <button className="btn btn-primary w-full mt-4" onClick={() => setOpenPre(true)}>
                Preorder €249
              </button>

              <LeadForm compact />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="container">
          <h2 className="m-0" style={{ fontSize: 28, fontWeight: 800 }}>FAQ</h2>
          <div className="faq-grid mt-4">
            <Faq q="Is this a real order?" a="This is a validation preorder: no card charged today. We’ll confirm by email and only charge when your kit ships. You can cancel anytime before shipment." />
            <Faq q="Can we reuse the kit?" a="Yes. Tags and cards are reusable. You can run multiple events; we’ll offer extra story packs later." />
            <Faq q="Can we customize the clues?" a="In the pilot, the story is fixed. Custom packs will be offered after launch." />
            <Faq q="Will it work without NFC?" a="Yes. Each tag includes a QR fallback for older phones." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="small">
            © {new Date().getFullYear()} BetterQuest. Made in Ireland.{" "}
            <a href="mailto:hello@betterquest.ie">hello@betterquest.ie</a> |{" "}
            <a href="/privacy.html">Privacy</a>
          </div>
          <div>
            <LeadForm />
          </div>
        </div>
      </footer>

      {/* Modal */}
      {openPre && (
        <div className="modal-backdrop" onClick={() => setOpenPre(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="m-0" style={{ fontSize: 20, fontWeight: 800 }}>Preorder — €249</h3>
            <p className="text-muted text-sm mt-1">
              No payment now. Reserve a kit from the first batch. We’ll email to confirm before shipping.
            </p>
            <PreorderForm
              onDone={(m) => { setMsg(m); setOpenPre(false); }}
              onLoading={setLoading}
            />
            <button className="small mt-2" onClick={() => setOpenPre(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {msg && (
        <div
          className="center"
          style={{
            position: "fixed", left: "50%", bottom: 16, transform: "translateX(-50%)",
            background: "#111", color: "#fff", padding: "8px 14px", borderRadius: 9999, zIndex: 60
          }}
          onClick={() => setMsg("")}
        >
          {msg}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="modal-backdrop">
          <div className="card">Submitting…</div>
        </div>
      )}
    </main>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="card">
      <h3 className="m-0" style={{ fontWeight: 700 }}>{q}</h3>
      <p className="mt-2 text-muted text-sm">{a}</p>
    </div>
  );
}

function LeadForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("Enter a valid email");
    try {
      setLoading(true);
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "notify", email, source: "tier2-landing" }),
      });
      setDone(true);
    } catch {
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return <p className="text-sm" style={{ color: "#047857" }}>Thanks! We’ll keep you posted.</p>;

  return (
    <div className={compact ? "mt-2" : "mt-2"} style={{ maxWidth: compact ? "90%" : 420 }}>
      <div className="inline-form">
        <input
          className="input"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn-primary" onClick={submit} disabled={loading}>Notify me</button>
      </div>
      <p className="small mt-1">By continuing, you agree to be contacted about this product.</p>
    </div>
  );
}

function PreorderForm({
  onDone,
  onLoading,
}: {
  onDone: (msg: string) => void;
  onLoading: (b: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [qty, setQty] = useState(1);
  const [consent, setConsent] = useState(false);

  const submit = async () => {
    if (!consent) return alert("Please consent to be contacted.");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("Enter a valid email");
    onLoading(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "preorder",
          email,
          org,
          qty,
          price: 249,
          currency: "EUR",
          source: "tier2-landing",
        }),
      });
      onDone("Preorder saved! We’ll email you to confirm before shipping.");
    } catch {
      alert("Something went wrong. Try again.");
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <label className="text-sm">Work email</label>
      <input
        className="input mt-1"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label className="text-sm mt-3">Organisation (optional)</label>
      <input
        className="input mt-1"
        placeholder="Company / School"
        value={org}
        onChange={(e) => setOrg(e.target.value)}
      />

      <label className="text-sm mt-3">Quantity</label>
      <input
        type="number"
        min={1}
        max={10}
        className="input mt-1"
        style={{ width: 96 }}
        value={qty}
        onChange={(e) => setQty(parseInt(e.target.value || "1", 10))}
      />

      <label className="text-sm mt-3" style={{ display: "flex", gap: 8 }}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          I agree to be contacted about this preorder and understand no payment
          is taken today.
        </span>
      </label>

      <button className="btn btn-primary w-full mt-3" onClick={submit}>
        Reserve my kit
      </button>
      <p className="small mt-1">
        We’ll email a secure checkout link when your kit is ready.
      </p>
    </div>
  );
}
