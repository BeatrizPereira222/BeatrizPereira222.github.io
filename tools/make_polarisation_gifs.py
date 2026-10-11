"""Animations for the 'Polarisation and the electric field' topic.
    python tools/make_polarisation_gifs.py
Writes content/research/figures/em-wave.gif."""
import sys
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation, PillowWriter
sys.path.append(str(Path(__file__).parent))
from figures import dark_style, BG, TEXT, MUTED, BLUE, GOLD, VIOLET

OUT = Path(__file__).resolve().parent.parent / "content" / "research" / "figures"
dark_style()
N = 48                                   # frames per period

# ---------- 1. An electromagnetic wave travelling along z ----------
fig = plt.figure(figsize=(8, 3.4))
ax = fig.add_subplot(projection="3d")
fig.subplots_adjust(0, 0, 1, 1)
z = np.linspace(0, 4 * np.pi, 300)
def wave(i):
    ax.clear(); ph = 2 * np.pi * i / N
    E = np.cos(z - ph); B = np.cos(z - ph)
    ax.plot(z, np.zeros_like(z), E, color=GOLD, lw=2.2, label="electric field E")
    ax.plot(z, B, np.zeros_like(z), color=BLUE, lw=2.2, label="magnetic field B")
    for k in range(0, 300, 10):
        ax.plot([z[k], z[k]], [0, 0], [0, E[k]], color=GOLD, lw=0.8, alpha=.55)
        ax.plot([z[k], z[k]], [0, B[k]], [0, 0], color=BLUE, lw=0.8, alpha=.55)
    ax.plot([0, 4 * np.pi + 0.8], [0, 0], [0, 0], color=MUTED, lw=1)
    ax.text(4 * np.pi + 0.9, 0, -0.35, "travel →", color=MUTED, fontsize=10)
    ax.set_xlim(0, 4 * np.pi + 1); ax.set_ylim(-1.2, 1.2); ax.set_zlim(-1.2, 1.2)
    ax.set_axis_off(); ax.view_init(elev=18, azim=-62); ax.set_box_aspect((2.8, 1, 1), zoom=1.3)
    ax.set_facecolor(BG); fig.patch.set_facecolor(BG)
    ax.legend(loc="upper left", bbox_to_anchor=(0.02, 0.98), frameon=False, fontsize=10, labelcolor=TEXT)
anim = FuncAnimation(fig, wave, frames=N)
anim.save(OUT / "em-wave.gif", writer=PillowWriter(fps=20), dpi=90, savefig_kwargs={"facecolor": BG})
plt.close(fig)

print("ok")
