"""
Helpers to make figures for the website from Python.

    from figures import dark_style, save_png, save_gif, save_plot_json

Three kinds of figure, all referenced from Markdown in content/<section>/:

1. Static image (matplotlib → PNG or SVG)
       save_png(fig, "content/physics/figures/my-plot.png")
       Markdown:  ![](figures/my-plot.png "Caption under the figure")

2. Animation (matplotlib FuncAnimation → GIF)
       save_gif(anim, "content/physics/figures/my-anim.gif", fps=20)
       Markdown:  ![](figures/my-anim.gif "Caption")

3. Interactive plot (zoom, hover values) — rendered by Plotly in the browser
       save_plot_json([{"x": x, "y": y, "name": "data", "mode": "markers"}],
                      {"xaxis": {"title": {"text": "t (s)"}}}, "content/physics/figures/my-plot.json")
       Markdown:
           ```plot
           {"src": "figures/my-plot.json", "caption": "Caption", "height": 400}
           ```
       If you already use the plotly Python package:  fig.write_json("content/physics/figures/my-plot.json")
"""
import json
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# Site colours (same as the :root variables in assets/css/style.css)
BG, PANEL, TEXT, MUTED = "#0a0c14", "#10131f", "#e8eaf4", "#9097b3"
BLUE, GOLD, VIOLET, GREEN = "#9fb4ff", "#f3c88b", "#c79bff", "#8fe3b0"


def dark_style():
    """Matplotlib style that matches the website."""
    plt.rcParams.update({
        "figure.facecolor": BG, "axes.facecolor": BG, "savefig.facecolor": BG,
        "axes.edgecolor": "#3a4166", "axes.labelcolor": TEXT, "text.color": TEXT,
        "xtick.color": MUTED, "ytick.color": MUTED, "grid.color": "#1e2440",
        "axes.grid": True, "grid.linewidth": 0.8, "axes.spines.top": False, "axes.spines.right": False,
        "axes.prop_cycle": matplotlib.cycler(color=[BLUE, GOLD, VIOLET, GREEN]),
        "font.size": 12, "axes.titlesize": 13, "legend.frameon": False, "lines.linewidth": 2.2,
    })


def save_png(fig, path, dpi=160):
    fig.savefig(path, dpi=dpi, bbox_inches="tight")
    plt.close(fig)


def save_gif(anim, path, fps=20, dpi=90):
    from matplotlib.animation import PillowWriter
    anim.save(path, writer=PillowWriter(fps=fps), dpi=dpi)
    plt.close(anim._fig)


def _clean(v):
    if isinstance(v, np.ndarray):
        return np.round(v.astype(float), 6).tolist()
    if isinstance(v, (np.floating, np.integer)):
        return float(v)
    if isinstance(v, dict):
        return {k: _clean(x) for k, x in v.items()}
    if isinstance(v, (list, tuple)):
        return [_clean(x) for x in v]
    return v


def save_plot_json(traces, layout, path):
    """traces: list of Plotly trace dicts (numpy arrays are fine). layout: Plotly layout dict."""
    with open(path, "w") as f:
        json.dump({"data": _clean(traces), "layout": _clean(layout)}, f, separators=(",", ":"))
