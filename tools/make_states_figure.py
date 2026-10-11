"""Static figure: elliptical, circular, linear and unpolarised light as waves along the beam,
with the end-on view of the electric field.  →  content/research/figures/polarisation-states.png"""
import sys
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
sys.path.append(str(Path(__file__).parent))
from figures import dark_style, BG, TEXT, MUTED, BLUE, GOLD, VIOLET, GREEN
OUT = Path(__file__).resolve().parent.parent / "content" / "research" / "figures"
dark_style()
z = np.linspace(0, 4 * np.pi, 400)
rng = np.random.default_rng(3); seg = rng.uniform(0, np.pi, 40)
def field(kind, u):
    if kind == "elliptical": return np.cos(u), 0.55 * np.cos(u - np.pi / 3)
    if kind == "circular":   return np.cos(u), np.sin(u)
    if kind == "linear":     a = np.radians(35); return np.cos(u) * np.cos(a), np.cos(u) * np.sin(a)
    a = seg[np.floor(u / np.pi).astype(int) % len(seg)]; return np.cos(u) * np.cos(a), np.cos(u) * np.sin(a)
cases = [("Elliptical", "elliptical", VIOLET, r"$\binom{1}{0.55\,e^{i\pi/3}}$"),
         ("Circular", "circular", BLUE, r"$\frac{1}{\sqrt{2}}\binom{1}{\pm i}$"),
         ("Linear", "linear", GOLD, r"$\binom{\cos\alpha}{\sin\alpha}$"),
         ("Unpolarised", "unpolarised", GREEN, "no single\nJones vector")]
fig = plt.figure(figsize=(11, 4.6)); fig.patch.set_facecolor(BG)
for i, (name, kind, c, jv) in enumerate(cases):
    ax = fig.add_axes([0.005 + 0.248 * i, 0.34, 0.245, 0.58], projection="3d")
    ex, ey = field(kind, z)
    ax.plot(z, ex, ey, color=c, lw=2)
    for k in range(0, len(z), 8): ax.plot([z[k]] * 2, [0, ex[k]], [0, ey[k]], color=c, lw=.7, alpha=.5)
    ax.plot([0, z[-1] + 1.2], [0, 0], [0, 0], color=MUTED, lw=1)
    ax.quiver(z[-1] + 0.6, 0, 0, 1, 0, 0, color=MUTED, arrow_length_ratio=0.6, lw=1)
    ax.set_xlim(0, z[-1] + 1.5); ax.set_ylim(-1.1, 1.1); ax.set_zlim(-1.1, 1.1)
    ax.set_box_aspect((2.6, 1, 1), zoom=1.25); ax.view_init(elev=16, azim=-58); ax.set_axis_off(); ax.set_facecolor(BG)
    fig.text(0.128 + 0.248 * i, 0.94, name, color=TEXT, fontsize=13, ha="center")
    a2 = fig.add_axes([0.015 + 0.248 * i, 0.03, 0.12, 0.36])
    if kind == "unpolarised":
        for a in seg[:14]: a2.plot([-np.cos(a), np.cos(a)], [-np.sin(a), np.sin(a)], color=c, lw=1.2, alpha=.7)
    else:
        u = np.linspace(0, 2 * np.pi, 200); x, y = field(kind, u); a2.plot(x, y, color=c, lw=2)
        u0 = 0.9; x0, y0 = field(kind, np.array([u0])); x1, y1 = field(kind, np.array([u0 + 0.25]))
        a2.annotate("", xy=(x1[0], y1[0]), xytext=(x0[0], y0[0]), arrowprops=dict(arrowstyle="-|>", color=c, lw=1.6))
    a2.axhline(0, color=MUTED, lw=.5); a2.axvline(0, color=MUTED, lw=.5)
    a2.text(1.12, 0.08, "$E_x$", color=MUTED, fontsize=9); a2.text(0.06, 1.12, "$E_y$", color=MUTED, fontsize=9)
    a2.set_xlim(-1.3, 1.3); a2.set_ylim(-1.3, 1.3); a2.set_aspect("equal"); a2.axis("off")
    fig.text(0.195 + 0.248 * i, 0.21, jv, color=c, fontsize=14, ha="center", va="center")
fig.savefig(OUT / "polarisation-states.png", dpi=150, facecolor=BG)
print("ok")
