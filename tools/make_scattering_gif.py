"""Light meets a particle: most is scattered in all directions, some is absorbed (and heats it),
some passes straight on.   python tools/make_scattering_gif.py  →  content/research/figures/scattering.gif"""
import sys
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation, PillowWriter
from matplotlib.patches import Circle
sys.path.append(str(Path(__file__).parent))
from figures import dark_style, BG, TEXT, MUTED, BLUE, GOLD
OUT = Path(__file__).resolve().parent.parent / "content" / "research" / "figures"
dark_style()
RED = "#ff8a7a"
rng = np.random.default_rng(7)
R = 1.1                                   # particle radius
V = 0.12                                  # photon speed per frame
WARM, PERIOD = 200, 120                   # frames to settle, frames in the loop

# photons: x, y, vx, vy, state (0 incoming, 1 scattered, 2 passed, 3 absorbed), age
P = []
heat = 0.0
rings = []                                # scattered wavefronts: radius
frames = []

def step(t):
    global heat
    if t % 4 == 0:                        # a narrow beam of photons aimed at the particle
        for y in np.linspace(-0.8, 0.8, 5):
            if rng.random() < 0.55: P.append([-7.0, y + rng.normal(0, .04), V, 0.0, 0, 0])
    for p in P:
        p[0] += p[2]; p[1] += p[3]; p[5] += 1
        if p[4] == 0 and p[0] ** 2 + p[1] ** 2 < R ** 2:
            r = rng.random()
            if r < 0.62:                  # scattered: new random direction
                a = rng.uniform(0, 2 * np.pi); p[2], p[3] = V * np.cos(a), V * np.sin(a); p[4] = 1
            elif r < 0.80:                # absorbed: the particle warms up
                p[4] = 3; heat = min(1.0, heat + 0.10)
            else:                         # passes straight through
                p[4] = 2
    P[:] = [p for p in P if p[4] != 3 and abs(p[0]) < 7.5 and abs(p[1]) < 4.5]
    heat *= 0.97
    if t % 18 == 0: rings.append(R)
    rings[:] = [r + V for r in rings if r < 6.5]
    return [list(p) for p in P], heat, list(rings)

for t in range(WARM + PERIOD): s = step(t); frames.append(s) if t >= WARM else None

fig, ax = plt.subplots(figsize=(8, 4.6)); fig.patch.set_facecolor(BG); fig.subplots_adjust(0, 0, 1, 1)
def draw(i):
    ps, h, rs = frames[i]; ax.clear(); ax.set_facecolor(BG)
    for r in rs:
        ax.add_patch(Circle((0, 0), r, fill=False, ec=BLUE, lw=1.2, alpha=max(0, 0.45 * (1 - r / 6.5))))
    glow = Circle((0, 0), R * 1.35, color=RED, alpha=0.12 + 0.35 * h, lw=0); ax.add_patch(glow)
    ax.add_patch(Circle((0, 0), R, color="#3a4a7a", ec="#9fb4ff", lw=1.5))
    ax.add_patch(Circle((0, 0), R * 0.55, color=RED, alpha=0.15 + 0.6 * h, lw=0))
    for x, y, vx, vy, st, age in ps:
        c = GOLD if st in (0, 2) else BLUE
        ax.plot([x - vx * 4, x], [y - vy * 4, y], color=c, lw=2, alpha=.9, solid_capstyle="round")
    ax.text(-6.8, 1.3, "incident light", color=GOLD, fontsize=12)
    ax.text(2.4, 3.6, "scattered in all directions", color=BLUE, fontsize=12)
    ax.text(0, -1.75, "some is absorbed → heat", color=RED, fontsize=11, ha="center")
    ax.text(4.4, -1.25, "some passes on", color=GOLD, fontsize=10, alpha=.85)
    ax.text(0, 0, "particle", color=TEXT, fontsize=9, ha="center", va="center")
    ax.set_xlim(-7, 7); ax.set_ylim(-4.3, 4.3); ax.set_aspect("equal"); ax.axis("off")
anim = FuncAnimation(fig, draw, frames=PERIOD)
anim.save(OUT / "scattering.gif", writer=PillowWriter(fps=24), dpi=75, savefig_kwargs={"facecolor": BG})
print("ok")
