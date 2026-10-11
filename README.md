# Beatriz Pereira · physics, astrophysics & science communication

A dark, astronomy-themed site with the menu on top and one long page to scroll through.
Plain HTML/CSS/JS, so it runs on GitHub Pages with no build step.

| Section | What it is | Edit in |
|---|---|---|
| **01 · Me & my work** | Bio, timeline (Journey → Now → Roadmap), projects | `index.html` (bio), `data/timeline.json`, `data/projects.json` |
| **02 · Research** | Featured paper, publications & talks, posters, and lessons/overviews | `data/publications.json`, `assets/img/posters/`, `content/research/` |
| **03 · Sky Lab** | The paper's models (single + multiple scattering) for any date/site, FORS2 fields and data | `assets/js/skylab.js`, `data/paranal-observations.json` |
| **04 · Physics, step by step** | The book: chapters by level, with exercises, plots, GIFs | `content/physics/` |
| **Contact** | Links + Patreon | `data/site.json` |

Chapters and research notes open in `read.html` (e.g. `read.html?c=physics&s=projectile-motion`),
with a table of contents, previous/next links and shareable URLs.

## Before publishing
- `data/site.json`: replace the `YOUR-…` placeholders (LinkedIn, GitHub, ORCID, Patreon).
- `data/timeline.json`: replace every `YYYY` and the "replace" places with your real dates and institutions; check the roadmap dates.
- **Your photo:** put it in `assets/img/` (e.g. `portrait.jpg`, square, face centred, about 800×800 px) and set
  `"portrait": "assets/img/portrait.jpg"` in `data/site.json`. It appears in the orbit circle in the hero;
  until then the BP monogram shows there.

## Logo
- `assets/img/logo.png`: your BP monogram recoloured for the dark site (the black shadow is now gold). Used in the top bar and hero.
- `assets/img/favicon.png` and `apple-touch-icon.png`: browser tab and phone home-screen icons.
- `assets/img/logo-original.webp`: your original file, untouched.

## Writing a chapter or research note
1. Write `content/physics/<slug>.md` (start from `content/physics/_template.md`).
2. Add it to `content/physics/index.json` inside the right level. Chapters with `"status": "soon"` show greyed out.
   Remove that line when the chapter is ready.
3. Research notes work the same way in `content/research/` (`"kind"`: `Topic`, `Paper overview` or `Story`;
   paper overviews take a `"paper"` block with title, authors, venue, year, url).

Inside the Markdown you can use:

| What | How |
|---|---|
| Maths | `$E = mc^2$` inline, `$$ ... $$` for a displayed equation (LaTeX, rendered with KaTeX) |
| Image or GIF | `![alt text](figures/file.gif "Caption shown under it")` |
| Interactive plot from Python | ` ```plot ` then `{"src": "figures/file.json", "caption": "…", "height": 400}` then ` ``` ` |
| Quick function plot | ` ```plot ` then `{"fn": [{"y": "sin(x)", "name": "sin x"}], "x": [0, 6.28]}` then ` ``` ` |
| Exercise with hidden solution | `:::exercise Title` … `:::solution` … `:::` … `:::` |
| Note / warning box | `:::note Title` … `:::`  or  `:::warning Title` … `:::` |
| Tables, lists, bold, links, code | normal Markdown |

## Figures from Python
`tools/figures.py` has helpers that match the site's colours:

```python
import sys; sys.path.append("tools")
from figures import dark_style, save_png, save_gif, save_plot_json
dark_style()                                          # matplotlib in the site's dark style
save_png(fig, "content/physics/figures/x.png")        # static plot
save_gif(anim, "content/physics/figures/x.gif")       # FuncAnimation → GIF
save_plot_json(traces, layout, "content/physics/figures/x.json")  # interactive (Plotly format)
```

If you use the `plotly` package, `fig.write_json("content/physics/figures/x.json")` also works.
`tools/make_sample_figures.py` builds all the example figures, so it's a working reference.

## Run it locally
Browsers block loading files from a double-clicked page, so start a small server:

```bash
cd site
python -m http.server 8000
# open http://localhost:8000
```

## Publish on GitHub Pages
1. Create a repository named **`beatrizpereira222.github.io`** (site at `https://beatrizpereira222.github.io`).
2. Upload the contents of this folder to the repository root, so `index.html` is at the top level.
3. Repository → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `/ (root)` → Save.
4. Wait a minute or two, then visit the URL.

Libraries (marked for Markdown, KaTeX for maths, Plotly for plots) are bundled in `assets/vendor/`,
so nothing depends on outside services. Plotly only downloads on pages that contain a plot.

## Sky Lab details
Four steps, following the paper and its analysis code:
1. **Rayleigh:** `p = sin²γ/(1+cos²γ)`.
2. **Rayleigh variations:** `A(λ)·Rayleigh` with A = 0.64, 0.614, 0.555, 0.316 (`par_wave_val`, art_sun.py), or
   depolarisation `sin²γ/((1+P)/(1−P)+cos²γ)` (art_dep.py), with P presets fitted to the clear-night data.
3. **Multiple scattering:** Berry et al. (2004), `A(λ)·|w(ξ)|`, written with (1 + ξ ξ±*) so the angle is right.
4. **Rayleigh + Mie + unpolarised MS:** tables in `data/scatter-tables.json`, built by `tools/build_scatter_tables.py`
   with `mie_size_dist` (4 Jones+13 species, Table 4 refractive indices).
- Twilight (any step): Moon only while the Sun is below −18°; above that, normalised Stokes vectors mixed with weight par·albedo (art_sun.py).
- Angle of polarisation shown in the convention of `rotation_angles()` (χ = β′ − 90°).
- Data: `data/paranal-observations.json`, from `moonlit_data.csv` (conditions ok / clouds / sun).
- Sun/Moon positions: Astronomy Engine; scattering angles reproduce the tables to better than 1°.
