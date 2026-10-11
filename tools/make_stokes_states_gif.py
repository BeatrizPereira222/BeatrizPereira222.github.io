"""The polarisation states of the Stokes-parameter table, animated, each with its Stokes vector.
    python tools/make_stokes_states_gif.py  →  content/research/figures/stokes-states.gif"""
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
rng = np.random.default_rng(5); seg = rng.uniform(0, np.pi, 200)
def lin(a): return lambda u: (np.cos(u) * np.cos(a), np.cos(u) * np.sin(a))
cases = [
    ("Unpolarised", None, GREEN, "(1, 0, 0, 0)"),
    ("Linear, 0° (along x)", lin(0.0), GOLD, "(1, 1, 0, 0)"),
    ("Linear, 90° (along y)", lin(np.pi / 2), GOLD, "(1, −1, 0, 0)"),
    ("Linear, +45°", lin(np.pi / 4), GOLD, "(1, 0, 1, 0)"),
    ("Linear, angle α = 30°", lin(np.pi / 6), GOLD, "(1, 0.5, 0.87, 0)"),
    ("Circular, right", lambda u: (np.cos(u), -np.sin(-u)), BLUE, "(1, 0, 0, +1)"),
    ("Circular, left", lambda u: (np.cos(u), np.sin(-u)), BLUE, "(1, 0, 0, −1)"),
    ("Elliptical", lambda u: (np.cos(u), 0.55 * np.cos(u - np.pi / 3)), VIOLET, "(1, Q, U, V)\nlinear + circular"),
]
fig, axs = plt.subplots(2, 4, figsize=(10, 6.0)); fig.patch.set_facecolor(BG)
fig.subplots_adjust(left=0.01, right=0.99, top=0.94, bottom=0.12, hspace=0.75, wspace=0.1)
hist = []
def frame(i):
    u0 = 2 * np.pi * i / N
    for ax, (name, f, c, sv) in zip(axs.flat, cases):
        ax.clear()
        ax.axhline(0, color=MUTED, lw=.5); ax.axvline(0, color=MUTED, lw=.5)
        if f is None:
            a = seg[(i // 3) % len(seg)]; hist.append(a)
            for b in hist[-12:]: ax.plot([-np.cos(b), np.cos(b)], [-np.sin(b), np.sin(b)], color=c, lw=1, alpha=.3)
            x, y = np.cos(u0) * np.cos(a), np.cos(u0) * np.sin(a)
        else:
            u = np.linspace(0, 2 * np.pi, 200); tx, ty = f(u); ax.plot(tx, ty, color=c, lw=1.2, alpha=.45)
            x, y = f(np.array([u0])); x, y = x[0], y[0]
        ax.annotate("", xy=(x, y), xytext=(0, 0), arrowprops=dict(arrowstyle="-|>", color=c, lw=2))
        ax.set_xlim(-1.3, 1.3); ax.set_ylim(-1.3, 1.3); ax.set_aspect("equal"); ax.axis("off")
        ax.set_title(name, color=TEXT, fontsize=13)
        ax.text(0, -1.62, "S = " + sv, color=c, fontsize=12.5, ha="center", va="top", family="monospace")
        ax.text(1.3, 0.06, "x", color=MUTED, fontsize=8); ax.text(0.06, 1.2, "y", color=MUTED, fontsize=8)
anim = FuncAnimation(fig, frame, frames=N)
anim.save(OUT / "stokes-states.gif", writer=PillowWriter(fps=20), dpi=90, savefig_kwargs={"facecolor": BG})
print("ok")
