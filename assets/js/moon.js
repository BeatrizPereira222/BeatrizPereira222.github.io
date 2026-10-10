/* Tonight's Moon: phase from the mean synodic month, drawn on a canvas.
   Accuracy is about ±1 day, which is fine for a widget. Swap in Astronomy Engine
   (or precompute with astropy) if you need exact times. */
(function () {
  const canvas = document.getElementById("moonCanvas");
  if (!canvas) return;
  const SYNODIC = 29.530588853;                         // days
  const REF_NEW = Date.UTC(2000, 0, 6, 18, 14) / 864e5;  // known new moon (JD-ish, in days)

  const now = Date.now() / 864e5;
  const age = (((now - REF_NEW) % SYNODIC) + SYNODIC) % SYNODIC;
  const p = age / SYNODIC;                              // 0 new → 0.5 full → 1 new
  const illum = (1 - Math.cos(2 * Math.PI * p)) / 2;

  const names = [
    [0.0339, "New Moon"], [0.216, "Waxing Crescent"], [0.284, "First Quarter"], [0.466, "Waxing Gibbous"],
    [0.534, "Full Moon"], [0.716, "Waning Gibbous"], [0.784, "Last Quarter"], [0.966, "Waning Crescent"], [1.01, "New Moon"],
  ];
  const name = names.find(([lim]) => p < lim)[1];
  const toFull = (p < 0.5 ? 0.5 - p : 1.5 - p) * SYNODIC;
  const fullDate = new Date(Date.now() + toFull * 864e5);

  document.getElementById("moonPhase").textContent = name;
  document.getElementById("moonIllum").textContent = Math.round(illum * 100) + "%";
  document.getElementById("moonAge").textContent = age.toFixed(1) + " d";
  document.getElementById("moonFull").textContent =
    fullDate.toLocaleDateString(undefined, { day: "numeric", month: "short" }) + ` (${Math.round(toFull)} d)`;

  // ----- draw -----
  const ctx = canvas.getContext("2d");
  const S = canvas.width, c = S / 2, r = S * 0.4;

  // halo
  const halo = ctx.createRadialGradient(c, c, r * 0.9, c, c, r * 1.25);
  halo.addColorStop(0, `rgba(220,228,255,${0.12 + 0.25 * illum})`);
  halo.addColorStop(1, "rgba(220,228,255,0)");
  ctx.fillStyle = halo; ctx.fillRect(0, 0, S, S);

  // dark disk with a hint of earthshine
  ctx.fillStyle = "#14172a";
  ctx.beginPath(); ctx.arc(c, c, r, 0, Math.PI * 2); ctx.fill();

  // lit region: limb on one side, terminator ellipse on the other
  const side = p < 0.5 ? 1 : -1;   // waxing lit on the right (northern hemisphere view)
  const k = side * (1 - 2 * illum);
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) { const t = -Math.PI / 2 + (Math.PI * i) / 60; ctx.lineTo(c + side * r * Math.cos(t), c + r * Math.sin(t)); }
  for (let i = 60; i >= 0; i--) { const t = -Math.PI / 2 + (Math.PI * i) / 60; ctx.lineTo(c + k * r * Math.cos(t), c + r * Math.sin(t)); }
  ctx.closePath();
  const lit = ctx.createRadialGradient(c - r * 0.3, c - r * 0.3, r * 0.1, c, c, r);
  lit.addColorStop(0, "#fbfaf4"); lit.addColorStop(1, "#c9cbd6");
  ctx.fillStyle = lit; ctx.fill();

  // a few maria, clipped to the lit area
  ctx.save(); ctx.clip();
  ctx.fillStyle = "rgba(120,125,145,0.28)";
  [[-0.25, -0.2, 0.22], [0.15, -0.3, 0.16], [0.05, 0.1, 0.2], [-0.35, 0.25, 0.12], [0.3, 0.3, 0.1]].forEach(([x, y, s]) => {
    ctx.beginPath(); ctx.arc(c + x * r, c + y * r, s * r, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();
})();
