"""Builds the example figures used by the sample chapters. Run from the site folder:
       python tools/make_sample_figures.py
"""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from figures import dark_style, save_png, save_gif, save_plot_json, BLUE, GOLD, VIOLET, MUTED

dark_style()
P = "content/physics/figures/"
R = "content/research/figures/"

# 1. Static PNG: position and velocity under constant acceleration
t = np.linspace(0, 4, 200)
v0, a = 12.0, -9.81
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 3.4))
ax1.plot(t, v0 * t + 0.5 * a * t**2, color=BLUE); ax1.set(xlabel="t (s)", ylabel="x (m)", title="Position")
ax1.axhline(0, color=MUTED, lw=0.8)
ax2.plot(t, v0 + a * t, color=GOLD); ax2.set(xlabel="t (s)", ylabel="v (m/s)", title="Velocity")
ax2.axhline(0, color=MUTED, lw=0.8)
fig.tight_layout()
save_png(fig, P + "ball-thrown-up.png")

# 2. Interactive plot: noisy free-fall measurements + least-squares fit
rng = np.random.default_rng(7)
tm = np.linspace(0.1, 0.9, 12)
ym = 0.5 * 9.81 * tm**2 + rng.normal(0, 0.06, tm.size)
c = np.polyfit(tm, ym, 2)
tf = np.linspace(0, 1, 100)
save_plot_json(
    [
        {"x": tm, "y": ym, "mode": "markers", "name": "measurements",
         "error_y": {"type": "constant", "value": 0.06, "thickness": 1}, "marker": {"size": 8}},
        {"x": tf, "y": np.polyval(c, tf), "mode": "lines", "name": f"fit: d = {c[0]:.2f} t² + …  →  g ≈ {2*c[0]:.2f} m/s²"},
    ],
    {"xaxis": {"title": {"text": "time t (s)"}}, "yaxis": {"title": {"text": "distance fallen d (m)"}}},
    P + "free-fall-fit.json",
)

# 3. GIF: projectile
g, v, ang = 9.81, 20, np.radians(55)
T = 2 * v * np.sin(ang) / g
ts = np.linspace(0, T, 60)
xs, ys = v * np.cos(ang) * ts, v * np.sin(ang) * ts - 0.5 * g * ts**2
fig, ax = plt.subplots(figsize=(6.4, 3.4))
ax.set(xlim=(0, xs.max() * 1.05), ylim=(0, ys.max() * 1.25), xlabel="x (m)", ylabel="y (m)")
trail, = ax.plot([], [], color=BLUE, lw=1.5, alpha=0.7)
ball, = ax.plot([], [], "o", color=GOLD, ms=10)
arrow = ax.quiver([0], [0], [0], [0], color=VIOLET, angles="xy", scale_units="xy", scale=1.2, width=0.006)
def frame(i):
    trail.set_data(xs[: i + 1], ys[: i + 1]); ball.set_data([xs[i]], [ys[i]])
    arrow.set_offsets([[xs[i], ys[i]]]); arrow.set_UVC([v * np.cos(ang) * 0.35], [(v * np.sin(ang) - g * ts[i]) * 0.35])
    return trail, ball, arrow
fig.tight_layout()
save_gif(FuncAnimation(fig, frame, frames=len(ts), blit=False), P + "projectile.gif", fps=20)

# 4. GIF: electric field of linearly vs circularly polarised light
z = np.linspace(0, 4 * np.pi, 120)
fig = plt.figure(figsize=(7.4, 3.0)); fig.subplots_adjust(left=0, right=1, bottom=0, top=0.92, wspace=0)
axs = [fig.add_subplot(1, 2, k + 1, projection="3d") for k in range(2)]
titles = ["Linear", "Circular"]
def wave(i):
    ph = i * 2 * np.pi / 40
    for k, ax in enumerate(axs):
        ax.cla()
        ex = np.cos(z - ph)
        ey = np.zeros_like(z) if k == 0 else np.sin(z - ph)
        ax.plot(z, ex, ey, color=[BLUE, VIOLET][k], lw=2)
        for j in range(0, z.size, 6):
            ax.plot([z[j], z[j]], [0, ex[j]], [0, ey[j]], color=GOLD, lw=0.8, alpha=0.7)
        ax.plot(z, 0 * z, 0 * z, color=MUTED, lw=0.8)
        ax.set(xlim=(0, z.max()), ylim=(-1.2, 1.2), zlim=(-1.2, 1.2), xticks=[], yticks=[], zticks=[])
        ax.set_title(titles[k], color="#e8eaf4", pad=0)
        ax.set_axis_off(); ax.view_init(18, -60); ax.set_box_aspect((2.4, 1, 1), zoom=1.45)
    return []
save_gif(FuncAnimation(fig, wave, frames=40), P + "polarised-waves.gif", fps=18)

# 5. Interactive: degree of polarisation vs scattering angle (Rayleigh)
gam = np.linspace(0, 180, 181)
cg = np.cos(np.radians(gam))
traces = [{"x": gam, "y": 100 * pm * (1 - cg**2) / (1 + cg**2), "mode": "lines", "name": f"P_max = {int(pm*100)}%"} for pm in (1.0, 0.75, 0.5)]
save_plot_json(traces, {"xaxis": {"title": {"text": "scattering angle γ (degrees)"}, "dtick": 30},
                        "yaxis": {"title": {"text": "degree of polarisation (%)"}, "range": [0, 105]}},
               R + "rayleigh-degree.json")
print("done")
