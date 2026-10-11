"""Waves travelling along their direction of propagation, for elliptical, circular,
linear and unpolarised light (after Figure 1.2 of my thesis). At the front of each wave,
a plane shows the shape the electric field traces.
    python tools/make_wave_states_gif.py   →  content/research/figures/polarisation-waves.gif"""
import sys
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation, PillowWriter
sys.path.append(str(Path(__file__).parent))
from figures import dark_style, BG, TEXT, MUTED, BLUE, GOLD, VIOLET, GREEN

OUT = Path(__file__).resolve().parent.parent / "content" / "research" / "figures"
dark_style()
N = 60
Z = 4 * np.pi                                 # the front of the wave
z = np.linspace(0, Z, 240)
rng = np.random.default_rng(3)
seg_angle = rng.uniform(0, np.pi, 64)

def field(kind, u):
    if kind == "elliptical": return np.cos(u), 0.55 * np.cos(u - np.pi / 3)
    if kind == "circular":   return np.cos(u), np.sin(u)
    if kind == "linear":     a = np.radians(35); return np.cos(u) * np.cos(a), np.cos(u) * np.sin(a)
    k = np.floor(u / np.pi).astype(int) % len(seg_angle); a = seg_angle[k]
    return np.cos(u) * np.cos(a), np.cos(u) * np.sin(a)

cases = [("Elliptical", "elliptical", VIOLET), ("Circular", "circular", BLUE), ("Linear", "linear", GOLD), ("Unpolarised", "unpolarised", GREEN)]
fig = plt.figure(figsize=(10.4, 3.6)); fig.patch.set_facecolor(BG)
axs = [fig.add_axes([0.0 + 0.25 * i, 0.0, 0.25, 0.9], projection="3d") for i in range(4)]
for i, (name, _, _) in enumerate(cases):
    fig.text(0.125 + 0.25 * i, 0.9, name, color=TEXT, fontsize=13, ha="center")
hist = {k: [] for _, k, _ in cases}

def frame(i):
    ph = 2 * np.pi * i / N
    for (name, kind, c), ax in zip(cases, axs):
        ax.clear()
        ex, ey = field(kind, z - ph)
        ax.plot(z, ex, ey, color=c, lw=1.8)
        for k in range(0, len(z), 6):
            ax.plot([z[k]] * 2, [0, ex[k]], [0, ey[k]], color=c, lw=0.7, alpha=.45)
        ax.plot([0, Z + 0.6], [0, 0], [0, 0], color=MUTED, lw=1)
        # the front: a plane at z = Z with the shape the field traces there
        sq = np.array([[-1.15, -1.15], [1.15, -1.15], [1.15, 1.15], [-1.15, 1.15], [-1.15, -1.15]])
        ax.plot([Z] * 5, sq[:, 0], sq[:, 1], color=MUTED, lw=.8, alpha=.7)
        from mpl_toolkits.mplot3d.art3d import Poly3DCollection
        ax.add_collection3d(Poly3DCollection([list(zip([Z] * 4, sq[:4, 0], sq[:4, 1]))], facecolor=c, alpha=.08, edgecolor="none"))
        if kind == "unpolarised":
            hist[kind].append(field(kind, np.array([Z - ph]))); hist[kind] = hist[kind][-45:]
            for (hx, hy) in hist[kind][::3]:
                ax.plot([Z, Z], [-hx[0], hx[0]], [-hy[0], hy[0]], color=c, lw=1, alpha=.35)
        else:
            u = np.linspace(0, 2 * np.pi, 120); tx, ty = field(kind, u)
            ax.plot([Z] * len(u), tx, ty, color=c, lw=2.6, alpha=.9)
        fx, fy = field(kind, np.array([Z - ph]))
        ax.quiver(Z, 0, 0, 0, fx[0], fy[0], color="white", lw=2, arrow_length_ratio=0.25)
        ax.set_xlim(0, Z + 0.6); ax.set_ylim(-1.2, 1.2); ax.set_zlim(-1.2, 1.2)
        ax.set_box_aspect((2.2, 1, 1), zoom=1.32); ax.view_init(elev=18, azim=-28); ax.set_axis_off(); ax.set_facecolor(BG)

anim = FuncAnimation(fig, frame, frames=N)
anim.save(OUT / "polarisation-waves.gif", writer=PillowWriter(fps=20), dpi=80, savefig_kwargs={"facecolor": BG})
print("ok")
