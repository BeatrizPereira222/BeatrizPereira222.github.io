/* Animated starfield: three parallax layers, twinkling, the odd shooting star.
   Stars drift with scroll so the page feels like moving through space. */
(function () {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TINTS = ["#ffffff", "#cfd8ff", "#ffe9c4", "#c9b8ff", "#aee2ff"];
  let W, H, DPR, stars = [], meteors = [], scrollY = window.scrollY;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const count = Math.round((W * H) / 2600);
    stars = Array.from({ length: count }, () => {
      const layer = Math.random() < 0.6 ? 0 : Math.random() < 0.75 ? 1 : 2;
      return {
        x: Math.random() * W,
        y: Math.random() * H * 3,            // tall field so scrolling reveals new stars
        r: [0.5, 0.9, 1.4][layer] * (0.7 + Math.random() * 0.6),
        depth: [0.06, 0.15, 0.3][layer],     // parallax speed
        tw: Math.random() * Math.PI * 2,     // twinkle phase
        sp: 0.6 + Math.random() * 1.8,       // twinkle speed
        c: TINTS[Math.random() < 0.7 ? 0 : 1 + Math.floor(Math.random() * 4)],
      };
    });
  }

  function spawnMeteor() {
    const fromLeft = Math.random() < 0.5;
    meteors.push({
      x: fromLeft ? Math.random() * W * 0.5 : W * 0.5 + Math.random() * W * 0.5,
      y: Math.random() * H * 0.4,
      vx: (fromLeft ? 1 : -1) * (6 + Math.random() * 5),
      vy: 2.5 + Math.random() * 2.5,
      life: 0, max: 50 + Math.random() * 30,
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const time = t / 1000;
    for (const s of stars) {
      const span = H * 3;
      let y = (s.y - scrollY * s.depth) % span;
      if (y < 0) y += span;
      if (y > H + 4) continue;
      const a = reduced ? 0.8 : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * s.sp + s.tw));
      ctx.globalAlpha = a;
      ctx.fillStyle = s.c;
      ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, Math.PI * 2); ctx.fill();
      if (s.r > 1.3) { // soft glow for bright stars
        ctx.globalAlpha = a * 0.15;
        ctx.beginPath(); ctx.arc(s.x, y, s.r * 4, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    if (!reduced && Math.random() < 0.004 && meteors.length < 2) spawnMeteor();
    meteors = meteors.filter((m) => {
      m.life++; m.x += m.vx; m.y += m.vy;
      const fade = 1 - m.life / m.max;
      const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 12, m.y - m.vy * 12);
      g.addColorStop(0, `rgba(255,255,255,${0.9 * fade})`);
      g.addColorStop(1, "rgba(159,180,255,0)");
      ctx.strokeStyle = g; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 12, m.y - m.vy * 12); ctx.stroke();
      return m.life < m.max;
    });

    if (!reduced) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => { resize(); if (reduced) draw(0); });
  window.addEventListener("scroll", () => { scrollY = window.scrollY; if (reduced) draw(0); }, { passive: true });
  resize();
  requestAnimationFrame(draw);
})();
