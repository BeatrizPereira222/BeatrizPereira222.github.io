/* Sky Lab: all-sky map of Rayleigh (single-scattering) polarisation.
   Fisheye projection, zenith in the centre, horizon at the rim,
   north up and east on the LEFT (as seen when lying on your back).
   Drag on the sky to move the light source. */
(function () {
  const canvas = document.getElementById("polSky");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const $ = (id) => document.getElementById(id);
  const ui = { alt: $("alt"), az: $("az"), pmax: $("pmax"), vectors: $("vectors") };
  const out = { alt: $("altOut"), az: $("azOut"), pmax: $("pmaxOut"), legend: $("legendMax"), read: $("polReadout") };
  const D = Math.PI / 180;
  let source = "sun", queued = false, dragging = false;

  // Off-screen low-res buffer for the per-pixel map; scaled up when drawn.
  const N = 300;
  const buf = document.createElement("canvas"); buf.width = buf.height = N;
  const bctx = buf.getContext("2d");
  const img = bctx.createImageData(N, N);

  // Colour map: deep night → violet → blue → cyan → warm white
  const STOPS = [[7, 8, 26], [43, 26, 94], [106, 63, 168], [79, 141, 224], [159, 230, 255], [255, 246, 216]];
  function cmap(t) {
    t = Math.min(1, Math.max(0, t)) * (STOPS.length - 1);
    const i = Math.min(STOPS.length - 2, Math.floor(t)), f = t - i, a = STOPS[i], b = STOPS[i + 1];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  }

  const vec = (alt, az) => [Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), Math.sin(alt)];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

  // Degree of linear polarisation for scattering angle γ
  const pol = (cosG, pmax) => pmax * (1 - cosG * cosG) / (1 + cosG * cosG);

  // screen <-> sky
  function toSky(px, py, R, c) {
    const dx = px - c, dy = py - c, r = Math.hypot(dx, dy);
    if (r > R) return null;
    return { alt: (90 * (1 - r / R)) * D, az: Math.atan2(-dx, -dy) };
  }
  function toScreen(v, R, c) {
    const alt = Math.asin(Math.max(-1, Math.min(1, v[2]))), az = Math.atan2(v[0], v[1]);
    const r = R * (1 - alt / D / 90);
    return [c - r * Math.sin(az), c - r * Math.cos(az)];
  }

  function state() {
    return { alt: +ui.alt.value * D, az: +ui.az.value * D, pmax: +ui.pmax.value / 100 };
  }

  function render() {
    queued = false;
    const s = state(), sv = vec(s.alt, s.az);
    out.alt.textContent = ui.alt.value + "°";
    out.az.textContent = ui.az.value + "°";
    out.pmax.textContent = ui.pmax.value + "%";

    // 1. per-pixel polarisation map
    const R = N / 2, c = N / 2, d = img.data;
    const dim = source === "moon" ? 0.82 : 1;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const k = (y * N + x) * 4, p = toSky(x + 0.5, y + 0.5, R, c);
        if (!p) { d[k + 3] = 0; continue; }
        const P = pol(dot(sv, vec(p.alt, p.az)), 1); // normalised 0..1 for colour
        const [r, g, b] = cmap(P * s.pmax);
        d[k] = r * dim; d[k + 1] = g * dim; d[k + 2] = b * dim; d[k + 3] = 255;
      }
    }
    bctx.putImageData(img, 0, 0);

    // 2. draw to the visible canvas
    const S = canvas.width, RR = S / 2 - 2, cc = S / 2;
    ctx.clearRect(0, 0, S, S);
    ctx.save();
    ctx.beginPath(); ctx.arc(cc, cc, RR, 0, Math.PI * 2); ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(buf, cc - RR, cc - RR, RR * 2, RR * 2);

    // altitude rings
    ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1;
    [30, 60].forEach((a) => { ctx.beginPath(); ctx.arc(cc, cc, RR * (1 - a / 90), 0, Math.PI * 2); ctx.stroke(); });

    // 3. E-vector ticks (perpendicular to the scattering plane)
    if (ui.vectors.checked) {
      const step = S / 17;
      ctx.lineCap = "round";
      for (let y = step / 2; y < S; y += step) {
        for (let x = step / 2; x < S; x += step) {
          const p = toSky(x, y, RR, cc);
          if (!p) continue;
          const pv = vec(p.alt, p.az), cosG = dot(sv, pv), P = pol(cosG, 1);
          if (P < 0.04) continue;
          const e = norm(cross(sv, pv)), eps = 0.04;
          const a = toScreen(norm([pv[0] - e[0] * eps, pv[1] - e[1] * eps, pv[2] - e[2] * eps]), RR, cc);
          const b = toScreen(norm([pv[0] + e[0] * eps, pv[1] + e[1] * eps, pv[2] + e[2] * eps]), RR, cc);
          const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = step * 0.42 * (0.35 + 0.65 * P);
          ctx.strokeStyle = `rgba(5,6,10,${0.35 + 0.5 * P})`; ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x - Math.cos(ang) * L, y - Math.sin(ang) * L);
          ctx.lineTo(x + Math.cos(ang) * L, y + Math.sin(ang) * L);
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // 4. light source marker
    const above = s.alt >= 0;
    const [sx, sy] = toScreen(above ? sv : vec(0, s.az), RR, cc);
    ctx.save();
    if (!above) ctx.setLineDash([3, 4]);
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 34);
    glow.addColorStop(0, source === "sun" ? "rgba(255,220,150,0.95)" : "rgba(230,235,255,0.95)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(sx, sy, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = source === "sun" ? "#ffd27a" : "#eef1ff";
    ctx.strokeStyle = "#05060a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(sx, sy, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (source === "moon") { // crescent shadow
      ctx.fillStyle = "rgba(5,6,10,0.55)"; ctx.beginPath(); ctx.arc(sx + 4, sy - 2, 8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // horizon rim
    ctx.strokeStyle = "rgba(159,180,255,0.4)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cc, cc, RR, 0, Math.PI * 2); ctx.stroke();
  }

  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(render); } };

  // pointer helpers
  function skyAt(ev) {
    const r = canvas.getBoundingClientRect();
    const x = (ev.clientX - r.left) * (canvas.width / r.width), y = (ev.clientY - r.top) * (canvas.height / r.height);
    return toSky(x, y, canvas.width / 2 - 2, canvas.width / 2);
  }
  function readout(p) {
    if (!p) { out.read.textContent = "Hover the sky to read values"; return; }
    const s = state(), cosG = dot(vec(s.alt, s.az), vec(p.alt, p.az));
    const gamma = Math.acos(Math.max(-1, Math.min(1, cosG))) / D;
    const az = ((p.az / D) % 360 + 360) % 360;
    out.read.textContent = `alt ${(p.alt / D).toFixed(0)}° · az ${az.toFixed(0)}° · γ ${gamma.toFixed(0)}° · P ${(pol(cosG, s.pmax) * 100).toFixed(0)}%`;
  }
  function moveSource(p) {
    if (!p) return;
    ui.alt.value = Math.round(p.alt / D);
    ui.az.value = Math.round(((p.az / D) % 360 + 360) % 360);
    schedule();
  }

  canvas.addEventListener("pointerdown", (e) => { dragging = true; canvas.setPointerCapture(e.pointerId); moveSource(skyAt(e)); });
  canvas.addEventListener("pointermove", (e) => { const p = skyAt(e); if (dragging) moveSource(p); readout(p); });
  canvas.addEventListener("pointerup", () => (dragging = false));
  canvas.addEventListener("pointerleave", () => readout(null));

  Object.values(ui).forEach((el) => el.addEventListener("input", schedule));
  document.querySelectorAll(".seg button").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".seg button").forEach((o) => { o.classList.toggle("on", o === b); o.setAttribute("aria-checked", o === b); });
      source = b.dataset.src;
      schedule();
    })
  );

  render();
})();
