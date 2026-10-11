/* Homepage: fills each section from the files in data/ and content/. */
(function () {
  const { $, $$, esc, getJSON, fmtDate, tags, settings, watchReveals, readLink } = Site;

  /* ---------- Highlight the menu item for the section in view ---------- */
  const links = $$("#nav a[data-section]");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.dataset.section === e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => spy.observe(s));

  const fail = (sel, what) => () => {
    $(sel).innerHTML = `<p class="muted">Couldn't load ${what}. If you opened index.html by double-clicking it,
      run <code>python -m http.server</code> in the site folder and visit <code>http://localhost:8000</code>.</p>`;
  };

  /* ---------- Hero rotator + contact ---------- */
  settings.then((site) => {
    if (site.portrait) {
      const img = new Image();
      img.className = "photo"; img.alt = site.name || "";
      img.onload = () => { const d = $("#portraitDisc"); d.innerHTML = ""; d.appendChild(img); };
      img.src = site.portrait;
    }
    const el = $("#rotator"), words = site.rotatorWords || [];
    if (el && words.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      let i = 0;
      setInterval(() => {
        el.classList.add("out");
        setTimeout(() => { i = (i + 1) % words.length; el.textContent = words[i]; el.classList.remove("out"); }, 350);
      }, 2800);
    }
    if ($("#contactLinks")) $("#contactLinks").innerHTML = (site.contact || []).map((c) => `
      <a href="${esc(c.url)}"${c.url.startsWith("mailto:") ? "" : ' target="_blank" rel="noopener"'}>
        <span aria-hidden="true">${esc(c.icon || "↗")}</span>
        <span>${esc(c.label)} <span class="mono">${esc(c.detail || "")}</span></span>
      </a>`).join("");
    if ($(".patron")) { if (site.patreon) $("#patreonLink").href = site.patreon; else $(".patron").remove(); }
  });

  /* ---------- 01 · Timeline: the past, now, and the plan ---------- */
  if ($("#timeline")) getJSON("data/timeline.json").then((items) => {
    items.forEach((x, i) => (x._id = "tl-" + i));

    /* Education box */
    if ($("#education")) {
      const edu = items.filter((x) => x.lane === "education");
      $("#education").innerHTML = edu.map((x) => `
        <article class="card edu reveal">
          <span class="mono when">${esc(x.when)}</span>
          <h4>${esc(x.title)}</h4>
          ${x.where ? `<p class="where mono">${esc(x.where)}</p>` : ""}
          ${x.text ? `<p>${esc(x.text)}</p>` : ""}
        </article>`).join("");
      watchReveals($("#education"));
    }

    /* Lanes: everything on one time axis, so overlaps are visible */
    if ($("#lanes")) {
      const LANES = [["education", "Education"], ["work", "Work"], ["research", "Research"], ["teaching", "Teaching & outreach"]];
      const now = new Date().getFullYear() + (new Date().getMonth() + 0.5) / 12;
      const Y0 = 2014, Y1 = now + 0.95;
      // recent years get more room, since more is happening at once
      const wgt = (y) => (y < 2022.5 ? 1 : 2.8);
      const cum = (y) => { let s = 0; for (let a = Y0; a < y; a += 0.05) s += wgt(a) * Math.min(0.05, y - a); return s; };
      const TOT = cum(Y1);
      const pos = (y) => (cum(Math.max(Y0, Math.min(Y1, y))) / TOT) * 100;
      const years = []; for (let y = Y0; y <= Math.floor(Y1); y++) years.push(y);
      const rows = LANES.map(([key, label]) => {
        const its = items.filter((x) => x.lane === key && !x.planned && (x.start != null || x.at != null));
        // stack overlapping bars into sub-rows
        const tracks = [];
        its.filter((x) => x.start != null).sort((p, q) => p.start - q.start).forEach((x) => {
          const end = x.end === "now" ? now : x.end;
          let t = tracks.findIndex((tr) => tr <= x.start + 1e-6);
          if (t < 0) { tracks.push(end); t = tracks.length - 1; } else tracks[t] = end;
          x._track = t; x._end = end;
        });
        const nTracks = Math.max(1, tracks.length);
        const bars = its.filter((x) => x.start != null).map((x) => `
          <button class="lane-bar ${x.status}${x.planned ? " planned" : ""}" data-id="${x._id}" style="left:${pos(x.start)}%;width:${Math.max(0.8, pos(x._end) - pos(x.start))}%;top:${8 + x._track * 30}px"
            aria-label="${esc(x.title)}, ${esc(x.when)}"><span>${esc(x.short || x.title)}</span>${x.end === "now" ? '<i class="arrow"></i>' : ""}</button>`).join("");
        const dots = its.filter((x) => x.at != null).sort((p, q) => p.at - q.at).map((x, k) => `
          <button class="lane-dot ${x.status}" data-id="${x._id}" style="left:${pos(x.at)}%;top:${8 + nTracks * 30}px" aria-label="${esc(x.title)}, ${esc(x.when)}"></button>
          <span class="lane-dot-label" style="left:${pos(x.at)}%;top:${8 + nTracks * 30 + 18 + (k % 2) * 15}px">${esc(x.short || x.title)}</span>`).join("");
        const hasDots = its.some((x) => x.at != null);
        const h = 16 + nTracks * 30 + (hasDots ? 56 : 0);
        return `<div class="lane ${key}"><div class="lane-label mono">${label}</div><div class="lane-track" style="height:${h}px">${bars}${dots}</div></div>`;
      }).join("");
      const axis = `<div class="lane axis"><div class="lane-label"></div><div class="lane-track axis-track">${years.map((y) => `<span style="left:${pos(y)}%">${y}</span>`).join("")}
        <span class="now-mark" style="left:${pos(now)}%">now</span></div></div>`;
      $("#lanes").innerHTML = `<div class="grid-lines">${years.map((y) => `<i style="left:${pos(y)}%"></i>`).join("")}<i class="now-line" style="left:${pos(now)}%"></i></div>` + rows + axis;
      const tip = $("#laneTip"), byId = Object.fromEntries(items.map((x) => [x._id, x]));
      const show = (el) => {
        const x = byId[el.dataset.id]; if (!x) return;
        tip.innerHTML = `<b>${esc(x.title)}</b><span>${esc(x.when)}${x.where ? " · " + esc(x.where) : ""}</span>`;
        tip.hidden = false;
        const r = el.getBoundingClientRect(), w = tip.offsetWidth;
        tip.style.left = Math.min(innerWidth - w - 12, Math.max(12, r.left + r.width / 2 - w / 2)) + "px";
        tip.style.top = (r.top + scrollY - tip.offsetHeight - 10) + "px";
      };
      $("#lanes").addEventListener("mouseover", (e) => { const b = e.target.closest("[data-id]"); if (b) show(b); });
      $("#lanes").addEventListener("mouseout", (e) => { if (e.target.closest("[data-id]")) tip.hidden = true; });
      $("#lanes").addEventListener("click", (e) => {
        const b = e.target.closest("[data-id]"); if (!b) return; show(b);
      });
    }

    /* One detail panel under the chart instead of a second timeline */
    const STAT = { done: "Done", now: "Now", next: "Planned" };
    const detail = (x) => {
      if (!$("#laneDetail") || !x) return;
      $("#laneDetail").className = `lane-detail ${x.status} in`;
      $("#laneDetail").innerHTML = `
        <div class="ld-top"><span class="mono when">${esc(x.when)}</span><span class="status ${x.status === "next" ? "idea" : x.status === "now" ? "ongoing" : "done"}">${STAT[x.status] || ""}</span></div>
        <h4>${esc(x.title)}</h4>
        ${x.where ? `<p class="where mono">${esc(x.where)}</p>` : ""}
        ${x.text ? `<p>${esc(x.text)}</p>` : ""}
        ${x.link ? `<a href="${esc(x.link.url)}">${esc(x.link.label)} →</a>` : ""}`;
      $$("#lanes [data-id]").forEach((el) => el.classList.toggle("sel", el.dataset.id === x._id));
    };
    if ($("#lanes")) {
      const byId = Object.fromEntries(items.map((x) => [x._id, x]));
      $("#lanes").addEventListener("click", (e) => { const b = e.target.closest("[data-id]"); if (b) detail(byId[b.dataset.id]); });
      detail(items.find((x) => x.title.startsWith("First-author")) || items.find((x) => x.status === "now"));
    }

    /* What's next: plans live in their own box, not on the chart */
    if ($("#nextList")) {
      $("#nextList").innerHTML = items.filter((x) => x.status === "next").map((x) => `
        <article class="card next-card reveal">
          ${x.when ? `<span class="mono when">${esc(x.when)}</span>` : ""}
          <h4>${esc(x.title)}</h4>
          ${x.text ? `<p>${esc(x.text)}</p>` : ""}
        </article>`).join("");
      watchReveals($("#nextList"));
    }
  }).catch(fail("#timeline", "the timeline"));

  /* ---------- 01 · Projects ---------- */
  const STATUS = { ongoing: "Ongoing", paused: "Paused", done: "Done", idea: "Planned" };
  if ($("#projectList")) getJSON("data/projects.json").then((items) => {
    $("#projectList").innerHTML = items.map((p) => `
      <article class="card reveal">
        <div class="project-meta">
          <span class="mono muted">${esc(p.type || "")}</span>
          ${p.status ? `<span class="status ${esc(p.status)}">${esc(STATUS[p.status] || p.status)}</span>` : ""}
        </div>
        <h3>${esc(p.title)}</h3>
        ${p.note ? `<p class="project-note">★ ${esc(p.note)}</p>` : ""}
        <p>${esc(p.description)}</p>
        ${tags(p.tags)}
        ${p.url ? `<p style="margin:16px 0 0"><a class="more" href="${esc(p.url)}"${/^https?:/.test(p.url) ? ' target="_blank" rel="noopener"' : ""}>${esc(p.linkLabel || "Learn more")} →</a></p>` : ""}
      </article>`).join("");
    watchReveals($("#projectList"));
  }).catch(fail("#projectList", "projects"));


  /* ---------- 02 · Publications, talks and posters ---------- */
  if ($("#featuredPaper")) getJSON("data/publications.json").then((pub) => {
    const f = pub.featured;
    $("#featuredPaper").innerHTML = `
      <div class="paper-badge mono">${esc(f.role)} · ${esc(f.venue)} · ${esc(f.year)}</div>
      <h3>${esc(f.title)}</h3>
      <p class="paper-authors">${esc(f.authors).replace("B. Pereira", "<strong>B. Pereira</strong>")}</p>
      <p>${esc(f.summary)}</p>
      <div class="hero-actions">
        <a class="btn" href="${esc(f.overview)}">Read the overview</a>
        <a class="btn btn-ghost" href="https://doi.org/${esc(f.doi)}" target="_blank" rel="noopener">Paper (A&amp;A) ↗</a>
        <a class="btn btn-ghost" href="https://arxiv.org/abs/${esc(f.arxiv)}" target="_blank" rel="noopener">arXiv ↗</a>
      </div>`;
    const outputs = [
      ...pub.items.map((it) => ({ ...it })),
      ...pub.posters.map((p, i) => ({ kind: "Poster", role: "Poster", year: p.year, title: p.title, venue: p.event, text: p.text, poster: i })),
    ].sort((x, y) => (+y.year) - (+x.year));
    const author = (s) => esc(s).replace("B. Pereira", "<strong>B. Pereira</strong>");
    $("#pubList").innerHTML = outputs.map((it) => {
      const isPoster = it.poster !== undefined;
      const title = isPoster
        ? `<button class="pub-open" data-i="${it.poster}">${esc(it.title)} <span class="pub-view">View poster ⤢</span></button>`
        : it.url ? `<a href="${esc(it.url)}" target="_blank" rel="noopener">${esc(it.title)} ↗</a>` : esc(it.title);
      return `
      <li>
        <span class="mono pub-year">${esc(it.year)}</span>
        <div>
          <span class="pub-kind mono">${esc(it.role || it.kind)}</span>
          <p class="pub-title">${title}</p>
          ${it.authors ? `<p class="pub-meta">${author(it.authors)}</p>` : ""}
          <p class="pub-meta mono">${esc(it.venue)}</p>
          ${it.text ? `<p class="pub-meta">${esc(it.text)}</p>` : ""}
        </div>
      </li>`;
    }).join("");
    const lb = $("#lightbox"), lbImg = $("#lightboxImg");
    $("#pubList").addEventListener("click", (e) => {
      const b = e.target.closest("[data-i]"); if (!b) return;
      const p = pub.posters[+b.dataset.i];
      lbImg.src = p.image; lbImg.alt = p.title; $("#lightboxCap").textContent = `${p.title} · ${p.event} ${p.year}`;
      lb.hidden = false; document.body.style.overflow = "hidden"; $("#lightboxClose").focus();
    });
    const close = () => { lb.hidden = true; document.body.style.overflow = ""; };
    $("#lightboxClose").addEventListener("click", close);
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) close(); });
    watchReveals($("#publications"));
  }).catch(fail("#featuredPaper", "publications"));

  /* ---------- 02 · Research explained ---------- */
  const KIND_GLYPH = { "Topic": "◎", "Paper overview": "❡", "Story": "✦" };
  if ($("#researchList")) getJSON("content/research/index.json").then((items) => {
    items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const limit = +$("#researchList").dataset.limit || 0;
    if (limit) items = items.slice(0, limit);
    const card = (n) => `
      <a class="note reveal" data-kind="${esc(n.kind)}" href="${readLink("research", n.slug)}">
        <div class="note-top">
          <span class="note-kind mono"><span aria-hidden="true">${KIND_GLYPH[n.kind] || "✦"}</span> ${esc(n.kind)}</span>
          <span class="mono muted">${fmtDate(n.date)}</span>
        </div>
        <h3>${esc(n.title)}</h3>
        <p>${esc(n.summary)}</p>
        ${n.paper ? `<p class="note-paper mono">${esc(n.paper.authors)} · ${esc(n.paper.year)}</p>` : ""}
        ${tags(n.tags)}
      </a>`;
    $("#researchList").innerHTML = items.map(card).join("");
    const kinds = ["All", ...new Set(items.map((n) => n.kind))];
    const f = $("#researchFilters");
    if (f && kinds.length <= 2) f.remove();
    else if (f) {
    f.innerHTML = kinds.map((k, i) => `<button role="tab" aria-selected="${!i}" class="${i ? "" : "on"}" data-kind="${esc(k)}">${esc(k === "All" ? k : k === "Story" ? "Stories" : k + "s")}</button>`).join("");
    f.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      $$("button", f).forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); });
      $$(".note", $("#researchList")).forEach((n) => {
        const show = b.dataset.kind === "All" || n.dataset.kind === b.dataset.kind;
        n.hidden = !show; if (show) n.classList.add("in");
      });
    });
    }
    watchReveals($("#researchList"));
  }).catch(fail("#researchList", "research notes"));

  /* ---------- 04 · Physics book ---------- */
  if ($("#book")) getJSON("content/physics/index.json").then((book) => {
    if (book.intro && $("#bookLede")) $("#bookLede").textContent = book.intro;
    if ($("#exerciseIndex")) renderExercises(book);
    $("#book").innerHTML = book.levels.map((lv) => `
      <div class="level reveal${lv.chapters.length ? "" : " is-soon"}" style="--lv:${lv.number}">
        <div class="level-head">
          <span class="level-n mono">Topic ${lv.number}</span>
          <h3>${esc(lv.name)}</h3>
          <p>${esc(lv.blurb || "")}</p>
        </div>
        ${lv.chapters.length ? `<ol class="chapters">
          ${lv.chapters.map((ch, i) => {
            const n = `${lv.number}.${i + 1}`;
            const extras = [ch.exercises ? `${ch.exercises} exercises` : "", ch.media ? ch.media : ""].filter(Boolean).join(" · ");
            const inner = `<span class="ch-n mono">${n}</span>
              <span class="ch-body"><span class="ch-title">${esc(ch.title)}</span>
              ${ch.summary ? `<span class="ch-sum">${esc(ch.summary)}</span>` : ""}
              ${extras ? `<span class="ch-extra mono">${esc(extras)}</span>` : ""}</span>
              ${ch.status === "soon" ? `<span class="ch-soon mono">Soon</span>` : `<span class="ch-go" aria-hidden="true">→</span>`}`;
            return `<li>${ch.status === "soon" ? `<div class="ch soon">${inner}</div>` : `<a class="ch" href="${readLink("physics", ch.slug)}">${inner}</a>`}</li>`;
          }).join("")}
        </ol>` : `<p class="level-soon mono">Coming soon</p>`}
      </div>`).join("");
    watchReveals($("#book"));
  }).catch(fail("#book", "the chapters"));

  /* ---------- Physics page: every exercise, chapter by chapter ---------- */
  async function renderExercises(book) {
    const box = $("#exerciseIndex");
    const chapters = book.levels.flatMap((lv) => lv.chapters.map((ch, i) => ({ ...ch, num: `${lv.number}.${i + 1}`, level: lv.name })))
      .filter((ch) => ch.status !== "soon");
    const blocks = await Promise.all(chapters.map(async (ch) => {
      let md = "";
      try { md = await fetch(`content/physics/${ch.slug}.md`).then((r) => (r.ok ? r.text() : "")); } catch (_) {}
      const ex = [...md.matchAll(/^:::exercise\s*(.*)$/gm)].map((m, i) => ({ n: i + 1, title: m[1].trim() || `Exercise ${i + 1}` }));
      return { ch, ex };
    }));
    box.innerHTML = blocks.filter((b) => b.ex.length).map(({ ch, ex }) => `
      <div class="ex-group reveal">
        <a class="ex-chapter" href="${readLink("physics", ch.slug)}"><span class="mono">${esc(ch.num)} · ${esc(ch.level)}</span>${esc(ch.title)}</a>
        <ol class="ex-list">${ex.map((e) => `<li><a href="${readLink("physics", ch.slug)}#exercise-${e.n}"><span class="mono">${e.n}</span>${esc(e.title)}</a></li>`).join("")}</ol>
      </div>`).join("") || '<p class="muted">Exercises will appear here as chapters are published.</p>';
    watchReveals(box);
  }
})();
