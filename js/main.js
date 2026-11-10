/* ==========================================================================
   MARCO SARMIENTO — PORTFOLIO
   1 current room · 2 name choreography · 3 cursor · 4 works stepper
   5 room curtain · 6 parallax on the board
   Everything degrades: no JS keeps the content readable, reduced motion
   turns every movement off.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ── 1. which room are we in? ──────────────────────────────────────── */
  var file = window.location.pathname.split("/").pop() || "index.html";
  if (!file) file = "index.html";
  Array.prototype.forEach.call(document.querySelectorAll(".room-link[data-page]"), function (link) {
    if (link.getAttribute("data-page") === file) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  /* ── 2. the name sets itself, letter by letter ─────────────────────── */
  function splitLetters(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === 3) {
        var text = child.textContent;
        if (!text.trim()) return;
        var frag = document.createDocumentFragment();
        text.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          var word = document.createElement("span");
          word.style.display = "inline-block";
          part.split("").forEach(function (ch) {
            var span = document.createElement("span");
            span.className = "char";
            span.textContent = ch;
            word.appendChild(span);
          });
          frag.appendChild(word);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1) {
        splitLetters(child);
      }
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-split]"), function (node) {
    splitLetters(node);
    if (reduce) return;
    var chars = node.querySelectorAll(".char");
    var base = Number(node.getAttribute("data-delay") || 140);
    Array.prototype.forEach.call(chars, function (ch, i) {
      ch.animate(
        [
          { opacity: 0, transform: "translateY(34%)", filter: "blur(8px)" },
          { opacity: 1, transform: "none", filter: "blur(0)" }
        ],
        { duration: 880, delay: base + i * 46, easing: "cubic-bezier(.22,.61,.24,1)", fill: "backwards" }
      );
    });
  });

  /* ── 3. cursor: a dot that never lags, a ring that does ────────────── */
  if (fine && !reduce) {
    var dot = document.createElement("div");
    var ring = document.createElement("div");
    var label = document.createElement("span");
    dot.className = "cur-dot";
    ring.className = "cur-ring";
    label.className = "cur-label";
    ring.appendChild(label);
    document.body.appendChild(ring);
    document.body.appendChild(dot);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my, live = false;

    function tick() {
      rx += (mx - rx) * 0.19;
      ry += (my - ry) * 0.19;
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
      ring.style.transform = "translate3d(" + rx.toFixed(2) + "px," + ry.toFixed(2) + "px,0)";
      if (Math.abs(mx - rx) > 0.4 || Math.abs(my - ry) > 0.4) window.requestAnimationFrame(tick);
      else live = false;
    }
    function wake() { if (!live) { live = true; window.requestAnimationFrame(tick); } }

    window.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch") return;
      mx = event.clientX; my = event.clientY;
      if (!root.classList.contains("has-cursor")) root.classList.add("has-cursor");
      wake();
    }, { passive: true });

    var hot = "a, button, .step-btn, .portrait, .room-link, [data-cursor]";
    document.addEventListener("pointerover", function (event) {
      var target = event.target.closest ? event.target.closest(hot) : null;
      root.classList.toggle("is-link", !!target);
      var text = target && target.getAttribute("data-cursor");
      root.classList.toggle("is-labeled", !!text);
      if (text) label.textContent = text;
    });
    document.addEventListener("pointerdown", function () { root.classList.add("is-down"); });
    document.addEventListener("pointerup", function () { root.classList.remove("is-down"); });
    document.addEventListener("pointerleave", function () {
      root.classList.remove("has-cursor", "is-link", "is-labeled", "is-down");
    });
  }

  /* ── 4. the works stepper ──────────────────────────────────────────── */
  var stepper = document.querySelector("[data-stepper]");
  if (stepper) {
    var works = stepper.querySelectorAll(".work");
    var plaques = stepper.querySelectorAll("[data-plaque]");
    var buttons = stepper.querySelectorAll(".step-btn");
    var rail = stepper.querySelector(".step-rule");
    var tag = stepper.querySelector("[data-art-no]");
    var total = works.length;

    function show(index) {
      index = Math.max(0, Math.min(total - 1, index));
      Array.prototype.forEach.call(works, function (w, i) { w.classList.toggle("is-active", i === index); });
      Array.prototype.forEach.call(plaques, function (p, i) { p.hidden = i !== index; });
      Array.prototype.forEach.call(buttons, function (b, i) {
        b.setAttribute("aria-selected", i === index ? "true" : "false");
      });
      if (tag) tag.textContent = "Fig. " + String(index + 1).padStart(2, "0");
      if (rail) rail.style.setProperty("--step", index);
      stepper.dataset.index = index;
    }
    Array.prototype.forEach.call(buttons, function (b, i) {
      b.addEventListener("click", function () { show(i); });
    });
    window.addEventListener("keydown", function (event) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
      var now = Number(stepper.dataset.index || 0);
      if (event.key === "ArrowRight") show(now + 1);
      else if (event.key === "ArrowLeft") show(now - 1);
    });
    show(0);
  }

  /* ── 5. the curtain between rooms ──────────────────────────────────── */
  var curtain = document.querySelector(".curtain");
  var ctext = curtain ? curtain.querySelector("span") : null;
  if (curtain && !reduce) {
    curtain.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(-101%)" }],
      { duration: 620, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" }
    ).finished.then(function () { curtain.style.transform = "translateY(-101%)"; });
    if (ctext) {
      ctext.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: "ease-out", fill: "forwards" });
    }

    document.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("a") : null;
      if (!link) return;
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || link.target === "_blank") return;
      if (link.hostname && link.hostname !== window.location.hostname) return;
      if (href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
      event.preventDefault();
      if (ctext) ctext.style.opacity = "1";
      curtain.animate(
        [{ transform: "translateY(-101%)" }, { transform: "translateY(0)" }],
        { duration: 430, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" }
      ).finished.then(function () { window.location.href = href; });
    });
  }

  /* ── 6. the board leans away from the pointer ──────────────────────── */
  function initParallax(boardSvg) {
  if (fine && !reduce && boardSvg) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

    function step() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      boardSvg.style.setProperty("--nx", cx.toFixed(2) + "px");
      boardSvg.style.setProperty("--ny", cy.toFixed(2) + "px");
      boardSvg.style.setProperty("--fx", (cx * 0.4).toFixed(2) + "px");
      boardSvg.style.setProperty("--fy", (cy * 0.4).toFixed(2) + "px");
      if (Math.abs(tx - cx) > 0.15 || Math.abs(ty - cy) > 0.15) raf = window.requestAnimationFrame(step);
      else raf = null;
    }

    window.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch") return;
      tx = (event.clientX / window.innerWidth - 0.5) * -16;
      ty = (event.clientY / window.innerHeight - 0.5) * -11;
      if (!raf) raf = window.requestAnimationFrame(step);
    }, { passive: true });
  }
  }

  /* ── 7. the board: injected so the CSS animation and parallax reach it ── */
  var layer = document.querySelector(".board-layer");
  if (layer && window.MS_BOARD) {
    layer.innerHTML = window.MS_BOARD;
    initParallax(layer.querySelector(".board-svg"));
  }

  /* ── 8. cursor effects: a routed trace, a pulse on click, a glow on the board ── */
  if (fine && !reduce) {
    var cv = document.createElement("canvas");
    cv.className = "trail";
    cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    var g = cv.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function fit() {
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    fit();
    window.addEventListener("resize", fit);

    var glow = document.createElement("div");
    glow.className = "board-glow";
    var boardEl = document.querySelector(".board");
    if (boardEl) boardEl.appendChild(glow);

    var GRID = 22, LIFE = 1100, PULSE = 700;
    var segs = [], pulses = [], last = null, running = false;

    function snap(v) { return Math.round(v / GRID) * GRID; }

    /* 45-degree routing, the way a PCB trace turns a corner */
    function route(a, b) {
      var dx = b.x - a.x, dy = b.y - a.y;
      var d = Math.min(Math.abs(dx), Math.abs(dy));
      var mid = { x: a.x + (dx < 0 ? -d : d), y: a.y + (dy < 0 ? -d : d) };
      return [[a, mid], [mid, b]];
    }

    function frame() {
      var now = performance.now();
      g.clearRect(0, 0, window.innerWidth, window.innerHeight);
      g.lineCap = "round";
      g.lineWidth = 1.2;

      segs = segs.filter(function (s) { return now - s.t < LIFE; });
      segs.forEach(function (s) {
        var k = 1 - (now - s.t) / LIFE;
        g.strokeStyle = "rgba(226,177,120," + (0.6 * k).toFixed(3) + ")";
        g.beginPath(); g.moveTo(s.a.x, s.a.y); g.lineTo(s.b.x, s.b.y); g.stroke();
        g.beginPath(); g.arc(s.b.x, s.b.y, 1 + 2 * k, 0, 6.2832); g.stroke();
      });

      pulses = pulses.filter(function (p) { return now - p.t < PULSE; });
      pulses.forEach(function (p) {
        var k = (now - p.t) / PULSE, e = 1 - Math.pow(1 - k, 3);
        g.strokeStyle = "rgba(226,177,120," + (0.75 * (1 - k)).toFixed(3) + ")";
        g.beginPath(); g.arc(p.x, p.y, 6 + 54 * e, 0, 6.2832); g.stroke();
        for (var i = 0; i < 4; i++) {
          var a = i * Math.PI / 2, r0 = 10 + 54 * e, r1 = r0 + 4 + 18 * (1 - k);
          g.beginPath();
          g.moveTo(p.x + Math.cos(a) * r0, p.y + Math.sin(a) * r0);
          g.lineTo(p.x + Math.cos(a) * r1, p.y + Math.sin(a) * r1);
          g.stroke();
        }
      });

      if (segs.length || pulses.length) window.requestAnimationFrame(frame);
      else running = false;
    }
    function kick() { if (!running) { running = true; window.requestAnimationFrame(frame); } }

    window.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch") return;
      glow.style.setProperty("--mx", event.clientX + "px");
      glow.style.setProperty("--my", event.clientY + "px");
      var p = { x: snap(event.clientX), y: snap(event.clientY) };
      if (!last || Math.abs(p.x - last.x) > GRID * 8 || Math.abs(p.y - last.y) > GRID * 8) { last = p; return; }
      if (p.x === last.x && p.y === last.y) return;
      var t = performance.now();
      route(last, p).forEach(function (s) {
        if (s[0].x !== s[1].x || s[0].y !== s[1].y) segs.push({ a: s[0], b: s[1], t: t });
      });
      last = p;
      if (segs.length > 140) segs.splice(0, segs.length - 140);
      kick();
    }, { passive: true });

    document.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "touch") return;
      pulses.push({ x: event.clientX, y: event.clientY, t: performance.now() });
      kick();
    });
    document.documentElement.addEventListener("mouseleave", function () { last = null; });
  }
})();
