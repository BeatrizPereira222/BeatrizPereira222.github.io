/* Sky Lab: polarisation of the moonlit (and sunlit) sky, in four steps, following
   Pereira et al. (2026), "Moonlit sky polarization patterns from Cerro Paranal", A&A,
   and the analysis code behind it.

   Step 1  Rayleigh                 p = sin²γ / (1 + cos²γ)
   Step 2  Rayleigh variations      a) p = A(λ)·sin²γ/(1+cos²γ)          A = par_wave_val (art_sun.py)
                                    b) p = sin²γ / ((1+P)/(1−P) + cos²γ)  depolarisation (art_dep.py)
   Step 3  Multiple scattering      p = A(λ)·|w(ξ)|, Berry et al. 2004 (func_moon_pol_mult), 4 neutral points 4·arctan(L) apart
   Step 4  Rayleigh + Mie + MS      |S1,2|² = η·Rayleigh + (1−η)·Mie(4 Jones species, mie_size_dist.py),
                                    plus an unpolarised multiple-scattering term: I → I(1+u), p → p/(1+u)
   Twilight (any step): as in art_sun.py, the Moon alone while the Sun is below −18°; above that, normalised
   Stokes vectors are mixed with weights w = par·albedo (Moon) and 1 − w (Sun).
   Angle of polarisation: shown in the convention of rotation_angles() (χ = β′ − 90°).
   Geometry: Astronomy Engine; zenith-centred equidistant map, north up, east left. */
(function () {
  const canvas = document.getElementById("skyMap");
  if (!canvas || !window.Astronomy) return;
  const ctx = canvas.getContext("2d");
  const $ = (id) => document.getElementById(id);
  const D = Math.PI / 180;

  const SITES = {
    paranal: { name: "Cerro Paranal", lat: -24.6272, lon: -70.4042, h: 2635 },
    lisbon: { name: "Lisbon", lat: 38.7369, lon: -9.1427, h: 80 },
  };
  const BANDCOL = { B: "#6f8cff", V: "#6fdc8c", R: "#ff7a7a", I: "#ffb347" };

  const st = { step: 1, variation: "A", view: "dop", source: "moon", band: "V", A: 0.614, P: 0.282, L: 0.3,
               eta: 0.6, u: 0.5, tw: 1, site: "paranal", date: "2021-01-27", minutes: 300, vectors: true, fields: true, chart: "dop" };
  let obsData = null, tables = null, playing = null, sky = null, hoverP = null;

  // ---------- helpers ----------
  const vec = (alt, az) => [Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), Math.sin(alt)];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const wrap90 = (a) => ((((a + 90) % 180) + 180) % 180) - 90;
  const stereo = (alt, az) => { const t = Math.tan((Math.PI / 2 - alt) / 2); return [t * Math.sin(az), t * Math.cos(az)]; };
  const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const lerpTab = (arr, gDeg) => { const i = Math.min(179, Math.max(0, Math.floor(gDeg))), f = gDeg - i; return arr[i] + (arr[i + 1] - arr[i]) * f; };

  // ---------- ephemeris ----------
  const when = () => new Date(new Date(st.date + "T00:00:00Z").getTime() + st.minutes * 60000);
  function horizon(body, t, obs) {
    const eq = Astronomy.Equator(body, t, obs, true, true);
    const h = Astronomy.Horizon(t, obs, eq.ra, eq.dec, "normal");
    return { alt: h.altitude * D, az: h.azimuth * D };
  }

  // ---------- one light source → [I, p (signed, + = perpendicular), χ in meridian frame (rad)] ----------
  function rayChi(src, t3) {
    const E = norm(cross(src.v, t3));
    const m = norm([-t3[2] * t3[0], -t3[2] * t3[1], 1 - t3[2] * t3[2]]), e = cross(t3, m);
    return Math.atan2(dot(E, e), dot(E, m));
  }
  function berryW(src, alt, az) {
    const xi = stereo(alt, az), xm = src.xi, L = st.L;
    const phi = Math.atan2(xm[1], xm[0]), c = Math.cos(phi), s = Math.sin(phi);
    const xp = [(xm[0] + L * c) / (1 - xm[0] * L * c), (xm[1] + L * s) / (1 - xm[1] * L * s)];
    const xn = [(xm[0] - L * c) / (1 + xm[0] * L * c), (xm[1] - L * s) / (1 + xm[1] * L * s)];
    const r2 = xi[0] * xi[0] + xi[1] * xi[1];
    // Eq. 32 written with (1 + ξ ξ±*) in place of (ξ + 1/ξ±*): same |w|, no spurious phase
    const f1 = [xi[0] - xp[0], xi[1] - xp[1]], f2 = [xi[0] - xn[0], xi[1] - xn[1]];
    const f3 = [1 + xi[0] * xp[0] + xi[1] * xp[1], xi[1] * xp[0] - xi[0] * xp[1]];
    const f4 = [1 + xi[0] * xn[0] + xi[1] * xn[1], xi[1] * xn[0] - xi[0] * xn[1]];
    const num = cmul(cmul(f1, f2), cmul(f3, f4));
    const den = (1 + r2) ** 2 * (1 + xp[0] ** 2 + xp[1] ** 2) * (1 + xn[0] ** 2 + xn[1] ** 2);
    const w = [-4 * num[0] / den, -4 * num[1] / den];
    return { mod: Math.hypot(w[0], w[1]), chi: Math.atan2(w[1], w[0]) / 2 - Math.atan2(-xi[1], -xi[0]) };
  }
  function single(src, alt, az, t3) {
    const cg = Math.max(-1, Math.min(1, dot(src.v, t3))), c2 = cg * cg, s2 = 1 - c2;
    switch (st.step) {
      case 1: return [1 + c2, s2 / (1 + c2), rayChi(src, t3)];
      case 2:
        if (st.variation === "P") { const k = (1 + st.P) / (1 - st.P); return [k + c2, s2 / (k + c2), rayChi(src, t3)]; }
        return [1 + c2, st.A * s2 / (1 + c2), rayChi(src, t3)];
      case 3: { const b = berryW(src, alt, az); return [1 + c2, Math.min(1, st.A * b.mod), b.chi]; }
      case 4: {
        const T = tables.bands[st.band], g = Math.acos(cg) / D;
        const a1 = st.eta * lerpTab(T.ray_s1, g) + (1 - st.eta) * lerpTab(T.mie_s1, g);
        const a2 = st.eta * lerpTab(T.ray_s2, g) + (1 - st.eta) * lerpTab(T.mie_s2, g);
        const I = (a1 + a2) / 2 * (1 + st.u);
        return [I, (a1 - a2) / 2 / I, rayChi(src, t3)];
      }
    }
  }
  // combined sky at a direction → { p, chi (internal, rad), I }
  function skyAt(alt, az) {
    const t3 = vec(alt, az);
    let I = 0, Q = 0, U = 0, Isum = 0;
    for (const src of sky.active) {
      const [Ii, p, chi0] = single(src, alt, az, t3);
      const chi = p < 0 ? chi0 + Math.PI / 2 : chi0, ap = Math.abs(p);
      // normalised Stokes (I = 1), weighted as in art_sun.py
      I += src.w; Q += src.w * ap * Math.cos(2 * chi); U += src.w * ap * Math.sin(2 * chi); Isum += src.w * Ii;
    }
    if (!I) return null;
    return { p: Math.hypot(Q, U) / I, chi: Math.atan2(U, Q) / 2, I: Isum };
  }
  const showChi = (chi) => wrap90(-chi / D);                       // convention of rotation_angles()

  // ---------- colours ----------
  const VIR = [[68, 1, 84], [72, 40, 120], [62, 74, 137], [49, 104, 142], [38, 130, 142], [31, 158, 137], [53, 183, 121], [109, 205, 89], [180, 222, 44], [253, 231, 37]];
  function viridis(t) {
    t = Math.min(1, Math.max(0, t)) * (VIR.length - 1);
    const i = Math.min(VIR.length - 2, Math.floor(t)), f = t - i, a = VIR[i], b = VIR[i + 1];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  }

  // ---------- projection ----------
  const N = 220, buf = document.createElement("canvas"); buf.width = buf.height = N;
  const bctx = buf.getContext("2d"), img = bctx.createImageData(N, N), vals = new Float32Array(N * N);
  function toSky(px, py, R, c) {
    const dx = px - c, dy = py - c, r = Math.hypot(dx, dy);
    if (r > R) return null;
    return { alt: (Math.PI / 2) * (1 - r / R), az: Math.atan2(-dx, -dy) };
  }
  const toScreen = (alt, az, R, c) => { const r = R * (1 - alt / (Math.PI / 2)); return [c - r * Math.sin(az), c - r * Math.cos(az)]; };

  // ---------- scene ----------
  function prepare() {
    const t = when(), s = SITES[st.site], obs = new Astronomy.Observer(s.lat, s.lon, s.h);
    const mk = (o, name) => ({ ...o, name, v: vec(o.alt, o.az), xi: stereo(o.alt, o.az) });
    const moon = mk(horizon(Astronomy.Body.Moon, t, obs), "Moon"), sun = mk(horizon(Astronomy.Body.Sun, t, obs), "Sun");
    moon.K = Astronomy.Illumination(Astronomy.Body.Moon, t).phase_fraction;
    let active = [];
    if (st.source === "moon") active = [{ ...moon, w: 1 }];
    else if (st.source === "sun") active = [{ ...sun, w: 1 }];
    else {
      const alb = obsData ? obsData.albedo[st.band] : 0.13, wm = Math.min(1, st.tw * alb);
      active = sun.alt >= -18 * D ? [{ ...moon, w: wm }, { ...sun, w: 1 - wm }] : [{ ...moon, w: 1 }];
    }
    sky = { t, obs, moon, sun, active };
  }

  let queued = false;
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(render); } };

  function render() {
    queued = false;
    if (st.step === 4 && !tables) return;
    prepare(); updateLabels();
    const S = canvas.width, RR = S / 2 - 2, cc = S / 2, d = img.data, R = N / 2;
    ctx.clearRect(0, 0, S, S);

    // 1. compute the map
    let lo = Infinity, hi = -Infinity;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const k = y * N + x, p = toSky(x + 0.5, y + 0.5, R, R);
      if (!p) { vals[k] = NaN; continue; }
      const s = skyAt(p.alt, p.az);
      if (!s) { vals[k] = -Infinity; continue; }
      const v = st.view === "dop" ? s.p : st.view === "aop" ? (showChi(s.chi) + 90) / 180 : Math.log10(s.I);
      vals[k] = v;
      if (st.view === "int") { lo = Math.min(lo, v); hi = Math.max(hi, v); }
    }
    for (let k = 0; k < N * N; k++) {
      const v = vals[k], o = k * 4;
      if (Number.isNaN(v)) { d[o + 3] = 0; continue; }
      if (v === -Infinity) { d[o] = 10; d[o + 1] = 12; d[o + 2] = 22; d[o + 3] = 255; continue; }
      const [r, g, b] = viridis(st.view === "int" ? (v - lo) / Math.max(1e-6, hi - lo) : v);
      d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
    }
    if (st.view === "int") { $("legMin").textContent = "faint"; $("legMax").textContent = `×${Math.round(10 ** (hi - lo))}`; }
    bctx.putImageData(img, 0, 0);

    ctx.save();
    ctx.beginPath(); ctx.arc(cc, cc, RR, 0, Math.PI * 2); ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(buf, cc - RR, cc - RR, RR * 2, RR * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 1;
    [30, 60].forEach((a) => { ctx.beginPath(); ctx.arc(cc, cc, RR * (1 - a / 90), 0, Math.PI * 2); ctx.stroke(); });

    // 2. E-vectors (projected from 3D so they are exact on the fisheye map)
    if (st.vectors && sky.active.length) {
      const step = S / 18; ctx.lineCap = "round";
      for (let y = step / 2; y < S; y += step) for (let x = step / 2; x < S; x += step) {
        const p = toSky(x, y, RR, cc); if (!p) continue;
        const s = skyAt(p.alt, p.az); if (!s || s.p < 0.02) continue;
        const t3 = vec(p.alt, p.az), m = norm([-t3[2] * t3[0], -t3[2] * t3[1], 1 - t3[2] * t3[2]]), e = cross(t3, m);
        const E = [0, 1, 2].map((i) => Math.cos(s.chi) * m[i] + Math.sin(s.chi) * e[i]);
        const t2 = norm(t3.map((v, i) => v + 1e-3 * E[i]));
        const q = toScreen(Math.asin(t2[2]), Math.atan2(t2[0], t2[1]), RR, cc), q0 = toScreen(p.alt, p.az, RR, cc);
        const ang = Math.atan2(q[1] - q0[1], q[0] - q0[0]);
        const Lg = step * 0.42 * (0.35 + 0.65 * Math.min(1, s.p / 0.6));
        ctx.strokeStyle = "rgba(5,6,10,0.75)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - Math.cos(ang) * Lg, y - Math.sin(ang) * Lg); ctx.lineTo(x + Math.cos(ang) * Lg, y + Math.sin(ang) * Lg); ctx.stroke();
      }
    }
    if (st.fields && obsData && st.site === "paranal") drawFields(RR, cc);
    ctx.restore();

    drawBody(sky.sun, "#ffd27a", RR, cc);
    drawBody(sky.moon, "#eef1ff", RR, cc, true);
    ctx.strokeStyle = "rgba(159,180,255,0.45)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cc, cc, RR, 0, Math.PI * 2); ctx.stroke();
    if (hoverP) readout(hoverP);
  }

  function drawBody(b, col, RR, cc, isMoon) {
    const above = b.alt >= 0, [x, y] = toScreen(Math.max(0, b.alt), b.az, RR, cc);
    ctx.save(); ctx.globalAlpha = above ? 1 : 0.45;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 26); g.addColorStop(0, col); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col; ctx.strokeStyle = "#05060a"; ctx.lineWidth = 2; if (!above) ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (isMoon && b.K < 0.98) { ctx.fillStyle = "rgba(5,6,10,0.6)"; ctx.beginPath(); ctx.arc(x + 8 * (1 - b.K) * 1.6, y, 8, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  let fieldPts = [];
  function drawFields(RR, cc) {
    fieldPts = [];
    for (const r of obsData.bands[st.band].filter((r) => r.t.startsWith("2021"))) {
      const h = Astronomy.Horizon(sky.t, sky.obs, r.ra / 15, r.dec, "normal");
      if (h.altitude <= 0) continue;
      const [x, y] = toScreen(h.altitude * D, h.azimuth * D, RR, cc);
      const live = Math.abs(new Date(r.t) - sky.t) / 60000 < 25;
      ctx.lineWidth = live ? 2.5 : 1.5;
      ctx.strokeStyle = live ? "#ff7a59" : "rgba(255,255,255,0.85)";
      ctx.fillStyle = live ? "rgba(255,122,89,0.35)" : "rgba(5,6,10,0.35)";
      ctx.beginPath(); ctx.rect(x - 6, y - 6, 12, 12); ctx.fill(); ctx.stroke();
      if (live) { ctx.fillStyle = "#fff"; ctx.font = "600 14px 'JetBrains Mono', monospace"; ctx.fillText(r.field, x + 10, y - 8); }
      fieldPts.push({ x, y, r });
    }
  }

  // ---------- labels, step texts ----------
  const STEPS = {
    1: { tag: "Step 1 · Rayleigh", text: "Air molecules are much smaller than the wavelength of light. Single Rayleigh scattering gives 100% polarisation 90° from the Moon and none at the Moon or the anti-Moon.",
         formula: "p = sin²γ / (1 + cos²γ)",
         explain: `<h3>Step 1 · Rayleigh scattering</h3><p>The simplest model: moonlight (unpolarised at full Moon) is scattered once by air molecules. The degree of polarisation depends only on the scattering angle γ between the Moon and where you look. The E-vectors are perpendicular to the plane through the Moon, the scattering point and you.</p><p>Compare with the chart: the <em>shape</em> matches the data well, peaking near 90°, but the real sky never reaches 100%. That is what the next steps explain.</p>` },
    2: { tag: "Step 2 · Rayleigh variations", text: "Two ways to bring the peak down to what we measured: scale it by a wavelength-dependent maximum A(λ), or add depolarisation P from aspherical molecules and particles.",
         formula: "", explain: `<h3>Step 2 · Variations of the Rayleigh model</h3><p><strong>Maximum polarisation A(λ).</strong> Multiply the Rayleigh pattern by a constant for each band. The values used in my fits are A = 0.64, 0.614, 0.555 and 0.316 for B, V, R and I. They follow a power law in wavelength (Appendix E).</p><p><strong>Depolarisation P.</strong> Real molecules are not perfect spheres (O₂ is diatomic), so part of the scattered light is depolarised. The Rayleigh matrix then has <span class="mono">(1+P)/(1−P)</span> in place of 1. The band presets are fits of this formula to the clear-night data. Depolarisation grows with wavelength, a sign of larger particles and multiple scattering.</p><p><strong>Twilight.</strong> Choose "Twilight" as the source. Once the Sun is above −18°, its pattern is mixed with the Moon's, with the Moon weighted by its albedo.</p>` },
    3: { tag: "Step 3 · Multiple scattering", text: "Light scattered more than once splits each neutral point in two: Babinet and Brewster near the Moon, Arago and the second Brewster near the anti-Moon.",
         formula: "p = A(λ)·|w(ξ)|,  separation = 4·arctan L",
         explain: `<h3>Step 3 · Multiple scattering (Berry et al. 2004)</h3><p>A full radiative-transfer treatment is hard. Berry's phenomenological model describes the sky with a complex function <span class="mono">w(ξ)</span> on the stereographic plane, with four zeros (the neutral points). L sets how far apart each pair is: L = 0.3 gives 67°, as in Fig. 2 of the paper. With L = 0 it reduces exactly to the Rayleigh pattern.</p><p>Fitted to the Paranal data, L comes out ≈ 0 in B, V and R and ≈ 0.08 in I, so multiple scattering only shows up in the reddest band. Neutral points are close to the Moon, where we have few observations.</p><p class="muted small">In the chart, diamonds show the model at the real position of each field at the time it was observed.</p>` },
    4: { tag: "Step 4 · Rayleigh + Mie + multiple scattering", text: "The best model in the paper: molecules (Rayleigh), aerosols (Mie, four species) and an unpolarised multiple-scattering term. Switch the chart to Intensity to see why Mie is needed.",
         formula: "S² = η·Rayleigh + (1−η)·Mie;  I → I(1+u),  p → p/(1+u)",
         explain: `<h3>Step 4 · Rayleigh + Mie + multiple scattering</h3><p>Aerosols (dust, sea salt, sulphates) are comparable to or larger than the wavelength, so they scatter by <strong>Mie</strong> theory: strongly forward, towards the Moon, and with a different polarisation. The sky's brightness rising steeply near the Moon is the Mie signature that pure Rayleigh cannot reproduce.</p><p>The Mie part uses the four aerosol species of Jones et al. (2013): tropospheric nucleation, accumulation and coarse modes plus stratospheric aerosols, with log-normal sizes. It is computed with my <span class="mono">mie_size_dist</span> code at each band's refractive index (Table 4). η is the share of scattered light from molecules. u is an unpolarised multiple-scattering component that dilutes the polarisation and adds brightness.</p><p class="muted small">Presets were fitted here to polarisation and intensity together. η is a fraction of normalised phase functions, so it is not numerically the same as the R/M ratio in the paper's tables.</p>` },
  };
  const fmtT = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  function updateLabels() {
    const S = STEPS[st.step];
    $("stepTag").textContent = S.tag; $("stepText").textContent = S.text;
    $("stepFormula").textContent = st.step === 2 ? (st.variation === "A" ? "p = A(λ)·sin²γ / (1 + cos²γ)" : "p = sin²γ / ((1+P)/(1−P) + cos²γ)") : S.formula;
    document.querySelectorAll(".step-ctl").forEach((el) => {
      let show = el.dataset.for.split(" ").includes(String(st.step));
      if (st.step === 2 && el.id === "aCtl") show = st.variation === "A";
      if (st.step === 2 && el.id === "pCtl") show = st.variation === "P";
      el.hidden = !show;
    });
    $("twCtl").hidden = st.source !== "twilight";
    $("aOut").textContent = st.A.toFixed(3); $("pOut").textContent = st.P.toFixed(3);
    $("lOut").textContent = `${st.L.toFixed(2)} · ${(4 * Math.atan(st.L) / D).toFixed(0)}° apart`;
    $("eOut").textContent = st.eta.toFixed(2); $("uOut").textContent = st.u.toFixed(2);
    $("twOut").textContent = `${st.tw.toFixed(2)} → Moon weight ${(Math.min(1, st.tw * (obsData ? obsData.albedo[st.band] : 0.13))).toFixed(3)}`;
    $("tOut").textContent = fmtT(st.minutes);
    if (st.view !== "int") { $("legMin").textContent = st.view === "dop" ? "0" : "−90°"; $("legMax").textContent = st.view === "dop" ? "1" : "+90°"; }
    const m = sky.moon, s = sky.sun;
    $("skyInfo").textContent = `☾ alt ${(m.alt / D).toFixed(0)}° az ${(m.az / D).toFixed(0)}° · ${Math.round(m.K * 100)}% lit   ☀ alt ${(s.alt / D).toFixed(0)}°` +
      (st.source === "twilight" ? (s.alt >= -18 * D ? "  · twilight mix on" : "  · Sun below −18°: Moon only") : "");
  }
  function readout(p) {
    hoverP = p;
    if (!p || !sky) { $("hoverInfo").textContent = "Hover the sky to read values"; return; }
    const s = skyAt(p.alt, p.az), src = sky.active[0];
    const g = src ? Math.acos(Math.max(-1, Math.min(1, dot(src.v, vec(p.alt, p.az))))) / D : null;
    let txt = `alt ${(p.alt / D).toFixed(0)}° az ${(((p.az / D) % 360) + 360) % 360 | 0}°` + (g != null ? ` · γ ${g.toFixed(0)}°` : "");
    if (s) txt += ` · p ${(s.p * 100).toFixed(0)}% · AoP ${showChi(s.chi).toFixed(0)}°`;
    if (p.field) txt = `${p.field.field} (${st.band}, ${p.field.condition}) · measured p ${(p.field.dop * 100).toFixed(1)}% · ` + txt;
    $("hoverInfo").textContent = txt;
  }
  function pointerSky(ev) {
    const r = canvas.getBoundingClientRect();
    const x = (ev.clientX - r.left) * (canvas.width / r.width), y = (ev.clientY - r.top) * (canvas.height / r.height);
    const p = toSky(x, y, canvas.width / 2 - 2, canvas.width / 2);
    if (p) { const f = fieldPts.find((f) => Math.hypot(f.x - x, f.y - y) < 12); if (f) p.field = f.r; }
    return p;
  }
  canvas.addEventListener("pointermove", (e) => readout(pointerSky(e)));
  canvas.addEventListener("pointerleave", () => readout(null));

  // ---------- controls ----------
  const seg = (id, fn) => $(id).addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b || b.disabled) return;
    [...$(id).children].forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); x.setAttribute("aria-selected", x === b); });
    fn(b); schedule(); drawChart();
  });
  seg("steps", (b) => { st.step = +b.dataset.step; $("stepExplain").innerHTML = STEPS[st.step].explain; if (st.step === 4) applyBand(); });
  seg("segView", (b) => { st.view = b.dataset.v; });
  seg("segVar", (b) => { st.variation = b.dataset.v; });
  seg("segChart", (b) => { st.chart = b.dataset.v; });
  seg("bands", (b) => { st.band = b.dataset.b; applyBand(); });
  function applyBand() {
    if (obsData) { st.A = obsData.A[st.band]; st.P = obsData.P_fit[st.band]; }
    if (tables) { st.eta = tables.bands[st.band].fit.eta; st.u = tables.bands[st.band].fit.u; }
    $("aMax").value = st.A; $("pDep").value = st.P; $("eta").value = st.eta; $("uMs").value = st.u;
  }
  const slider = (id, key) => $(id).addEventListener("input", (e) => { st[key] = +e.target.value; schedule(); drawChart(); });
  slider("aMax", "A"); slider("pDep", "P"); slider("lPar", "L"); slider("eta", "eta"); slider("uMs", "u"); slider("twPar", "tw");
  $("source").addEventListener("change", (e) => { st.source = e.target.value; schedule(); });
  $("site").addEventListener("change", (e) => { st.site = e.target.value; schedule(); });
  $("date").addEventListener("change", (e) => { if (e.target.value) { st.date = e.target.value; schedule(); } });
  $("time").addEventListener("input", (e) => { st.minutes = +e.target.value; schedule(); });
  $("vectors").addEventListener("change", (e) => { st.vectors = e.target.checked; schedule(); });
  $("fields").addEventListener("change", (e) => { st.fields = e.target.checked; schedule(); });
  $("nowBtn").addEventListener("click", () => {
    const n = new Date(); st.date = n.toISOString().slice(0, 10); st.minutes = Math.round((n.getUTCHours() * 60 + n.getUTCMinutes()) / 5) * 5; sync(); schedule();
  });
  $("obsBtn").addEventListener("click", () => { st.site = "paranal"; st.date = "2021-01-27"; st.minutes = 300; st.source = "moon"; sync(); schedule(); });
  $("play").addEventListener("click", () => {
    if (playing) { clearInterval(playing); playing = null; $("play").textContent = "▶ Play the night"; return; }
    $("play").textContent = "❚❚ Pause";
    playing = setInterval(() => { st.minutes = (st.minutes + 10) % 1440; $("time").value = st.minutes; schedule(); }, 140);
  });
  const sync = () => { $("site").value = st.site; $("date").value = st.date; $("time").value = st.minutes; $("source").value = st.source; $("lPar").value = st.L; };

  // ---------- chart: measured vs model ----------
  const chartEl = $("dataChart");
  let plotlyReady = null;
  const loadPlotly = () => plotlyReady || (plotlyReady = new Promise((ok, no) => {
    if (window.Plotly) return ok();
    const s = document.createElement("script"); s.src = "assets/vendor/plotly.min.js"; s.onload = ok; s.onerror = no; document.head.appendChild(s);
  }));
  // model as a function of γ only (steps 1, 2, 4)
  function curve(gDeg) {
    const c = Math.cos(gDeg * D), c2 = c * c, s2 = 1 - c2;
    if (st.step === 1) return { p: s2 / (1 + c2), I: 1 + c2 };
    if (st.step === 2) { if (st.variation === "P") { const k = (1 + st.P) / (1 - st.P); return { p: s2 / (k + c2), I: k + c2 }; } return { p: st.A * s2 / (1 + c2), I: 1 + c2 }; }
    if (st.step === 4) {
      const T = tables.bands[st.band];
      const a1 = st.eta * lerpTab(T.ray_s1, gDeg) + (1 - st.eta) * lerpTab(T.mie_s1, gDeg);
      const a2 = st.eta * lerpTab(T.ray_s2, gDeg) + (1 - st.eta) * lerpTab(T.mie_s2, gDeg);
      const I = (a1 + a2) / 2 * (1 + st.u); return { p: Math.abs(a1 - a2) / 2 / I, I };
    }
  }
  // step 3: model at each field's real geometry
  function atField(r) {
    const s = SITES.paranal, obs = new Astronomy.Observer(s.lat, s.lon, s.h), t = new Date(r.t);
    const mo = horizon(Astronomy.Body.Moon, t, obs), fh = Astronomy.Horizon(t, obs, r.ra / 15, r.dec, "normal");
    const src = { v: vec(mo.alt, mo.az), xi: stereo(mo.alt, mo.az) };
    const b = berryW(src, fh.altitude * D, fh.azimuth * D);
    const cg = dot(src.v, vec(fh.altitude * D, fh.azimuth * D));
    return { p: Math.min(1, st.A * b.mod), I: 1 + cg * cg };
  }
  function drawChart() {
    if (!obsData || !window.Plotly || (st.step === 4 && !tables)) return;
    const rows = obsData.bands[st.band].filter((r) => r.t.startsWith("2021"));
    const isP = st.chart === "dop";
    // intensity scale: least squares on clear data
    let C = 1;
    if (!isP) {
      const ok = rows.filter((r) => r.condition === "ok"), mod = ok.map((r) => (st.step === 3 ? atField(r) : curve(r.gamma)).I);
      const w = ok.map((r) => 1 / Math.max(r.flux_err, 0.03 * r.flux) ** 2);
      C = ok.reduce((s, r, i) => s + w[i] * r.flux * mod[i], 0) / ok.reduce((s, r, i) => s + w[i] * mod[i] * mod[i], 0);
    }
    const col = BANDCOL[st.band];
    const pts = (cond, name, symbol) => {
      const rs = rows.filter((r) => r.condition === cond);
      return { x: rs.map((r) => r.gamma), y: rs.map((r) => (isP ? r.dop : r.flux / C)), text: rs.map((r) => r.field), name, mode: "markers", type: "scatter",
        error_y: { type: "data", array: rs.map((r) => (isP ? r.dop_err : r.flux_err / C)), thickness: 1, width: 0, color: col },
        marker: { size: 9, color: col, symbol, line: { width: 2, color: col } }, hovertemplate: "%{text}<br>γ = %{x:.1f}°<br>%{y:.3f}<extra></extra>" };
    };
    const traces = [];
    if (st.step === 3) {
      traces.push({ x: rows.map((r) => r.gamma), y: rows.map((r) => (isP ? atField(r).p : atField(r).I)), mode: "markers", name: "model at each field",
        marker: { symbol: "diamond-open", size: 11, color: "#f3c88b", line: { width: 2 } }, hovertemplate: "model %{y:.3f}<extra></extra>" });
    } else {
      const gs = Array.from({ length: 178 }, (_, i) => i + 1);
      traces.push({ x: gs, y: gs.map((g) => (isP ? curve(g).p : curve(g).I)), mode: "lines", name: "model", line: { width: 2.5, color: "#f3c88b" }, hoverinfo: "skip" });
    }
    traces.push(pts("ok", "clear", "circle"), pts("clouds", "clouds", "circle-open"), pts("sun", "twilight", "x-thin-open"));
    $("chartBand").textContent = `${st.band} band · ${STEPS[st.step].tag}`;
    const css = getComputedStyle(document.documentElement), c = (v) => css.getPropertyValue(v).trim();
    Plotly.react(chartEl, traces, {
      paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)", margin: { l: 56, r: 12, t: 10, b: 46 },
      font: { family: "Space Grotesk, system-ui, sans-serif", color: c("--text"), size: 12 },
      xaxis: { title: { text: "angular distance from the Moon γ (deg)" }, range: [0, 145], gridcolor: "rgba(160,175,255,.12)", zerolinecolor: "rgba(160,175,255,.3)" },
      yaxis: isP ? { title: { text: "degree of polarisation" }, range: [0, 1.02], gridcolor: "rgba(160,175,255,.12)" }
                 : { title: { text: "intensity (model units)" }, type: "log", gridcolor: "rgba(160,175,255,.12)" },
      legend: { orientation: "h", y: -0.28, bgcolor: "rgba(0,0,0,0)" },
      hoverlabel: { bgcolor: c("--panel-solid"), bordercolor: c("--line-strong"), font: { color: c("--text") } },
    }, { responsive: true, displaylogo: false, modeBarButtonsToRemove: ["lasso2d", "select2d"] });
  }
  new IntersectionObserver((es, o) => {
    if (es.some((e) => e.isIntersecting)) { o.disconnect(); loadPlotly().then(drawChart).catch(() => { chartEl.textContent = "Couldn't load the chart."; }); }
  }, { rootMargin: "300px" }).observe(chartEl);

  // ---------- start ----------
  sync(); $("stepExplain").innerHTML = STEPS[1].explain;
  Promise.all([fetch("data/paranal-observations.json").then((r) => r.json()), fetch("data/scatter-tables.json").then((r) => r.json())])
    .then(([o, t]) => { obsData = o; tables = t; applyBand(); schedule(); drawChart(); })
    .catch(() => { $("hoverInfo").textContent = "Couldn't load the data files."; });
  applyBand(); render();
})();
