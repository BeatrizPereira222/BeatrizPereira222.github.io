"""Diagrams for the research topics, in the site's style.
    python tools/make_topic_figures.py"""
import sys
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.interpolate import PchipInterpolator
sys.path.append(str(Path(__file__).parent))
from figures import dark_style, save_png, TEXT, MUTED, BLUE, GOLD, VIOLET, GREEN
OUT = Path(__file__).resolve().parent.parent / "content" / "research" / "figures"
dark_style()

# ---------- Scattering regimes: particle radius vs wavelength, lines of constant x = 2πr/λ ----------
fig, ax = plt.subplots(figsize=(7, 5.2))
lam = np.logspace(-7, -1, 50)                               # wavelength in metres
for x, lab in [(0.002, "x = 0.002"), (0.2, "x = 0.2"), (2000, "x = 2000")]:
    ax.loglog(lam, x * lam / (2 * np.pi), ls="--", color=MUTED, lw=1)
    xx = 2e-2 if x < 1 else 3e-6
    ax.text(xx, x * xx / (2 * np.pi) * 1.6, lab, color=MUTED, fontsize=9, rotation=33)
ax.text(1.5e-3, 1e-9, "negligible scattering", color=MUTED, fontsize=10, rotation=33)
ax.text(4e-6, 6e-9, "Rayleigh scattering", color=BLUE, fontsize=12, rotation=33)
ax.text(1.5e-6, 1.2e-6, "Mie scattering", color=GOLD, fontsize=12, rotation=33)
ax.text(2e-7, 3e-4, "geometric optics", color=VIOLET, fontsize=11, rotation=33)
for r, lab in [(1e-10, "air molecules"), (1e-7, "aerosols, smoke, haze"), (1e-5, "cloud droplets"), (1e-3, "raindrops")]:
    ax.axhline(r, color=GREEN, lw=.5, alpha=.4); ax.text(1.3e-1, r, lab, color=GREEN, fontsize=9, va="center")
ax.axvspan(4e-7, 7e-7, color=GOLD, alpha=.12); ax.text(4.5e-7, 2e-2, "visible", color=GOLD, fontsize=9, rotation=90, va="top")
ax.set_xlim(1e-7, 1e-1); ax.set_ylim(2e-11, 1e-1)
ax.set_xlabel("wavelength of the light (m)"); ax.set_ylabel("particle radius (m)")
save_png(fig, OUT / "scattering-regimes.png")

# ---------- Lunar polarisation curve (schematic, after Dollfus & Bowell 1971) ----------
fig, ax = plt.subplots(figsize=(7, 4.4))
def curve(pmin, vmin, v0, pm, vm, end):
    v = np.array([0, vmin, v0, 60, vm, 140]); p = np.array([0, pmin, 0, pm * 0.55, pm, end])
    g = np.linspace(0, 140, 300); return g, PchipInterpolator(v, p)(g)
for (lab, args, c) in [("dark mare (albedo 0.063)", (-1.2, 12, 24, 13.6, 109, 9.0), VIOLET), ("bright highland (albedo 0.117)", (-1.2, 12, 24, 5.8, 105, 3.6), GOLD)]:
    g, p = curve(*args); ax.plot(g, p, color=c, lw=2.5, label=lab)
    ax.annotate(f"max {args[3]}% at {args[4]}°", (args[4], args[3]), xytext=(args[4] + 4, args[3] + 1.3), color=c, fontsize=9, arrowprops=dict(arrowstyle="-", color=c, lw=.8))
ax.axhline(0, color=MUTED, lw=.8)
ax.annotate("negative branch\n(min −1.2% at 12°)", (12, -1.2), xytext=(30, -3.2), color=TEXT, fontsize=9, arrowprops=dict(arrowstyle="-", color=MUTED, lw=.8))
ax.annotate("inversion at 24°", (24, 0), xytext=(40, 2.3), color=TEXT, fontsize=9, arrowprops=dict(arrowstyle="-", color=MUTED, lw=.8))
ax.set_xlim(0, 150); ax.set_ylim(-4.5, 17)
ax.set_xlabel("phase angle (°)   ·   0° = full Moon"); ax.set_ylabel("degree of polarisation (%)")
ax.legend(loc="upper left", frameon=False, fontsize=10)
save_png(fig, OUT / "moon-polarisation-curve.png")
print("ok")
