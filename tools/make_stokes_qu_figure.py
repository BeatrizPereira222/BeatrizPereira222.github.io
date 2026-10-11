"""What Q, U and V measure: differences of intensities through pairs of analysers.
    python tools/make_stokes_qu_figure.py  →  content/research/figures/stokes-qu.png"""
import sys
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Circle
sys.path.append(str(Path(__file__).parent))
from figures import dark_style, BG, TEXT, MUTED, BLUE, GOLD, VIOLET, GREEN
OUT = Path(__file__).resolve().parent.parent / "content" / "research" / "figures"
dark_style()
RED = "#ff8a7a"

def axes_cross(ax, x0):
    ax.plot([x0 - 1.05, x0 + 1.05], [0, 0], color=MUTED, lw=.6); ax.plot([x0, x0], [-1.05, 1.05], color=MUTED, lw=.6)
    ax.add_patch(Circle((x0, 0), 1.0, fill=False, ec=MUTED, lw=.6, ls=":"))

def dbl(ax, x0, ang, c):
    dx, dy = np.cos(ang) * 0.95, np.sin(ang) * 0.95
    ax.add_patch(FancyArrowPatch((x0 - dx, -dy), (x0 + dx, dy), arrowstyle="<|-|>", mutation_scale=16, color=c, lw=2.6))

def circ(ax, x0, sense, c):
    t = np.linspace(0.3, 2 * np.pi - 0.3, 100) * sense
    ax.plot(x0 + 0.8 * np.cos(t), 0.8 * np.sin(t), color=c, lw=2.6)
    t1 = t[-1]; ax.add_patch(FancyArrowPatch((x0 + 0.8 * np.cos(t[-6]), 0.8 * np.sin(t[-6])), (x0 + 0.8 * np.cos(t1), 0.8 * np.sin(t1)), arrowstyle="-|>", mutation_scale=16, color=c, lw=2.6))

rows = [("Q", [("I(0°)", lambda ax, x: dbl(ax, x, 0, GOLD)), ("I(90°)", lambda ax, x: dbl(ax, x, np.pi / 2, RED))],
         "more light along x  →  Q > 0\nmore light along y  →  Q < 0"),
        ("U", [("I(45°)", lambda ax, x: dbl(ax, x, np.pi / 4, GOLD)), ("I(135°)", lambda ax, x: dbl(ax, x, 3 * np.pi / 4, RED))],
         "more light at 45°   →  U > 0\nmore light at 135°  →  U < 0"),
        ("V", [("I(right)", lambda ax, x: circ(ax, x, 1, BLUE)), ("I(left)", lambda ax, x: circ(ax, x, -1, VIOLET))],
         "more right-handed  →  V > 0\nmore left-handed   →  V < 0")]
fig, axs = plt.subplots(3, 1, figsize=(8.2, 7.2)); fig.patch.set_facecolor(BG)
fig.subplots_adjust(left=0.02, right=0.98, top=0.98, bottom=0.02, hspace=0.15)
for ax, (P, pair, note) in zip(axs, rows):
    ax.set_xlim(-0.6, 10.4); ax.set_ylim(-1.35, 1.35); ax.set_aspect("equal"); ax.axis("off")
    ax.text(0.0, 0, f"{P}  =", color=TEXT, fontsize=22, va="center", ha="left")
    for k, (lab, draw) in enumerate(pair):
        x0 = 2.6 + 2.9 * k
        axes_cross(ax, x0); draw(ax, x0)
        ax.text(x0, -1.3, lab, color=TEXT, fontsize=12, ha="center", va="center")
    ax.text(4.05, 0, "−", color=TEXT, fontsize=26, va="center", ha="center")
    ax.text(7.0, 0, note, color=MUTED, fontsize=10.5, va="center", ha="left", family="monospace")
fig.savefig(OUT / "stokes-qu.png", dpi=150, facecolor=BG)
print("ok")
