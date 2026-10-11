"""Figures for the chapter 'Motion in one dimension' (toy-car examples).
    python tools/make_motion_figures.py"""
import json, sys
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation, PillowWriter
sys.path.append(str(Path(__file__).parent))
from figures import dark_style, BG, TEXT, MUTED, BLUE, GOLD, VIOLET, GREEN
OUT = Path(__file__).resolve().parent.parent / "content" / "physics" / "figures"
RED = "#ff8a7a"

t1 = np.arange(11); d1 = np.array([0, 120, 400, 900, 950, 960, 1300, 1800, 2350, 2350, 2500])   # non-uniform
t2 = np.arange(7);  d2 = 20 * t2                                                                 # uniform
t3 = np.arange(7);  d3 = 16 * t3 ** 2                                                            # uniformly accelerated
tt = np.linspace(0, 6, 121)

def pts(x, y, c, name, unit="m"):
    return {"type": "scatter", "mode": "markers", "x": x.tolist(), "y": y.tolist(), "name": name,
            "marker": {"color": c, "size": 10, "line": {"color": "#05060a", "width": 1}},
            "hovertemplate": "t = %{x} s<br>" + ("d" if unit == "m" else "v") + f" = %{{y}} {unit}<extra></extra>"}
def curve(x, y, c, name, dash=None, w=2.5, show=True):
    d = {"type": "scatter", "mode": "lines", "x": np.round(x, 3).tolist(), "y": np.round(y, 3).tolist(), "name": name,
         "line": {"color": c, "width": w}, "hoverinfo": "skip", "showlegend": show}
    if dash: d["line"]["dash"] = dash
    return d
def save(name, data, xt="time t (s)", yt="distance d (m)", extra=None):
    lay = {"xaxis": {"title": {"text": xt}}, "yaxis": {"title": {"text": yt}}}
    if extra: lay.update(extra)
    json.dump({"data": data, "layout": lay}, open(OUT / name, "w"))

# 1. Non-uniform motion: the measured positions
seg = [(0, 2, "speeds up"), (2, 3, "fast"), (3, 5, "almost stops"), (5, 8, "last sprint"), (8, 9, "stopped")]
save("motion-nonuniform.json", [curve(t1, d1, MUTED, "joined points", dash="dot", w=1.5, show=False), pts(t1, d1, GOLD, "measured position")],
     extra={"annotations": [{"x": 4, "y": 955, "text": "almost stopped", "showarrow": True, "ay": -40, "ax": -30, "font": {"color": TEXT}, "arrowcolor": MUTED},
                             {"x": 8.5, "y": 2350, "text": "stopped", "showarrow": True, "ay": -35, "ax": -40, "font": {"color": TEXT}, "arrowcolor": MUTED}]})

# 2. Uniform motion: d = 20 t
save("motion-uniform.json", [curve(tt, 20 * tt, BLUE, "d(t) = 20 t"), pts(t2, d2, GOLD, "measured position")])

# 3. Uniformly accelerated: d = 16 t², with tangent lines (the instantaneous velocity)
data = [curve(tt, 16 * tt ** 2, BLUE, "d(t) = 16 t²"), pts(t3, d3, GOLD, "measured position")]
for k, t0 in enumerate([1, 2, 3, 4, 5]):
    v = 32 * t0; x = np.array([t0 - 1.1, t0 + 1.1])
    data.append(curve(x, 16 * t0 ** 2 + v * (x - t0), GREEN, "tangent (slope = velocity)", w=2.5, dash="dash", show=(k == 0)))
save("motion-accelerated.json", data)

# 4. Velocity of the accelerated car: v = 32 t
save("motion-velocity.json", [curve(tt, 32 * tt, VIOLET, "v(t) = 32 t"), pts(t3, 32 * t3, GOLD, "slope of each tangent", unit="m/s")],
     yt="velocity v (m/s)")

# 5. Distance as a sum of v·Δt: rectangles that approach the area under v(t) as Δt shrinks
steps, traces = [], [curve(tt, 32 * tt, VIOLET, "v(t) = 32 t")]
for j, dt in enumerate([1.0, 0.5, 0.25, 0.1]):
    ti = np.arange(0, 6, dt); vi = 32 * ti; total = float((vi * dt).sum())
    traces.append({"type": "bar", "x": (ti + dt / 2).tolist(), "y": vi.tolist(), "width": [dt * 0.98] * len(ti),
                   "marker": {"color": "rgba(243,200,139,.45)", "line": {"color": GOLD, "width": 1}},
                   "name": f"Σ v(tᵢ) Δt = {total:.0f} m", "visible": j == 0, "hoverinfo": "skip"})
for j, dt in enumerate([1.0, 0.5, 0.25, 0.1]):
    vis = [True] + [k == j for k in range(4)]
    steps.append({"label": f"Δt = {dt} s", "method": "restyle", "args": ["visible", vis]})
save("motion-riemann.json", traces, yt="velocity v (m/s)",
     extra={"sliders": [{"active": 0, "steps": steps, "currentvalue": {"prefix": "", "font": {"color": TEXT}}, "pad": {"t": 50},
                         "font": {"color": MUTED}, "bgcolor": "rgba(160,175,255,.15)", "activebgcolor": GOLD, "bordercolor": "rgba(160,175,255,.3)"}],
            "bargap": 0, "legend": {"x": 0, "y": 1.02, "yanchor": "bottom"}})

# 6. Animation: three toy cars, each on its own track and scale, leaving a mark every second
dark_style()
fig, ax = plt.subplots(figsize=(8, 3.6)); fig.patch.set_facecolor(BG); fig.subplots_adjust(0.02, 0.02, 0.98, 0.98)
lanes = [("non-uniform motion", t1, d1, 2500, GOLD), ("uniform motion: d = 20 t", t2, d2, 120, BLUE),
         ("uniformly accelerated: d = 16 t²", t3, d3, 576, VIOLET)]
F = 150
def draw(i):
    t = 10 * i / (F - 1); ax.clear(); ax.set_facecolor(BG)
    for k, (lab, tk, dk, L, c) in enumerate(lanes):
        y = 2.2 - 1.1 * k; x = np.interp(min(t, tk[-1]), tk, dk) / L
        ax.plot([0, 1], [y, y], color=MUTED, lw=.8)
        for q in (0, 0.5, 1): ax.plot([q, q], [y - .05, y + .05], color=MUTED, lw=.8); ax.text(q, y - 0.2, f"{q * L:.0f} m", color=MUTED, fontsize=8, ha="center")
        marks = tk[tk <= t]; ax.scatter(np.interp(marks, tk, dk) / L, [y] * len(marks), s=18, color=c, alpha=.55, zorder=2)
        ax.add_patch(plt.Rectangle((x - 0.035, y + 0.05), 0.07, 0.13, color=c, ec="none", zorder=3))
        ax.scatter([x - 0.02, x + 0.02], [y + 0.05, y + 0.05], s=30, color="#e8eaf4", zorder=4)
        ax.text(0, y + 0.3, lab, color=c, fontsize=10.5)
    ax.text(1.0, -0.55, f"t = {t:4.1f} s", color=TEXT, fontsize=11, ha="right", family="monospace")
    ax.text(0, -0.55, "dots: position every second", color=MUTED, fontsize=9)
    ax.set_xlim(-0.05, 1.06); ax.set_ylim(-0.7, 2.65); ax.axis("off")
anim = FuncAnimation(fig, draw, frames=F)
anim.save(OUT / "toy-cars.gif", writer=PillowWriter(fps=15), dpi=80, savefig_kwargs={"facecolor": BG})
print("ok")
