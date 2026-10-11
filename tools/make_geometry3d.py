"""Interactive 3D scattering geometry (Plotly JSON) for the 'Scattering' topic.
    python tools/make_geometry3d.py  →  content/research/figures/scattering-geometry-3d.json"""
import json
from pathlib import Path
import numpy as np
OUT = Path(__file__).resolve().parent.parent / "content" / "research" / "figures"
GOLD, BLUE, VIOLET, MUTED, TEXT, GREEN = "#f3c88b", "#9fb4ff", "#c79bff", "#9097b3", "#e8eaf4", "#8fe3b0"
D = np.pi / 180
def unit(alt, az): return np.array([np.cos(alt * D) * np.sin(az * D), np.cos(alt * D) * np.cos(az * D), np.sin(alt * D)])
def slerp(a, b, n=40, r=1.0):
    w = np.arccos(np.clip(a @ b, -1, 1)); t = np.linspace(0, 1, n)
    return np.array([(np.sin((1 - s) * w) * a + np.sin(s * w) * b) / np.sin(w) * r for s in t])
def line(p, q, color, width=5, name="", dash=None, show=False):
    d = {"type": "scatter3d", "mode": "lines", "x": [p[0], q[0]], "y": [p[1], q[1]], "z": [p[2], q[2]],
         "line": {"color": color, "width": width}, "name": name, "showlegend": show, "hoverinfo": "skip"}
    if dash: d["line"]["dash"] = dash
    return d
def curve(pts, color, width=4, name="", show=False, dash=None):
    d = {"type": "scatter3d", "mode": "lines", "x": pts[:, 0].tolist(), "y": pts[:, 1].tolist(), "z": pts[:, 2].tolist(),
         "line": {"color": color, "width": width}, "name": name, "showlegend": show, "hoverinfo": "skip"}
    if dash: d["line"]["dash"] = dash
    return d
def label(p, text, color, size=15):
    return {"type": "scatter3d", "mode": "text", "x": [p[0]], "y": [p[1]], "z": [p[2]], "text": [text],
            "textfont": {"color": color, "size": size}, "showlegend": False, "hoverinfo": "skip"}

moon, targ = unit(42, 65), unit(30, 205)
gamma = np.degrees(np.arccos(moon @ targ))
O = np.zeros(3); Z = np.array([0, 0, 1.0]); S = 0.55 * targ
tr = []
# the sky dome: meridians and altitude circles
for az in range(0, 360, 30):
    pts = np.array([unit(a, az) for a in range(0, 91, 3)]); tr.append(curve(pts, "#2c3352", 2))
for alt in (0, 30, 60):
    pts = np.array([unit(alt, a) for a in range(0, 361, 4)]); tr.append(curve(pts, "#5a6390" if alt == 0 else "#2c3352", 3 if alt == 0 else 2))
for txt, az in (("N", 0), ("E", 90), ("S", 180), ("W", 270)): tr.append(label(unit(0, az) * 1.12, txt, MUTED, 13))
tr.append(line(O, Z * 1.08, MUTED, 3)); tr.append(label(Z * 1.15, "zenith", MUTED, 12))
# Moon and target directions
tr.append(line(O, moon, GOLD, 3, "direction to the Moon", dash="dot", show=True)); tr.append(label(moon * 1.12, "Moon M", GOLD))
tr.append({"type": "scatter3d", "mode": "markers", "x": [moon[0]], "y": [moon[1]], "z": [moon[2]], "marker": {"size": 9, "color": GOLD}, "showlegend": False, "hoverinfo": "skip"})
tr.append(line(O, targ, BLUE, 6, "line of sight to the target", show=True)); tr.append(label(targ * 1.12, "target T", BLUE))
# moonlight arriving at S (parallel to OM) and scattered towards the observer
# moonlight: a parallel beam coming from the Moon, entering the atmosphere (the dome) and reaching S
def cone(p, d, color, size=0.09):
    return {"type": "cone", "x": [p[0]], "y": [p[1]], "z": [p[2]], "u": [d[0]], "v": [d[1]], "w": [d[2]], "sizemode": "absolute",
            "sizeref": size, "anchor": "tip", "colorscale": [[0, color], [1, color]], "showscale": False, "hoverinfo": "skip"}
t_in = -(S @ moon) + np.sqrt((S @ moon) ** 2 - (S @ S - 1))           # where the ray crosses the dome
entry = S + moon * t_in
start = S + moon * (t_in + 0.4)
side = np.cross(moon, [0, 0, 1.0]); side /= np.linalg.norm(side)
for k, off in enumerate((-0.16, 0.16)):                                   # two neighbouring rays of the same beam
    a, b = start + side * off, entry + side * off
    tr.append(line(a, b - moon * 0.25, "rgba(243,200,139,.45)", 3))
tr.append(line(start, entry, GOLD, 7, "moonlight entering the atmosphere", show=True))
tr.append(line(entry, S, GOLD, 7))
tr.append(cone((entry + S) / 2, -moon, GOLD, 0.07))
tr.append({"type": "scatter3d", "mode": "markers", "x": [entry[0]], "y": [entry[1]], "z": [entry[2]], "marker": {"size": 5, "color": GOLD, "symbol": "diamond"}, "showlegend": False, "hoverinfo": "skip"})
tr.append(label(start + np.array([0, 0, 0.08]), "moonlight", GOLD, 13))
tr.append(line(S, O, GREEN, 7, "scattered towards the observer", show=True)); tr.append(cone(S * 0.45, -S / np.linalg.norm(S), GREEN, 0.07))
tr.append({"type": "scatter3d", "mode": "markers+text", "x": [S[0]], "y": [S[1]], "z": [S[2]], "text": ["S"], "textposition": "top center",
           "textfont": {"color": GREEN, "size": 15}, "marker": {"size": 6, "color": GREEN}, "showlegend": False, "hoverinfo": "skip"})
tr.append({"type": "scatter3d", "mode": "markers+text", "x": [0], "y": [0], "z": [0], "text": ["O"], "textposition": "bottom center",
           "textfont": {"color": TEXT, "size": 15}, "marker": {"size": 6, "color": TEXT}, "showlegend": False, "hoverinfo": "skip"})
# angles: γ between Moon and target, θ (zenith distances)
g = slerp(moon, targ, r=0.42); tr.append(curve(g, VIOLET, 6, f"scattering angle γ = {gamma:.0f}°", show=True)); tr.append(label(g[len(g) // 2] * 1.22, "γ", VIOLET, 20))
th = slerp(Z, moon, r=0.62); tr.append(curve(th, GOLD, 3)); tr.append(label(th[len(th) // 2] * 1.18, "θ<sub>M</sub>", GOLD, 13))
th = slerp(Z, targ, r=0.75); tr.append(curve(th, BLUE, 3)); tr.append(label(th[len(th) // 2] * 1.15, "θ<sub>T</sub>", BLUE, 13))
n = np.cross(moon, targ); n = n if n[2] > 0 else -n; n = n / np.linalg.norm(n); eye = (n + np.array([0, 0, 0.35])); eye = eye / np.linalg.norm(eye) * 1.55
ax = {"visible": False, "range": [-1.3, 1.3]}
layout = {"scene": {"xaxis": ax, "yaxis": ax, "zaxis": {"visible": False, "range": [-0.05, 1.5]}, "aspectmode": "manual",
                    "aspectratio": {"x": 1, "y": 1, "z": 0.6}, "camera": {"eye": {"x": float(eye[0]), "y": float(eye[1]), "z": float(eye[2])}, "center": {"x": 0, "y": 0, "z": -0.05}}, "bgcolor": "rgba(0,0,0,0)"},
          "margin": {"l": 0, "r": 0, "t": 10, "b": 0}, "legend": {"y": 0.02, "yanchor": "bottom", "x": 0, "orientation": "v", "font": {"size": 12}}}
json.dump({"data": tr, "layout": layout}, open(OUT / "scattering-geometry-3d.json", "w"))
print("gamma", round(gamma, 1))
