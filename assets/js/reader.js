/* Reader for book chapters and research notes.
   URL: read.html?c=<collection>&s=<slug>   e.g. read.html?c=physics&s=motion-in-one-dimension
   Markdown lives in content/<collection>/<slug>.md and can contain:
     $inline$ and $$display$$ maths (KaTeX)
     ```plot  {Plotly JSON}  ```   or   ```plot {"src": "figures/my-plot.json"} ```
     ![caption](figures/image.png "caption")  → figure with caption (PNG, SVG, GIF all work)
     :::exercise Title / :::solution / :::    and   :::note Title / :::
*/
(async function () {
  const { $, $$, esc, getJSON, fmtDate, tags, readLink } = Site;
  const params = new URLSearchParams(location.search);
  const coll = (params.get("c") || "").replace(/[^a-z0-9-]/gi, "");
  const slug = (params.get("s") || "").replace(/[^a-z0-9-]/gi, "");
  const base = `content/${coll}/`;
  const main = $("#doc"), head = $("#docHead"), tocEl = $("#toc"), pager = $("#pager");

  const SECTIONS = {
    physics: { name: "Physics", anchor: "physics", page: "physics.html" },
    research: { name: "Research", anchor: "research", page: "research.html" },
  };
  const section = SECTIONS[coll];
  const fail = (msg) => { head.innerHTML = `<h1>Lost in space</h1>`; main.innerHTML = `<p>${msg} <a href="index.html">Back to the homepage</a>.</p>`; };
  if (!section || !slug) return fail("This page doesn't exist.");
  $$(`#nav a[href="${section.page}"]`).forEach((a) => a.classList.add("active"));

  // ---------- Find the entry and its neighbours ----------
  let index;
  try { index = await getJSON(base + "index.json"); } catch (e) { return fail("Couldn't load the contents (are you running a local server?)."); }
  const list = coll === "physics"
    ? index.levels.flatMap((lv) => lv.chapters.map((ch, i) => ({ ...ch, level: lv.name, levelId: lv.id, num: `${lv.number}.${i + 1}` })))
    : index;
  const ready = list.filter((x) => x.status !== "soon");
  const pos = ready.findIndex((x) => x.slug === slug);
  const item = ready[pos];
  if (!item) return fail("This page is still being written.");

  document.title = `${item.title} · Beatriz Pereira`;
  const crumb = coll === "physics" ? `${section.name} · ${item.level}` : `${section.name} · ${item.kind || ""}`;
  $("#crumb").innerHTML = `<a href="${section.page}">← ${esc(crumb)}</a>`;

  // ---------- Load the Markdown ----------
  let src;
  try { const r = await fetch(base + slug + ".md"); if (!r.ok) throw 0; src = await r.text(); }
  catch (_) { return fail("Couldn't load this page."); }

  const html = render(src);
  const words = src.replace(/```[\s\S]*?```/g, "").split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 220));

  head.innerHTML = `
    <p class="eyebrow mono">${coll === "physics" ? `Chapter ${esc(item.num)} · ${esc(item.level)}` : esc(item.kind || "")}</p>
    <h1>${esc(item.title)}</h1>
    ${item.summary ? `<p class="doc-lede">${esc(item.summary)}</p>` : ""}
    <p class="mono muted">${item.date ? fmtDate(item.date) + " · " : ""}${mins} min read</p>
    ${tags(item.tags)}
    ${item.paper ? paperCard(item.paper) : ""}`;
  main.innerHTML = html;

  // ---------- Table of contents ----------
  const hs = $$("h2, h3", main);
  if (hs.length > 1) {
    tocEl.innerHTML = `<p class="mono muted">On this page</p>` + hs.map((h) =>
      `<a href="#${h.id}" class="lvl-${h.tagName[1]}">${esc(h.textContent)}</a>`).join("");
    const links = $$("a", tocEl);
    const spy = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-20% 0px -70% 0px" });
    hs.forEach((h) => spy.observe(h));
  } else tocEl.remove();

  // ---------- Previous / next ----------
  const prev = ready[pos - 1], next = ready[pos + 1];
  const card = (x, dir) => x ? `<a class="pager-${dir}" href="${readLink(coll, x.slug)}">
      <span class="mono muted">${dir === "prev" ? "← Previous" : "Next →"}</span><span>${esc(x.title)}</span></a>` : "<span></span>";
  pager.innerHTML = card(prev, "prev") + card(next, "next");

  await renderPlots();
  await renderSkySims();
  if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }

  // =====================================================================
  function render(md) {
    // 1. Keep fenced code out of the maths step
    const parts = md.split(/(```[\s\S]*?```)/g);
    const maths = [];
    const stash = (tex, display) => { maths.push({ tex, display }); return `@@MATH${maths.length - 1}@@`; };
    md = parts.map((p, i) => {
      if (i % 2) return p;
      return p
        .replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => `\n\n${stash(t, true)}\n\n`)
        .replace(/(^|[^\\$])\$(?!\s)([^$\n]+?)(?<!\s)\$/g, (_, pre, t) => pre + stash(t, false));
    }).join("");

    // 2. ::: containers (exercise, solution, note)
    const stack = []; let exN = 0;
    md = md.split("\n").map((line) => {
      const m = line.match(/^:::\s*(exercise|solution|note|warning|grid|card)?\s*(.*)$/);
      if (!m) return line;
      const [, kind, title] = m;
      if (!kind) { const k = stack.pop(); return k === "solution" ? "\n</details>\n" : k ? "\n</div>\n" : line; }
      stack.push(kind);
      if (kind === "exercise") { exN++; return `\n<div class="box exercise" id="exercise-${exN}"><p class="box-title mono">Exercise ${exN}${title ? " · " + esc(title) : ""}</p>\n`; }
      if (kind === "solution") return `\n<details class="solution"><summary>${esc(title || "Show solution")}</summary>\n`;
      if (kind === "grid") return `\n<div class="card-grid">\n\n`;
      if (kind === "card") return `\n<div class="box mcard${/\+/.test(title) ? " win" : ""}"><p class="box-title mono">${esc(title)}</p>\n\n`;
      return `\n<div class="box ${kind}"><p class="box-title mono">${esc(title || (kind === "note" ? "Note" : "Careful"))}</p>\n`;
    }).join("\n");
    while (stack.length) md += stack.pop() === "solution" ? "\n</details>\n" : "\n</div>\n";

    // 3. Markdown → HTML with a few custom renderers
    const used = {};
    marked.use({
      renderer: {
        code(code, lang) {
          if ((lang || "").trim() === "plot") return `<figure class="plot-fig"><div class="plot" data-spec="${esc(code)}"></div></figure>`;
          if ((lang || "").trim() === "skysim") {
            let cap = ""; try { cap = JSON.parse(code).caption || ""; } catch (_) {}
            return `<figure class="skysim-fig"><div class="skysim" data-spec="${esc(code)}"></div>${cap ? `<figcaption>${esc(cap)}</figcaption>` : ""}</figure>`;
          }
          return false;
        },
        image(href, title, text) {
          const src = /^(https?:|\/|data:)/.test(href) ? href : base + href;
          const img = `<img src="${esc(src)}" alt="${esc(text)}" loading="lazy">`;
          const cap = title ? unescapeHtml(title) : "";
          return `<figure>${img}${cap ? `<figcaption>${esc(cap)}</figcaption>` : ""}</figure>`;
        },
        heading(text, level, raw) {
          let id = raw.toLowerCase().replace(/@@math\d+@@/g, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") || "section";
          if (used[id]) id += "-" + ++used[id]; else used[id] = 1;
          return `<h${level} id="${id}">${text}</h${level}>`;
        },
      },
    });
    let out = marked.parse(md);

    // 4. Put the maths back, typeset with KaTeX
    out = out.replace(/(<p>)?@@MATH(\d+)@@(<\/p>)?/g, (all, p1, n, p2) => {
      const { tex, display } = maths[+n];
      let h;
      try { h = katex.renderToString(unescapeHtml(tex).replace(/°/g, '^{\\circ}'), { displayMode: display, throwOnError: false }); }
      catch (_) { h = `<code>${esc(tex)}</code>`; }
      if (display) return `<div class="math-display">${h}</div>`;
      return (p1 || "") + h + (p2 || "");
    });
    return out;
  }

  function unescapeHtml(s) { const t = document.createElement("textarea"); t.innerHTML = s; return t.value; }

  function paperCard(p) {
    return `<div class="paper-cta">
      <div class="paper-cta-text">
        <span class="mono muted">${esc(p.venue)}${p.year ? " · " + esc(p.year) : ""}</span>
        <strong>${esc(p.title)}</strong>
        <span class="muted">${esc(p.authors)}</span>
      </div>
      <div class="paper-cta-links">
        ${p.url ? `<a class="btn" href="${esc(p.url)}" target="_blank" rel="noopener">Read the paper ↗</a>` : ""}
        ${p.arxiv ? `<a class="btn btn-ghost" href="https://arxiv.org/abs/${esc(p.arxiv)}" target="_blank" rel="noopener">arXiv ↗</a>` : ""}
      </div>
    </div>`;
  }

  // ---------- Sky polarisation simulators (script only downloaded if the page has one) ----------
  async function renderSkySims() {
    const boxes = $$(".skysim", main);
    if (!boxes.length) return;
    if (!window.SkySim) await new Promise((ok, no) => { const s = document.createElement("script"); s.src = "assets/js/skysim.js"; s.onload = ok; s.onerror = no; document.head.appendChild(s); })
      .catch(() => boxes.forEach((b) => (b.textContent = "Couldn't load the sky simulator.")));
    if (!window.SkySim) return;
    for (const box of boxes) {
      try { SkySim.mount(box, JSON.parse(box.dataset.spec), base); }
      catch (e) { box.textContent = "Couldn't draw this simulation."; console.error(e); }
    }
  }

  // ---------- Interactive plots (Plotly is only downloaded if the page has one) ----------
  async function renderPlots() {
    const boxes = $$(".plot", main);
    if (!boxes.length) return;
    await new Promise((ok, no) => { const s = document.createElement("script"); s.src = "assets/vendor/plotly.min.js"; s.onload = ok; s.onerror = no; document.head.appendChild(s); })
      .catch(() => boxes.forEach((b) => (b.textContent = "Couldn't load the plotting library.")));
    if (!window.Plotly) return;
    const css = getComputedStyle(document.documentElement);
    const c = (v) => css.getPropertyValue(v).trim();
    const theme = {
      paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)",
      font: { family: "Space Grotesk, system-ui, sans-serif", color: c("--text"), size: 13 },
      colorway: [c("--accent"), c("--accent-2"), c("--accent-3"), "#8fe3b0", "#ff9fb2"],
      margin: { l: 56, r: 20, t: 48, b: 52 },
      xaxis: { gridcolor: "rgba(160,175,255,.12)", zerolinecolor: "rgba(160,175,255,.3)", linecolor: "rgba(160,175,255,.3)" },
      yaxis: { gridcolor: "rgba(160,175,255,.12)", zerolinecolor: "rgba(160,175,255,.3)", linecolor: "rgba(160,175,255,.3)" },
      legend: { bgcolor: "rgba(0,0,0,0)", orientation: "h", x: 0, xanchor: "left", y: 1.02, yanchor: "bottom" },
      hoverlabel: { bgcolor: c("--panel-solid"), bordercolor: c("--line-strong"), font: { color: c("--text") } },
    };
    const merge = (a, b) => { for (const k in b) a[k] = b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) ? merge(a[k] && typeof a[k] === "object" ? a[k] : {}, b[k]) : b[k]; return a; };
    for (const box of boxes) {
      try {
        let spec = JSON.parse(box.dataset.spec);
        if (spec.src) spec = { ...(await getJSON(base + spec.src)), caption: spec.caption, height: spec.height };
        if (spec.fn) spec = fromFunctions(spec);
        const layout = merge(merge({}, theme), spec.layout || {});
        box.style.height = (spec.height || 380) + "px";
        await Plotly.newPlot(box, spec.data, layout, { responsive: true, displaylogo: false, modeBarButtonsToRemove: ["lasso2d", "select2d"] });
        if (spec.caption) box.insertAdjacentHTML("afterend", `<figcaption>${esc(spec.caption)}</figcaption>`);
      } catch (e) {
        box.innerHTML = `<p class="muted">Plot error: ${esc(e.message)}</p>`;
      }
    }
  }

  /* Quick function plots without Python:
     {"fn": [{"y": "Math.sin(x)", "name": "sin x"}], "x": [0, 6.28], "layout": {...}} */
  function fromFunctions(spec) {
    const [a, b] = spec.x || [0, 10], n = spec.samples || 300;
    const xs = Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
    const data = spec.fn.map((f) => {
      const g = new Function("x", "with (Math) { return " + f.y + "; }");
      return { x: xs, y: xs.map((x) => g(x)), name: f.name || f.y, mode: "lines", line: { width: 2.5, dash: f.dash } };
    });
    return { data, layout: spec.layout, caption: spec.caption, height: spec.height };
  }
})();
