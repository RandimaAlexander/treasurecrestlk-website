/**
 * GET /api/availability  (Vercel Serverless Function)
 *
 * Reads the private iCal links from Booking.com, Airbnb, Agoda and the
 * "Direct bookings" Google Calendars, and returns the booked nights:
 *   { "villa": [["2026-12-01","2026-12-05"], ...], "cottage": [...], "updated": "..." }
 * Each pair is [check-in, check-out) — the check-out day itself is free.
 *
 * The links are NOT stored in the code. Add them in Vercel:
 *   Project → Settings → Environment Variables
 *   VILLA_ICAL   = link1, link2, link3, link4     (comma or new line separated)
 *   COTTAGE_ICAL = link1, link2, link3, link4
 * then Redeploy.
 */
module.exports = async (req, res) => {
  const sets = { villa: process.env.VILLA_ICAL || '', cottage: process.env.COTTAGE_ICAL || '' };
  const out = { villa: [], cottage: [], updated: new Date().toISOString(), sources: {} };
  for (const [unit, raw] of Object.entries(sets)) {
    const urls = raw.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
    const ranges = [];
    const results = await Promise.allSettled(urls.map(u =>
      fetch(u, { headers: { 'User-Agent': 'TreasureCrest-Availability/1.0' } })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
    ));
    out.sources[unit] = results.map(r => r.status === 'fulfilled' ? 'ok' : 'failed');
    results.forEach(r => { if (r.status === 'fulfilled') ranges.push(...parseIcs(r.value)); });
    out[unit] = merge(ranges);
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.status(200).send(JSON.stringify(out));
};

function parseIcs(text) {
  const lines = text.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);   // unfold folded lines
  const res = []; let ev = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') ev = {};
    else if (line === 'END:VEVENT') { if (ev && ev.s) res.push([ev.s, ev.e || addDay(ev.s)]); ev = null; }
    else if (ev) {
      const m = line.match(/^(DTSTART|DTEND)[^:]*:(\d{8})/);
      if (m) ev[m[1] === 'DTSTART' ? 's' : 'e'] = `${m[2].slice(0, 4)}-${m[2].slice(4, 6)}-${m[2].slice(6, 8)}`;
    }
  }
  const today = new Date().toISOString().slice(0, 10);
  return res.filter(([, e]) => e > today);
}

function addDay(d) { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + 1); return x.toISOString().slice(0, 10); }

function merge(r) {
  r.sort((a, b) => a[0].localeCompare(b[0]));
  const m = [];
  for (const x of r) { const last = m[m.length - 1]; if (last && x[0] <= last[1]) { if (x[1] > last[1]) last[1] = x[1]; } else m.push([...x]); }
  return m;
}
