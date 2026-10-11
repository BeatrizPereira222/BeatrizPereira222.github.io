/* =====================================================================
   Sky polarisation simulator (used inside articles)

   Markdown:
     ```skysim
     {"model": "rayleigh", "night": "figures/paranal-2021-01-26.json", "caption": "…"}
     ```
   model: "rayleigh"  single Rayleigh scattering with depolarisation factor δ
          "berry"     multiple-scattering pattern of Berry, Dennis & Lee (2004), parameter L

   The all-sky map uses a stereographic projection (zenith at the centre,
   horizon at the edge, north up, east left). Light from the Moon and from the
   Sun is added as Stokes vectors (I, Q, U), so the result is correct when both
   contribute, for example at twilight.
   ===================================================================== */
(function (root) {
  "use strict";
  const D = Math.PI / 180;

  /* ---------- geometry ---------- */
  // East-North-Up unit vector
  const enu = (alt, az) => [Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), Math.sin(alt)];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  // map plane: x right, y up; a point at zenith distance z and azimuth az sits at tan(z/2)·(−sin az, cos az)
  const toMap = (alt, az) => { const r = Math.tan((Math.PI / 2 - alt) / 2); return [-r * Math.sin(az), r * Math.cos(az)]; };
  const fromMap = (x, y) => { const r = Math.hypot(x, y); return { alt: Math.PI / 2 - 2 * Math.atan(r), az: Math.atan2(-x, y) }; };

  // Rayleigh: degree of polarisation and direction (angle in the map plane, from +x, anticlockwise)
  function rayleigh(alt, az, src, delta) {
    const t = enu(alt, az), m = enu(src.alt, src.az);
    const c = Math.max(-1, Math.min(1, dot(t, m)));
    const p = (1 - c * c) / (1 + c * c + (2 * delta) / (1 - delta));
    // E-vector is perpendicular to the scattering plane: e = t × m
    const e = cross(t, m);
    const eAlt = dot(e, [-Math.sin(alt) * Math.sin(az), -Math.sin(alt) * Math.cos(az), Math.cos(alt)]);
    const eAz = dot(e, [Math.cos(az), -Math.sin(az), 0]);
    // map directions at this point: outwards = (−sin az, cos az), increasing azimuth = (−cos az, −sin az)
    const vx = -eAlt * -Math.sin(az) + eAz * -Math.cos(az);
    const vy = -eAlt * Math.cos(az) + eAz * -Math.sin(az);
    return { p, chi: Math.atan2(vy, vx), I: 1 + c * c, cosg: c };
  }

  /* ---------- complex numbers for the Berry model ---------- */
  const C = (re, im = 0) => ({ re, im });
  const add = (a, b) => C(a.re + b.re, a.im + b.im), sub = (a, b) => C(a.re - b.re, a.im - b.im);
  const mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const conj = (a) => C(a.re, -a.im), abs = (a) => Math.hypot(a.re, a.im);
  const inv = (a) => { const d = a.re * a.re + a.im * a.im; return C(a.re / d, -a.im / d); };

  // Berry, Dennis & Lee (2004): w(ξ) = 4(ξ−ξ+)(ξ−ξ−)(ξ+1/ξ+*)(ξ+1/ξ−*) / [(1+|ξ|²)² |ξ+ + 1/ξ+*| |ξ− + 1/ξ−*|]
  // ξ± are the two neutral points near the source, separated by 4·arctan(L) along its vertical.
  function berryPoints(src, L) {
    const zs = Math.PI / 2 - src.alt, d = 2 * Math.atan(L);
    const pt = (z) => { const r = Math.tan(z / 2); return C(-r * Math.sin(src.az), r * Math.cos(src.az)); };
    return [pt(zs - d), pt(zs + d)];
  }
  function berry(alt, az, src, pts) {
    const [x, y] = toMap(alt, az), xi = C(x, y);
    const [a, b] = pts;
    const ai = inv(conj(a)), bi = inv(conj(b));
    let w = mul(mul(sub(xi, a), sub(xi, b)), mul(add(xi, ai), add(xi, bi)));
    const n = Math.pow(1 + x * x + y * y, 2) * abs(add(a, ai)) * abs(add(b, bi));
    w = C((4 * w.re) / n, (4 * w.im) / n);
    const t = enu(alt, az), m = enu(src.alt, src.az), c = dot(t, m);
    // arg(w)/2 gives the E-vector direction up to a constant set by the source azimuth
    // (checked against Rayleigh for L = 0, where the two patterns must coincide)
    return { p: Math.min(1, abs(w)), chi: Math.atan2(w.im, w.re) / 2 - src.az, I: 1 + c * c, cosg: c };
  }

  // Rough brightness of the sky lit by each source (relative to the full-Moon sky):
  // twilight fades by about one magnitude per degree of depression below the horizon.
  const SUN_OVER_MOON_MAG = 14.5;
  function weight(src) {
    const dep = Math.max(0, -src.alt / D);
    if (src.kind === "sun" && dep > 18) return 0;   // after astronomical twilight the Sun no longer lights the sky
    const base = src.kind === "sun" ? Math.pow(10, 0.4 * SUN_OVER_MOON_MAG) : 1;
    return base * Math.pow(10, -0.4 * dep);
  }

  // Combine every source as Stokes vectors
  function skyAt(alt, az, sources, model, par) {
    let I = 0, Q = 0, U = 0, Im = 0;
    for (const s of sources) {
      const f = s.w; if (f <= 1e-6) continue;
      const r = model === "berry" ? berry(alt, az, s, s.pts) : rayleigh(alt, az, s, par.delta);
      const i = f * r.I;
      I += i; Q += r.p * i * Math.cos(2 * r.chi); U += r.p * i * Math.sin(2 * r.chi);
      if (s.kind === "moon") Im += i;
    }
    if (!I) return { p: 0, chi: 0, I: 0, moonShare: 0 };
    return { p: Math.hypot(Q, U) / I, chi: Math.atan2(U, Q) / 2, I, moonShare: Im / I };
  }

  /* ---------- colour map (magma) ---------- */
  const STOPS = ["#000004", "#1c1044", "#4f127b", "#812581", "#b5367a", "#e55964", "#fb8761", "#fec287", "#fcfdbf"]
    .map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
  const LUT = Array.from({ length: 256 }, (_, k) => {
    const t = (k / 255) * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(t)), f = t - i;
    return STOPS[i].map((v, j) => Math.round(v + (STOPS[i + 1][j] - v) * f));
  });

  /* ---------- widget ---------- */
  function mount(el, spec, base) {
    const model = spec.model === "berry" ? "berry" : "rayleigh";
    const id = "ss" + Math.random().toString(36).slice(2, 7);
    el.innerHTML = `
      <div class="ss-wrap">
        <div class="ss-sky">
          <canvas width="440" height="440" aria-label="All-sky map of the degree of polarisation"></canvas>
          <div class="ss-bar"><span>0</span><i></i><span>100%</span></div>
          <p class="ss-read mono muted">Hover the sky to read values.</p>
        </div>
        <div class="ss-ctl">
          <label class="ss-row"><span>Sky</span>
            <select data-k="mode"><option value="night">Paranal, night of 26 Jan 2021</option><option value="free">Place the Moon yourself</option></select></label>
          <div data-show="night">
            <label class="ss-row"><span>Local time <b data-o="time"></b></span><input type="range" data-k="t" min="0" max="72" step="1" value="36"></label>
            <div class="ss-check">
              <label><input type="checkbox" data-k="moon" checked> Moon</label>
              <label><input type="checkbox" data-k="sun" checked> Sun</label>
            </div>
          </div>
          <div data-show="free" hidden>
            <label class="ss-row"><span>Moon altitude <b data-o="malt"></b></span><input type="range" data-k="malt" min="0" max="90" step="1" value="40"></label>
            <label class="ss-row"><span>Moon azimuth <b data-o="maz"></b></span><input type="range" data-k="maz" min="0" max="359" step="1" value="0"></label>
          </div>
          ${model === "rayleigh"
            ? `<label class="ss-row"><span>Depolarisation δ <b data-o="delta"></b></span><input type="range" data-k="delta" min="0" max="0.5" step="0.01" value="0"></label>`
            : `<label class="ss-row"><span>Neutral-point separation L <b data-o="L"></b></span><input type="range" data-k="L" min="0" max="0.4" step="0.01" value="0.15"></label>`}
          <label class="ss-check"><input type="checkbox" data-k="dirs" checked> Show polarisation direction</label>
          <p class="ss-info small muted" data-o="info"></p>
        </div>
      </div>`;
    const cv = el.querySelector("canvas"), g = cv.getContext("2d");
    const q = (k) => el.querySelector(`[data-k="${k}"]`), out = (k) => el.querySelector(`[data-o="${k}"]`);
    let night = null, raf = 0, last = null;

    const state = () => ({
      mode: q("mode").value, t: +q("t").value, moon: q("moon").checked, sun: q("sun").checked,
      malt: +q("malt").value, maz: +q("maz").value, dirs: q("dirs").checked,
      delta: model === "rayleigh" ? +q("delta").value : 0, L: model === "berry" ? +q("L").value : 0,
    });

    function sourcesFor(s) {
      const list = [];
      if (s.mode === "free") list.push({ kind: "moon", alt: s.malt * D, az: s.maz * D });
      else if (night) {
        const r = night.rows[s.t];
        if (s.moon) list.push({ kind: "moon", alt: r[3] * D, az: r[4] * D });
        if (s.sun) list.push({ kind: "sun", alt: r[1] * D, az: r[2] * D });
      }
      list.forEach((src) => { src.w = weight(src); if (model === "berry") src.pts = berryPoints(src, s.L); });
      return list;
    }

    function draw() {
      raf = 0;
      const s = state(), src = sourcesFor(s);
      $$("[data-show]").forEach((d) => (d.hidden = d.dataset.show !== s.mode));
      if (night) out("time").textContent = night.rows[s.t][0];
      out("malt").textContent = s.malt + "°"; out("maz").textContent = s.maz + "°";
      if (out("delta")) out("delta").textContent = s.delta.toFixed(2);
      if (out("L")) out("L").textContent = `${s.L.toFixed(2)} (${(4 * Math.atan(s.L) / D).toFixed(0)}°)`;

      const W = cv.width, R = W / 2 - 18, N = 220, img = g.createImageData(N, N);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const x = (i + 0.5) / N * 2 - 1, y = 1 - (j + 0.5) / N * 2, k = (j * N + i) * 4;
        if (x * x + y * y > 1) { img.data[k + 3] = 0; continue; }
        const { alt, az } = fromMap(x, y), v = skyAt(alt, az, src, model, s);
        const c = LUT[Math.max(0, Math.min(255, Math.round(v.p * 255)))];
        img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = v.I ? 255 : 60;
      }
      const off = new OffscreenCanvasLike(N, img);
      g.clearRect(0, 0, W, W);
      g.save(); g.beginPath(); g.arc(W / 2, W / 2, R, 0, 2 * Math.PI); g.clip();
      g.imageSmoothingEnabled = true; g.drawImage(off, W / 2 - R, W / 2 - R, 2 * R, 2 * R); g.restore();

      // altitude circles and labels
      g.strokeStyle = "rgba(160,175,255,.35)"; g.lineWidth = 1;
      [30, 60].forEach((a) => { g.beginPath(); g.arc(W / 2, W / 2, R * Math.tan((90 - a) * D / 2), 0, 2 * Math.PI); g.stroke(); });
      g.strokeStyle = "rgba(200,205,230,.8)"; g.beginPath(); g.arc(W / 2, W / 2, R, 0, 2 * Math.PI); g.stroke();
      g.fillStyle = "#9097b3"; g.font = "12px Space Grotesk, system-ui, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText("N", W / 2, 8); g.fillText("S", W / 2, W - 8); g.fillText("E", 8, W / 2); g.fillText("W", W - 8, W / 2);

      // polarisation direction
      if (s.dirs) {
        g.strokeStyle = "rgba(240,242,250,.85)"; g.lineWidth = 1.4; g.lineCap = "round";
        const step = 0.115;
        for (let y = -1 + step / 2; y < 1; y += step) for (let x = -1 + step / 2; x < 1; x += step) {
          if (x * x + y * y > 0.97) continue;
          const { alt, az } = fromMap(x, y), v = skyAt(alt, az, src, model, s);
          if (v.p < 0.06) continue;
          const len = (4 + 9 * v.p) / 2, cx = W / 2 + x * R, cy = W / 2 - y * R;
          const dx = Math.cos(v.chi) * len, dy = -Math.sin(v.chi) * len;
          g.beginPath(); g.moveTo(cx - dx, cy - dy); g.lineTo(cx + dx, cy + dy); g.stroke();
        }
      }
      // sources and neutral points
      for (const o of src) {
        if (o.alt < 0) continue;
        const [x, y] = toMap(o.alt, o.az), cx = W / 2 + x * R, cy = W / 2 - y * R;
        g.beginPath(); g.arc(cx, cy, o.kind === "sun" ? 9 : 8, 0, 2 * Math.PI);
        g.fillStyle = o.kind === "sun" ? "#ffd166" : "#f3c88b"; g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.stroke();
        g.fillStyle = "#f3c88b"; g.textAlign = "left"; g.fillText(o.kind === "sun" ? "Sun" : "Moon", cx + 12, cy - 10);
        if (model === "berry" && s.L > 0) o.pts.forEach((pt) => {
          const r = Math.hypot(pt.re, pt.im); if (r > 1) return;
          g.beginPath(); g.arc(W / 2 + pt.re * R, W / 2 - pt.im * R, 4, 0, 2 * Math.PI); g.strokeStyle = "#8fe3b0"; g.lineWidth = 2; g.stroke();
        });
      }
      // what lights the sky right now
      const z = skyAt(Math.PI / 2, 0, src, model, s);
      out("info").textContent = !src.length || !z.I ? "No light source: pick the Moon or the Sun."
        : z.moonShare > 0.98 ? "The sky is lit by the Moon."
        : z.moonShare < 0.02 ? "The sky is lit by the Sun (twilight or day): it dominates the Moon."
        : `Twilight: ${Math.round(z.moonShare * 100)}% of the light at the zenith comes from the Moon, ${Math.round(100 - z.moonShare * 100)}% from the Sun. Their Stokes vectors add up.`;
      last = { src, s };
    }
    const $$ = (sel) => Array.from(el.querySelectorAll(sel));
    const queue = () => { if (!raf) raf = requestAnimationFrame(draw); };
    el.addEventListener("input", queue);

    cv.addEventListener("mousemove", (e) => {
      if (!last) return;
      const b = cv.getBoundingClientRect(), W = cv.width, R = W / 2 - 18;
      const x = ((e.clientX - b.left) / b.width * W - W / 2) / R, y = -((e.clientY - b.top) / b.height * W - W / 2) / R;
      if (x * x + y * y > 1) { el.querySelector(".ss-read").textContent = "Hover the sky to read values."; return; }
      const { alt, az } = fromMap(x, y), v = skyAt(alt, az, last.src, model, last.s);
      const moon = last.src.find((o) => o.kind === "moon");
      const gam = moon ? Math.acos(Math.max(-1, Math.min(1, dot(enu(alt, az), enu(moon.alt, moon.az))))) / D : null;
      el.querySelector(".ss-read").textContent =
        `alt ${(alt / D).toFixed(0)}°, az ${(((az / D) + 360) % 360).toFixed(0)}°` +
        (gam !== null ? ` · ${gam.toFixed(0)}° from the Moon` : "") + ` · p = ${(v.p * 100).toFixed(0)}%`;
    });

    const nightUrl = spec.night ? base + spec.night : null;
    if (nightUrl) fetch(nightUrl).then((r) => r.json()).then((d) => { night = d; queue(); }).catch(queue);
    else { q("mode").value = "free"; q("mode").disabled = true; }
    queue();
  }

  // Draw ImageData scaled: put it on a small canvas first
  function OffscreenCanvasLike(n, img) {
    const c = document.createElement("canvas"); c.width = c.height = n; c.getContext("2d").putImageData(img, 0, 0); return c;
  }

  const api = { mount, rayleigh, berry, berryPoints, skyAt, toMap, fromMap, D };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SkySim = api;
})(typeof window !== "undefined" ? window : globalThis);
