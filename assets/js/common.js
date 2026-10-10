/* Shared by every page: top menu, scroll progress, mobile menu, logo, footer year. */
window.Site = (function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const getJSON = (p) => fetch(p).then((r) => { if (!r.ok) throw new Error(p + " " + r.status); return r.json(); });
  const fmtDate = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
  const tags = (list) => (list && list.length ? `<ul class="tags">${list.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "");

  const topbar = $("#topbar"), progress = $("#progress"), nav = $("#nav"), toggle = $("#menuToggle");
  function onScroll() {
    const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    topbar.classList.toggle("scrolled", y > 20);
    if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    topbar.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open);
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  $$("#nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Site settings are loaded once and shared.
  const settings = getJSON("data/site.json").catch(() => ({}));
  settings.then((site) => {
    if (!site.logo) return;
    const img = new Image();
    img.onload = () => { $$(".brand-mark").forEach((m) => { m.innerHTML = ""; m.classList.add("has-logo"); m.appendChild(img.cloneNode()); }); };
    img.src = site.logo; img.alt = "";
  });

  // Fade elements in as they scroll into view.
  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealer.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  const watchReveals = (root = document) => $$(".reveal:not(.in)", root).forEach((el) => revealer.observe(el));
  watchReveals();

  const readLink = (collection, slug) => `read.html?c=${encodeURIComponent(collection)}&s=${encodeURIComponent(slug)}`;

  return { $, $$, esc, getJSON, fmtDate, tags, settings, watchReveals, readLink };
})();
