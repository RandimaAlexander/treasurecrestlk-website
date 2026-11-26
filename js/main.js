/* Treasure Crest — site script (no dependencies) */
(() => {
'use strict';

/* ---------- SETTINGS (edit here) ---------- */
const CONFIG = {
  whatsapp: '94705399111',                       // main WhatsApp number (no +, no spaces)
  email: 'treasurecrestgalle@gmail.com',         // booking requests are emailed here
  formEndpoint: 'https://formsubmit.co/ajax/treasurecrestgalle@gmail.com',
  availabilityUrl: 'api/availability',          // Cloudflare function that reads the iCal links
  monthsAhead: 18,
  stays: {
    villa:   { name: 'Treasure Crest Villa',          rate: 45000, maxAdults: 6, maxKids: 2 },
    cottage: { name: 'Treasure Woods Cottage',        rate: 15000, maxAdults: 2, maxKids: 0 },
    both:    { name: 'Villa + Cottage (whole hill)',  rate: 60000, maxAdults: 8, maxKids: 2 }
  }
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmtLKR = n => 'LKR ' + n.toLocaleString('en-US');

/* ---------- header + menu ---------- */
const hdr = $('#hdr'), mbar = $('#mbar'), hero = $('.hero');
const onScroll = () => {
  const y = scrollY;
  hdr.classList.toggle('solid', y > 40);
  if (mbar) mbar.classList.toggle('show', y > (hero ? hero.offsetHeight * 0.6 : 400) && !nearBooking());
};
const nearBooking = () => { const b = $('#book'); if (!b) return false; const r = b.getBoundingClientRect(); return r.top < innerHeight * 0.85 && r.bottom > 0; };
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const burger = $('#burger'), mnav = $('#mnav');
const setMenu = open => { document.body.classList.toggle('menu', open); burger.setAttribute('aria-expanded', open); if (mnav) mnav.setAttribute('aria-hidden', !open); };
burger.addEventListener('click', () => setMenu(true));
if ($('#mnavX')) $('#mnavX').addEventListener('click', () => setMenu(false));
$$('#mnav a, #nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
$('#yr').textContent = new Date().getFullYear();

/* ---------- reveal on scroll + counters ---------- */
const countUp = el => {
  const to = parseFloat(el.dataset.count), from = parseFloat(el.dataset.from || 0), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '';
  if (reduce) { el.textContent = to.toFixed(dec) + suf; return; }
  const t0 = performance.now(), dur = 1600;
  const step = t => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = (from + (to - from) * e).toFixed(dec) + suf; if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
};
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  $$('[data-count]', e.target).concat(e.target.matches('[data-count]') ? [e.target] : []).forEach(c => { if (!c.dataset.done) { c.dataset.done = 1; countUp(c); } });
  io.unobserve(e.target);
}), { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
$$('.reveal,.reveal-img,.rv-score').forEach((el, i) => {
  const sib = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains('reveal')).indexOf(el) : 0;
  if (sib > 0) el.style.transitionDelay = Math.min(sib * 0.08, 0.4) + 's';
  io.observe(el);
});

/* ---------- map: real Google map on the live site; a location card where embeds are blocked (previews) ---------- */
(() => {
  const h = location.hostname, ok = !h || /(^|\.)treasurecrestlk\.com$|\.pages\.dev$|\.vercel\.app$|\.netlify\.app$|\.github\.io$|^localhost$|^127\.0\.0\.1$/.test(h);
  if (!ok) { const f = $('.map iframe'), fb = $('.map-fb'); if (f && fb) { f.remove(); fb.hidden = false; } }
})();

/* ---------- parallax ---------- */
const px = $$('[data-parallax]');
if (!reduce && px.length && matchMedia('(min-width: 700px)').matches) {
  let tick = false;
  const run = () => { px.forEach(el => { const r = el.parentElement.getBoundingClientRect(); const k = parseFloat(el.dataset.parallax); el.style.transform = `translate3d(0,${(r.top + r.height / 2 - innerHeight / 2) * -k}px,0)`; }); tick = false; };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(run); } }, { passive: true }); run();
}

/* ---------- card tilt (mouse only) ---------- */
if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  $$('.tilt').forEach(c => {
    c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-6px)`; });
    c.addEventListener('mouseleave', () => { c.style.transform = ''; });
  });
}

/* ---------- lightbox ---------- */
const lb = $('#lb'), lbImg = $('#lbImg'); let lbList = [], lbI = 0;
const lbShow = i => { lbI = (i + lbList.length) % lbList.length; lbImg.src = lbList[lbI].href; lbImg.alt = $('img', lbList[lbI]).alt; };
$$('[data-gallery]').forEach(g => { const items = $$('a', g); items.forEach((a, i) => a.addEventListener('click', e => { e.preventDefault(); lbList = items; lbShow(i); lb.hidden = false; document.body.style.overflow = 'hidden'; })); });
const lbClose = () => { lb.hidden = true; document.body.style.overflow = ''; };
$('#lbX').onclick = lbClose; $('#lbP').onclick = () => lbShow(lbI - 1); $('#lbN').onclick = () => lbShow(lbI + 1);
lb.addEventListener('click', e => { if (e.target === lb) lbClose(); });
addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') lbClose(); if (e.key === 'ArrowLeft') lbShow(lbI - 1); if (e.key === 'ArrowRight') lbShow(lbI + 1); });
let tx = 0; lb.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) lbShow(lbI + (dx < 0 ? 1 : -1)); });

/* =========================================================
   BOOKING WIDGET
   ========================================================= */
const form = $('#bkForm'); if (!form) return;
const S = { stay: 'villa', ci: null, co: null, hover: null, adults: 2, kids: 0, view: null, booked: { villa: new Set(), cottage: new Set() }, live: false };
const pad = n => String(n).padStart(2, '0');
const key = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const today = new Date(); today.setHours(0, 0, 0, 0);
S.view = new Date(today.getFullYear(), today.getMonth(), 1);
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['Mo','Tu','We','Th','Fr','Sa','Su'];
const nice = d => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const isBooked = k => S.stay === 'both' ? (S.booked.villa.has(k) || S.booked.cottage.has(k)) : S.booked[S.stay].has(k);
const nightsFree = (a, b) => { for (let d = new Date(a); d < b; d = addDays(d, 1)) if (isBooked(key(d))) return false; return true; };
const monthsShown = () => matchMedia('(min-width: 1000px)').matches ? 2 : 1;
const maxView = new Date(today.getFullYear(), today.getMonth() + CONFIG.monthsAhead, 1);

function renderCal() {
  const box = $('#calMonths'); box.innerHTML = '';
  for (let m = 0; m < monthsShown(); m++) {
    const first = new Date(S.view.getFullYear(), S.view.getMonth() + m, 1);
    const wrap = document.createElement('div'); wrap.className = 'cm';
    wrap.innerHTML = `<h4>${MONTHS[first.getMonth()]} ${first.getFullYear()}</h4>`;
    const grid = document.createElement('div'); grid.className = 'cm-grid';
    DOW.forEach(d => grid.insertAdjacentHTML('beforeend', `<div class="cm-dow">${d}</div>`));
    const lead = (first.getDay() + 6) % 7;
    for (let i = 0; i < lead; i++) grid.insertAdjacentHTML('beforeend', '<span class="d empty"></span>');
    const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    for (let n = 1; n <= days; n++) {
      const d = new Date(first.getFullYear(), first.getMonth(), n), k = key(d);
      const b = document.createElement('button'); b.type = 'button'; b.className = 'd'; b.textContent = n; b.dataset.k = k;
      const past = d < today; const booked = isBooked(k);
      if (past) b.disabled = true;
      if (booked) b.classList.add('booked');
      if (+d === +today) b.classList.add('today');
      b.setAttribute('aria-label', nice(d) + (booked ? ' – booked' : ''));
      grid.appendChild(b);
    }
    wrap.appendChild(grid); box.appendChild(wrap);
  }
  paint();
  $('#calPrev').disabled = S.view <= new Date(today.getFullYear(), today.getMonth(), 1);
  $('#calNext').disabled = S.view >= maxView;
  $('#calHint').textContent = !S.ci ? 'Select your check-in date' : !S.co ? 'Now select your check-out date' : `${nightsCount()} night${nightsCount() > 1 ? 's' : ''} selected`;
}
function paint() {
  const end = S.co || (S.ci && S.hover && S.hover > S.ci ? S.hover : null);
  $$('#calMonths .d[data-k]').forEach(b => {
    const d = parse(b.dataset.k);
    b.classList.toggle('start', !!S.ci && +d === +S.ci);
    b.classList.toggle('has-end', !!S.ci && +d === +S.ci && !!end);
    b.classList.toggle('end', !!end && +d === +end);
    b.classList.toggle('inrange', !!(S.ci && end && d > S.ci && d < end));
  });
  $('#calHint').textContent = !S.ci ? 'Select your check-in date' : !S.co ? 'Now select your check-out date' : `${nightsCount()} night${nightsCount() > 1 ? 's' : ''} selected`;
}
const short = d => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
function renderFields() {
  const i = $('#dIn'), o = $('#dOut');
  i.textContent = S.ci ? short(S.ci) : 'Add date'; i.classList.toggle('ph', !S.ci);
  o.textContent = S.co ? short(S.co) : 'Add date'; o.classList.toggle('ph', !S.co);
  $('#gTxt').textContent = guestText();
}
const togglePop = (id, btn, open) => {
  const el = $(id), b = $(btn); const on = open ?? el.hidden;
  el.hidden = !on; b.setAttribute('aria-expanded', on);
  if (on) { const other = id === '#cal' ? ['#gpop', '#gstBtn'] : ['#cal', '#dateBtn']; $(other[0]).hidden = true; $(other[1]).setAttribute('aria-expanded', false); }
};
$('#dateBtn').addEventListener('click', () => togglePop('#cal', '#dateBtn'));
$('#gstBtn').addEventListener('click', () => togglePop('#gpop', '#gstBtn'));
const nightsCount = () => S.ci && S.co ? Math.round((S.co - S.ci) / 864e5) : 0;

$('#calMonths').addEventListener('click', e => {
  const b = e.target.closest('.d'); if (!b || b.disabled || !b.dataset.k) return;
  const d = parse(b.dataset.k); setErr('');
  if (!S.ci || S.co || d <= S.ci) {
    if (isBooked(b.dataset.k)) { setErr('That night is already booked. Please choose another check-in date.'); return; }
    S.ci = d; S.co = null;
  } else {
    if (!nightsFree(S.ci, d)) { setErr('Some nights in between are already booked. Please pick different dates.'); return; }
    S.co = d;
    setTimeout(() => togglePop('#cal', '#dateBtn', false), 450);
  }
  paint(); renderFields(); renderSummary();
});
if (matchMedia('(hover: hover)').matches) {
  $('#calMonths').addEventListener('mouseover', e => { const b = e.target.closest('.d'); if (!b || !b.dataset.k || !S.ci || S.co) return; const h = parse(b.dataset.k); if (+h !== +S.hover) { S.hover = h; paint(); } });
  $('#calMonths').addEventListener('mouseleave', () => { if (S.hover) { S.hover = null; paint(); } });
}
$('#calPrev').onclick = () => { S.view = new Date(S.view.getFullYear(), S.view.getMonth() - 1, 1); renderCal(); };
$('#calNext').onclick = () => { S.view = new Date(S.view.getFullYear(), S.view.getMonth() + 1, 1); renderCal(); };
let lastShown = monthsShown(); addEventListener('resize', () => { if (monthsShown() !== lastShown) { lastShown = monthsShown(); renderCal(); } });

/* stay switch */
function setStay(s) {
  S.stay = s;
  $$('.seg button').forEach(b => { const on = b.dataset.s === s; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
  const r = CONFIG.stays[s];
  S.adults = Math.min(Math.max(S.adults, 1), r.maxAdults); S.kids = Math.min(S.kids, r.maxKids);
  if (S.ci && S.co && !nightsFree(S.ci, S.co)) { S.co = null; setErr('Those dates are not free for this stay. Please choose again.'); }
  renderGuests(); renderCal(); renderFields(); renderSummary();
}
$$('.seg button').forEach(b => b.addEventListener('click', () => setStay(b.dataset.s)));
$$('[data-stay]').forEach(a => a.addEventListener('click', () => setStay(a.dataset.stay)));

/* guests */
function renderGuests() {
  const r = CONFIG.stays[S.stay];
  $('#adults').textContent = S.adults; $('#kids').textContent = S.kids;
  $('#adultHint').textContent = `Up to ${r.maxAdults}`;
  $('#kidsRow').classList.toggle('kids-off', r.maxKids === 0);
  $$('.stepper button').forEach(b => {
    const g = b.dataset.g, d = +b.dataset.d, v = S[g];
    const max = g === 'adults' ? r.maxAdults : r.maxKids, min = g === 'adults' ? 1 : 0;
    b.disabled = d > 0 ? v >= max : v <= min;
  });
  let note = '';
  if (S.stay === 'cottage') note = 'The cottage is adults only (2 guests).';
  else if (S.stay === 'villa' && S.adults === r.maxAdults) note = 'That\'s the villa\'s maximum of 6 adults. You can still add 2 children under 10. Bigger group? Choose "Both".';
  else if (S.kids > 0) note = 'Children under 10 stay with the group. We will ask their ages when we reply.';
  $('#gstNote').textContent = note;
}
$$('.stepper button').forEach(b => b.addEventListener('click', () => {
  const r = CONFIG.stays[S.stay], g = b.dataset.g, max = g === 'adults' ? r.maxAdults : r.maxKids, min = g === 'adults' ? 1 : 0;
  S[g] = Math.min(max, Math.max(min, S[g] + +b.dataset.d)); renderGuests(); renderFields(); renderSummary();
}));

/* summary: everything in one view */
const guestText = () => `${S.adults} adult${S.adults > 1 ? 's' : ''}${S.kids ? `, ${S.kids} child${S.kids > 1 ? 'ren' : ''} under 10` : ''}`;
const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function renderSummary() {
  const box = $('#summary'); const r = CONFIG.stays[S.stay];
  if (!S.ci || !S.co) { box.innerHTML = `<div class="sum-row"><span>${r.name}</span><b>${fmtLKR(r.rate)} / night</b></div><p class="sum-inc">✓ Breakfast included · no payment now</p>`; return; }
  const n = nightsCount();
  box.innerHTML = `<div class="sum-row sum-total"><span>${r.name}<br><small>${fmtLKR(r.rate)} × ${n} night${n > 1 ? 's' : ''}</small></span><b>${fmtLKR(r.rate * n)}</b></div>
   <p class="sum-inc">✓ Breakfast included every morning · no payment now</p>`;
}
$('#fName').addEventListener('input', () => { $('#fName').classList.remove('bad'); if ($('#err').textContent === 'Please add your name.') setErr(''); renderSummary(); });
const setErr = t => { $('#err').textContent = t; };

/* availability from Booking.com / Airbnb / Agoda (via iCal) */
async function loadAvailability() {
  const st = $('#calStatus');
  try {
    const res = await fetch(CONFIG.availabilityUrl, { headers: { accept: 'application/json' } });
    if (!res.ok) throw 0;
    const j = await res.json();
    ['villa', 'cottage'].forEach(s => (j[s] || []).forEach(([a, b]) => { for (let d = parse(a); d < parse(b); d = addDays(d, 1)) S.booked[s].add(key(d)); }));
    S.live = true; st.textContent = 'Live availability'; const sn = $('#syncNote'); if (sn) sn.hidden = false;
  } catch { st.textContent = 'We confirm availability on WhatsApp'; }
  renderCal();
}

/* send: WhatsApp (main) or email */
function collect() {
  setErr(''); $('#fName').classList.remove('bad');
  const name = $('#fName').value.trim();
  if (!S.ci || !S.co) { setErr('Please choose your check-in and check-out dates.'); togglePop('#cal', '#dateBtn', true); $('#dateBtn').scrollIntoView({ behavior: 'smooth', block: 'center' }); return null; }
  if (!name) { $('#fName').classList.add('bad'); setErr('Please add your name.'); $('#fName').focus(); return null; }
  const r = CONFIG.stays[S.stay], n = nightsCount(), total = fmtLKR(r.rate * n);
  const text = [
    'Hello Treasure Crest! I would like to book:', '',
    `🏡 Stay: ${r.name}`,
    `📅 Dates: ${nice(S.ci)} → ${nice(S.co)} (${n} night${n > 1 ? 's' : ''})`,
    `👥 Guests: ${guestText()}`,
    `💰 Estimate: ${total} (breakfast included)`, '',
    `Name: ${name}`
  ].join('\n');
  return { name, r, n, total, text };
}
const done = (title, html, acts) => {
  $('#doneTitle').textContent = title; $('#doneText').innerHTML = html; $('#doneActs').innerHTML = acts;
  form.hidden = true; $('#bkDone').hidden = false;
  $('#bkDone').scrollIntoView({ behavior: 'smooth', block: 'center' });
};
form.addEventListener('submit', e => {
  e.preventDefault();
  const q = collect(); if (!q) return;
  const wa = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(q.text)}`;
  // a copy also goes to the family's inbox (does not block WhatsApp)
  try {
    fetch(CONFIG.formEndpoint, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: `New booking request (WhatsApp): ${q.r.name}, ${key(S.ci)} to ${key(S.co)}`, _template: 'table', _captcha: 'false',
        Name: q.name, Stay: q.r.name, 'Check-in': nice(S.ci), 'Check-out': nice(S.co), Nights: q.n, Guests: guestText(), 'Estimated total': q.total, 'Sent via': 'WhatsApp', Source: location.hostname }) }).catch(() => {});
  } catch {}
  if (matchMedia('(max-width: 999px)').matches) location.href = wa; else window.open(wa, '_blank', 'noopener');
  done('Almost there!', 'WhatsApp should now be open with your request ready. <b>Just press send</b> and we\'ll reply personally.',
    `<a class="btn btn-wa" href="${wa}" target="_blank" rel="noopener"><svg class="i"><use href="#i-wa"/></svg>Open WhatsApp again</a>`);
});
$('#mailBtn').addEventListener('click', () => {
  const q = collect(); if (!q) return;
  const subject = `Booking request: ${q.r.name}, ${nice(S.ci)} to ${nice(S.co)}`;
  const body = q.text + '\n\n';
  const mailto = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONFIG.email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  location.href = mailto;
  done('Your email is ready', `Your email app should open with the request filled in. <b>Just press send.</b><br>Nothing opened? Use Gmail below, or write to us at:<br><span class="done-mail">${CONFIG.email}</span>`,
    `<a class="btn btn-mail" href="${mailto}"><svg class="i"><use href="#i-mail"/></svg>Open email again</a><a class="btn btn-line" href="${gmail}" target="_blank" rel="noopener">Send with Gmail</a><button type="button" class="btn btn-line" id="copyReq">Copy request</button>`);
  const c = $('#copyReq'); if (c) c.onclick = () => { (navigator.clipboard ? navigator.clipboard.writeText(`To: ${CONFIG.email}\nSubject: ${subject}\n\n${body}`) : Promise.reject()).then(() => { c.textContent = 'Copied ✓'; }, () => { c.textContent = 'Copy failed'; }); };
});
$('#newReq').onclick = () => { $('#bkDone').hidden = true; form.hidden = false; S.ci = S.co = null; renderCal(); renderFields(); renderSummary(); };

renderGuests(); renderCal(); renderFields(); renderSummary(); loadAvailability();
})();
