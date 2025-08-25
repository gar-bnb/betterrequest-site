import { useState } from "react";

export default function BetterQuestTier2Validation() {
  const [openPre, setOpenPre] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-black text-white grid place-items-center text-lg font-bold">BQ</div>
            <span className="font-extrabold text-xl">BetterQuest</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#how" className="hover:opacity-80">How it works</a>
            <a href="#kit" className="hover:opacity-80">What’s in the kit</a>
            <a href="#faq" className="hover:opacity-80">FAQ</a>
          </nav>
          <button onClick={() => setOpenPre(true)} className="rounded-2xl px-4 py-2 bg-black text-white font-semibold hover:opacity-90">Preorder €249</button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-10 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Bring a Movie-Level Treasure Hunt to Your Team —
            <span className="block">No Apps. Just Tap &amp; Play.</span>
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            Our premium NFC kit turns any venue into a smart, story-driven challenge. Tap tags, unlock clues, track progress in real-time. Perfect for teams, schools, and events.
          </p>
          <ul className="mt-6 space-y-2 text-gray-800">
            <li>• 60–90 minute experience for 10–40 players</li>
            <li>• Zero setup apps — works with any modern phone</li>
            <li>• Live leaderboard + anti-cheat cooldowns</li>
          </ul>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button onClick={() => setOpenPre(true)} className="rounded-2xl px-5 py-3 bg-black text-white font-semibold hover:opacity-90">Preorder Kit — €249</button>
            <a href="#how" className="rounded-2xl px-5 py-3 border font-semibold hover:bg-gray-50">See how it works</a>
          </div>
          <p className="mt-2 text-sm text-gray-500">No charge today. Secure a place in the first batch. Limited early-bird pricing.</p>
        </div>
        <div className="relative">
          <div className="aspect-[4/3] w-full rounded-3xl border shadow-sm grid place-items-center text-center p-8">
            <div>
              <div className="text-6xl">🎒📡🏁</div>
              <p className="mt-3 font-semibold">Premium NFC Treasure Hunt Kit</p>
              <p className="text-sm text-gray-600">Smart tags • Pro-printed clue cards • Host guide • Online console</p>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 rounded-2xl bg-emerald-50 border p-3 shadow-sm text-sm">
            <strong>Validation build:</strong> this page measures real interest. No risk preorders.
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="bg-gray-50 border-y">
        <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm text-gray-600">
          <div>✅ No apps to install</div>
          <div>✅ Runs on Cloudflare (fast)</div>
          <div>✅ Designed for teams &amp; schools</div>
          <div>✅ Made in Ireland 🇮🇪</div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-extrabold">How it works</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {[
            { title: "Place the tags", body: "Stick the NFC/QR tags around your venue using the host guide. No tools or power needed." },
            { title: "Teams tap to unlock clues", body: "Players tap a tag with their phone to get the next clue in the mobile web app." },
            { title: "Track live progress", body: "Host console shows team positions, time penalties, and the winner in real time." },
          ].map((s, i) => (
            <div key={i} className="rounded-3xl border p-6">
              <div className="h-10 w-10 rounded-xl bg-black text-white grid place-items-center font-bold">{i + 1}</div>
              <h3 className="mt-4 font-bold text-lg">{s.title}</h3>
              <p className="mt-1 text-gray-700">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What’s in the kit */}
      <section id="kit" className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-3xl font-extrabold">What’s in the kit</h2>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <ul className="rounded-3xl border p-6 space-y-2 text-gray-800">
            <li>• 16x NFC tags (NTAG215) pre-programmed</li>
            <li>• 16x pro-printed clue cards (laminated)</li>
            <li>• Host guide (setup, hints, safety)</li>
            <li>• Access to BetterQuest web console</li>
            <li>• Leaderboard + anti-cheat cooldowns</li>
            <li>• Email support for first event</li>
          </ul>
          <div className="rounded-3xl border p-6">
            <p className="text-sm text-gray-600">Pilot batch details</p>
            <ul className="mt-2 space-y-1 text-gray-800">
              <li>• Early-bird price: <strong>€249</strong> (incl. VAT)</li>
              <li>• Ideal group size: <strong>10–40 players</strong></li>
              <li>• Duration: <strong>60–90 minutes</strong></li>
              <li>• Ships from Ireland 🇮🇪</li>
              <li>• Works on iOS &amp; Android — no app installs</li>
            </ul>
            <button onClick={() => setOpenPre(true)} className="mt-6 w-full rounded-2xl px-5 py-3 bg-black text-white font-semibold hover:opacity-90">Preorder €249</button>
            <LeadForm compact />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="text-3xl font-extrabold">FAQ</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <Faq q="Is this a real order?" a="This is a validation preorder: no card charged today. We’ll confirm by email and only charge when your kit ships. You can cancel anytime before shipment." />
          <Faq q="Can we reuse the kit?" a="Yes. Tags and cards are reusable. You can run multiple events; we’ll offer extra story packs later." />
          <Faq q="Can we customize the clues?" a="In the pilot, the story is fixed. Custom packs will be offered after launch." />
          <Faq q="Will it work without NFC?" a="Yes. Each tag includes a QR fallback for older phones." />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-2 gap-6 items-center">
          <div className="text-sm text-gray-600">© {new Date().getFullYear()} BetterQuest. All rights reserved.</div>
          <div className="justify-self-end"><LeadForm /></div>
        </div>
      </footer>

      {/* Preorder Modal */}
      {openPre && (
        <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={() => setOpenPre(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-extrabold">Preorder — €249</h3>
            <p className="mt-1 text-gray-600 text-sm">No payment now. Reserve a kit from the first batch. We’ll email to confirm before shipping.</p>
            <PreorderForm onDone={(m) => { setMsg(m); setOpenPre(false); }} onLoading={setLoading} />
            <button className="mt-4 text-sm text-gray-600 hover:underline" onClick={() => setOpenPre(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {msg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-black text-white px-4 py-2 text-sm" onClick={() => setMsg("")}>
          {msg}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-white/60">
          <div className="rounded-2xl border px-4 py-2 bg-white shadow">Submitting…</div>
        </div>
      )}
    </main>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-3xl border p-6">
      <h3 className="font-bold">{q}</h3>
      <p className="mt-2 text-gray-700 text-sm leading-relaxed">{a}</p>
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

  if (done) return <p className="text-sm text-emerald-700">Thanks! We’ll keep you posted.</p>;

  return (
    <div className={`mt-4 ${compact ? "" : "max-w-sm"}`}>
      <div className="flex gap-2">
        <input className="flex-1 rounded-2xl border px-3 py-2" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={submit} disabled={loading} className="rounded-2xl px-4 py-2 bg-black text-white font-semibold hover:opacity-90 disabled:opacity-50">
          Notify me
        </button>
      </div>
      <p className="mt-1 text-[11px] text-gray-500">By continuing, you agree to be contacted about this product.</p>
    </div>
  );
}

function PreorderForm({ onDone, onLoading }: { onDone: (msg: string) => void; onLoading: (b: boolean) => void }) {
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
        body: JSON.stringify({ type: "preorder", email, org, qty, price: 249, currency: "EUR", source: "tier2-landing" }),
      });
      onDone("Preorder saved! We’ll email you to confirm before shipping.");
    } catch {
      alert("Something went wrong. Try again.");
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div>
        <label className="text-sm font-medium">Work email</label>
        <input className="mt-1 w-full rounded-2xl border px-3 py-2" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium">Organisation (optional)</label>
        <input className="mt-1 w-full rounded-2xl border px-3 py-2" placeholder="Company / School" value={org} onChange={(e) => setOrg(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium">Quantity</label>
        <input type="number" min={1} max={10} className="mt-1 w-24 rounded-2xl border px-3 py-2" value={qty} onChange={(e) => setQty(parseInt(e.target.value || "1"))} />
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>I agree to be contacted about this preorder and understand no payment is taken today.</span>
      </label>
      <button onClick={submit} className="w-full rounded-2xl px-5 py-3 bg-black text-white font-semibold hover:opacity-90">Reserve my kit</button>
      <p className="text-[11px] text-gray-500">We’ll email a secure checkout link when your kit is ready.</p>
    </div>
  );
}
