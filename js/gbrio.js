/* G-BRIO — redesign interactions */
(function () {
  "use strict";

  // ---------- Loader ----------
  const loader = document.getElementById("loader");
  if (loader) {
    const hide = () => loader.classList.add("is-gone");
    // Hide as soon as the hero photo (or window) is ready — max 2.8s
    const heroImg = document.querySelector(".hero__media img");
    if (heroImg) {
      if (heroImg.complete) hide();
      else heroImg.addEventListener("load", hide, { once: true });
    }
    window.addEventListener("load", hide);
    setTimeout(hide, 2800);
  }

  // ---------- Nav: scrolled state ----------
  const nav = document.querySelector(".nav");
  const setScrolled = () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  setScrolled();
  window.addEventListener("scroll", setScrolled, { passive: true });

  // ---------- Mobile menu ----------
  const burger = document.querySelector(".nav__burger");
  const mobile = document.querySelector(".nav__mobile");
  if (burger && mobile) {
    const toggle = (open) => {
      const willOpen = typeof open === "boolean" ? open : !mobile.classList.contains("is-open");
      mobile.classList.toggle("is-open", willOpen);
      burger.classList.toggle("is-open", willOpen);
      document.body.style.overflow = willOpen ? "hidden" : "";
    };
    burger.addEventListener("click", () => toggle());
    mobile.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggle(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") toggle(false);
    });
  }

  // ---------- Reveal on scroll ----------
  const targets = document.querySelectorAll(".reveal");
  if (targets.length) {
    // Anything already inside (or near) the initial viewport is revealed
    // immediately — no waiting for the user to scroll.
    const vh = window.innerHeight || document.documentElement.clientHeight;
    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.95) el.classList.add("is-visible");
    });

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0, rootMargin: "0px 0px -10% 0px" }
      );
      targets.forEach((el) => {
        if (!el.classList.contains("is-visible")) io.observe(el);
      });
    } else {
      targets.forEach((el) => el.classList.add("is-visible"));
    }
  }

  // ---------- Builds slider ----------
  const track = document.querySelector("[data-builds-track]");
  const prev = document.querySelector("[data-builds-prev]");
  const next = document.querySelector("[data-builds-next]");
  if (track && prev && next) {
    const step = () => Math.max(280, track.clientWidth * 0.4);
    const updateButtons = () => {
      const atStart = track.scrollLeft <= 4;
      const atEnd = Math.ceil(track.scrollLeft + track.clientWidth) >= track.scrollWidth - 4;
      prev.toggleAttribute("disabled", atStart);
      next.toggleAttribute("disabled", atEnd);
    };
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    updateButtons();
  }

  // ---------- Configurator teaser ----------
  // Mirrors the real step flow of the 3D configurator so the homepage
  // shows what can actually be specified.
  const cfgStep = document.querySelector("[data-cfg-step]");
  const cfgOptions = document.querySelector("[data-cfg-options]");
  if (cfgStep && cfgOptions) {
    const cfgIndex = document.querySelector("[data-cfg-index]");
    const cfgTotal = document.querySelector("[data-cfg-total]");
    const cfgBar = document.querySelector("[data-cfg-bar]");

    const steps = [
      { name: "Model", sel: 1, options: ["Long wheel base 230", "Short wheel base 250"] },
      { name: "Engine", sel: 1, options: ["Stock engine", "5,0 L V8 — 300 hp"] },
      { name: "Gearbox", sel: 0, options: ["Manual", "Automatic"] },
      { name: "Colour", sel: 1, more: 10, options: [
        { label: "Obsidian black", c: "#0d0d0f" },
        { label: "Moss green", c: "#4a5340" },
        { label: "Desert sand", c: "#c8b18b" },
        { label: "Vintage blue", c: "#7c94a8" },
        { label: "Platinum matt", c: "#c9c7c2" },
      ] },
      { name: "Soft top", sel: 0, more: 2, options: [
        { label: "Black", c: "#1a1a1a" },
        { label: "Beige", c: "#cbbea4" },
        { label: "Navy", c: "#2a3550" },
        { label: "Dark brown", c: "#4a3a2e" },
      ] },
      { name: "Seat material — inside", sel: 0, options: ["Leather", "Alcantara"] },
      { name: "Seat material — outside", sel: 1, options: ["Leather", "Alcantara"] },
      { name: "Inner seat surface", sel: 2, more: 2, options: [
        { label: "Black", c: "#1a1a1a" },
        { label: "Grey", c: "#8a8a8a" },
        { label: "Sand", c: "#c2ad87" },
        { label: "Light brown", c: "#9a7550" },
      ] },
      { name: "Seat bolsters", sel: 0, more: 2, options: [
        { label: "Black", c: "#1a1a1a" },
        { label: "Beige", c: "#cbbea4" },
        { label: "Dark brown", c: "#4a3a2e" },
        { label: "Sand", c: "#c2ad87" },
      ] },
      { name: "Stitching colour", sel: 1, more: 5, options: [
        { label: "Beige", c: "#cbbea4" },
        { label: "Red", c: "#8e2b26" },
        { label: "Green", c: "#2c4a35" },
        { label: "Blue", c: "#2a3550" },
      ] },
      { name: "Rims", sel: 1, options: ["Steel", "Dotz Dakar", "Hutchinson Beadlock"] },
      { name: "Multimedia & comfort", sel: 0, options: ["Air conditioning", "Sound system", "Heated seats"], more: 1 },
      { name: "Steering wheel", sel: 1, options: ["Leather", "Sport"] },
      { name: "Offroad", sel: 0, options: ["Lightbar", "Snorkel", "Cable winch", "Bumper"], more: 3 },
    ];

    // German labels for the /de/ pages (looked up by English label).
    const isDe = (document.documentElement.lang || "").toLowerCase().startsWith("de");
    const DE = {
      "Model": "Modell", "Long wheel base 230": "Langer Radstand 230", "Short wheel base 250": "Kurzer Radstand 250",
      "Engine": "Motor", "Stock engine": "Serienmotor", "5,0 L V8 — 300 hp": "5,0 L V8 — 300 PS",
      "Gearbox": "Getriebe", "Manual": "Schaltgetriebe", "Automatic": "Automatik",
      "Colour": "Farbe", "Obsidian black": "Obsidianschwarz", "Moss green": "Moosgrün", "Desert sand": "Wüstensand",
      "Vintage blue": "Vintage-Blau", "Platinum matt": "Platin matt",
      "Soft top": "Verdeck", "Black": "Schwarz", "Beige": "Beige", "Navy": "Marine", "Dark brown": "Dunkelbraun",
      "Seat material — inside": "Sitzmaterial — innen", "Seat material — outside": "Sitzmaterial — außen",
      "Leather": "Leder", "Alcantara": "Alcantara",
      "Inner seat surface": "Sitzfläche innen", "Grey": "Grau", "Sand": "Sand", "Light brown": "Hellbraun",
      "Seat bolsters": "Sitzwangen", "Stitching colour": "Nahtfarbe", "Red": "Rot", "Green": "Grün", "Blue": "Blau",
      "Rims": "Felgen", "Steel": "Stahl",
      "Multimedia & comfort": "Multimedia & Komfort", "Air conditioning": "Klimaanlage", "Sound system": "Soundsystem", "Heated seats": "Sitzheizung",
      "Steering wheel": "Lenkrad", "Sport": "Sport",
      "Offroad": "Offroad", "Lightbar": "Lightbar", "Snorkel": "Schnorchel", "Cable winch": "Seilwinde", "Bumper": "Stoßstange",
    };
    const L = (s) => (isDe && DE[s]) || s;
    const MORE = isDe ? " weitere" : " more";

    if (cfgTotal) cfgTotal.textContent = String(steps.length);

    let i = 0;
    let timer = null;

    const render = () => {
      const step = steps[i];
      cfgStep.textContent = L(step.name);
      if (cfgIndex) cfgIndex.textContent = String(i + 1);
      if (cfgBar) cfgBar.style.width = ((i + 1) / steps.length) * 100 + "%";

      cfgOptions.innerHTML = "";
      step.options.forEach((opt, n) => {
        const li = document.createElement("li");
        li.style.animationDelay = n * 60 + "ms";
        if (n === step.sel) li.classList.add("is-on");
        if (typeof opt === "string") {
          li.textContent = L(opt);
        } else {
          const dot = document.createElement("span");
          dot.className = "dot";
          dot.style.background = opt.c;
          li.appendChild(dot);
          li.appendChild(document.createTextNode(L(opt.label)));
        }
        cfgOptions.appendChild(li);
      });
      if (step.more) {
        const li = document.createElement("li");
        li.className = "is-more";
        li.style.animationDelay = step.options.length * 60 + "ms";
        li.textContent = "+" + step.more + MORE;
        cfgOptions.appendChild(li);
      }
    };

    const advance = () => {
      i = (i + 1) % steps.length;
      render();
    };
    const start = () => {
      if (timer) return;
      timer = setInterval(advance, 2300);
    };
    const stop = () => {
      clearInterval(timer);
      timer = null;
    };

    render();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      // Only run while the section is on screen.
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(
          (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
          { threshold: 0.25 }
        ).observe(cfgOptions.closest(".cfg") || cfgOptions);
      } else {
        start();
      }
      document.addEventListener("visibilitychange", () =>
        document.hidden ? stop() : start()
      );
    }
  }

  // ---------- Netlify forms (AJAX submit, inline success) ----------
  // Falls back to a normal POST (Netlify's own success page) if fetch fails.
  document.querySelectorAll("form[data-netlify]").forEach((form) => {
    const success = form.querySelector(".form-success");
    const error = form.querySelector(".form-error");
    const button = form.querySelector('button[type="submit"]');

    // Returning from the no-JS fallback (?sent=1) -> show the success state.
    if (/[?&]sent=1/.test(location.search) && success) {
      form.classList.add("is-sent");
      success.hidden = false;
    }

    form.addEventListener("submit", async (e) => {
      if (!window.fetch) return; // let the browser submit normally
      e.preventDefault();
      if (error) error.hidden = true;

      const label = button ? button.innerHTML : "";
      if (button) {
        button.disabled = true;
        button.textContent = button.dataset.sending || "Sending…";
      }

      try {
        const res = await fetch(form.getAttribute("action") || location.pathname, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(new FormData(form)).toString(),
        });
        if (!res.ok) throw new Error(res.status);
        form.classList.add("is-sent");
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      } catch (err) {
        if (button) {
          button.disabled = false;
          button.innerHTML = label;
        }
        if (error) error.hidden = false;
      }
    });
  });

  // ---------- Footer year ----------
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Smooth anchor offset for fixed nav ----------
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = document.querySelector(".nav")?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navH + 1;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();
