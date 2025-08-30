import React from "react";

export default function Help() {
  return (
    <main className="section" style={{ paddingTop: 28 }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <header style={{ marginBottom: 16 }}>
          <h1 className="m-0" style={{ fontSize: 26, fontWeight: 900 }}>Host Guide — BetterQuest</h1>
          <p className="text-muted m-0" style={{ fontSize: 14 }}>
            A 2-minute setup for running your first hunt. Print this page if helpful.
          </p>
        </header>

        <div className="card" style={{ marginBottom: 16 }}>
          <h2 className="m-0" style={{ fontSize: 20, fontWeight: 800 }}>1) Create your Hunt</h2>
          <ol className="mt-2" style={{ paddingLeft: 18 }}>
            <li>Open <strong>/app/builder</strong> and name your hunt.</li>
            <li>List locations (e.g., “Front Gate”, “Blue Door”).</li>
            <li>Click <strong>Generate clues</strong> (optional) to draft clue text.</li>
            <li>Click <strong>Create hunt</strong> — you’ll get a Hunt ID, QR pack, and a runner link.</li>
          </ol>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h2 className="m-0" style={{ fontSize: 20, fontWeight: 800 }}>2) Print & Place the Tags</h2>
          <ul className="mt-2" style={{ paddingLeft: 18 }}>
            <li>Print the QR cards from the Builder’s “Print Pack”.</li>
            <li>Place cards at the matching locations (order = sequence).</li>
            <li>Weather: use tape/laminate if outdoors. Keep QR visible and reachable.</li>
            <li>Optional NFC: program each NFC tag to <code>/api/scan/&lt;tagId&gt;?g=GROUP&amp;h=HUNT</code> if you want strict order.</li>
          </ul>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h2 className="m-0" style={{ fontSize: 20, fontWeight: 800 }}>3) Share the Runner Link</h2>
          <p className="mt-2 m-0">
            The runner link looks like <code>/app/run?h=&lt;HUNT_ID&gt;</code>. Share via QR/URL with teams.
          </p>
          <ul className="mt-2" style={{ paddingLeft: 18 }}>
            <li>One link works for all teams. Each device gets its own <em>group</em> id automatically.</li>
            <li>The <strong>Simulate Scan</strong> button is for testing; during the event, teams scan the posted QR/NFC tags.</li>
          </ul>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h2 className="m-0" style={{ fontSize: 20, fontWeight: 800 }}>4) Cooldowns & Fair Play</h2>
          <ul className="mt-2" style={{ paddingLeft: 18 }}>
            <li>Cooldowns prevent rapid re-scans; default is ~45–60s between clues per team.</li>
            <li>If a team scans out of order (strict NFC mode), they’ll see a “not yet” message.</li>
            <li>You can adjust cooldowns when creating the hunt (future: editable after creation).</li>
          </ul>
        </div>

        <div className="card">
          <h2 className="m-0" style={{ fontSize: 20, fontWeight: 800 }}>Troubleshooting</h2>
          <ul className="mt-2" style={{ paddingLeft: 18 }}>
            <li><strong>No styling?</strong> Hard refresh; ensure you’re on the latest deploy.</li>
            <li><strong>Runner link 404?</strong> Ensure the path starts with <code>/app/</code> and deep-link rewrite is set.</li>
            <li><strong>“Please wait…” every scan?</strong> That’s cooldown working. Wait for the countdown to finish.</li>
            <li><strong>Hunt not found?</strong> Double-check the <code>h=</code> id from the Builder.</li>
          </ul>
          <p className="text-sm text-muted m-0">
            Need help? <a href="mailto:hello@betterquest.ie">hello@betterquest.ie</a>
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style>
        {`@media print {
          header, nav { display: none !important; }
          .card { page-break-inside: avoid; }
          .section { padding: 0 !important; }
          a[href]:after { content: "" !important; } /* avoid noisy printed URLs */
        }`}
      </style>
    </main>
  );
}
