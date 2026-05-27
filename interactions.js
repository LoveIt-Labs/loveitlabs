/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LoveIt Labs — page interactions
   - rotating word in hero
   - cursor blob + magnetic hovers
   - lab time clock (SAST)
   - bench row click to underline
   - duplicate marquee for seamless loop
   - copy email to clipboard
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function () {
  'use strict';

  // ───── 1. rotating hero word ────────────────────────────
  const WORDS = [
    "love",
    "obsess over",
    "can't stop thinking about",
    "dream about",
    "ship for ourselves",
    "would refuse to delete",
  ];
  const rotator = document.getElementById("rotator");
  if (rotator) {
    let i = 0;
    const swap = () => {
      const span = rotator.querySelector("span");
      if (!span) return;
      i = (i + 1) % WORDS.length;
      span.classList.remove("entered");
      span.classList.add("exit");
      setTimeout(() => {
        span.textContent = WORDS[i];
        span.className = "enter";
        // double rAF: commits .enter (the "from" state) in its own frame,
        // then swaps to .entered so the transition has something to animate
        // from. A single sync flush gets batched with the new className.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            span.className = "entered";
          });
        });
      }, 420);
    };
    setInterval(swap, 2600);
  }

  // ───── 2. cursor blob ───────────────────────────────────
  const cursor = document.getElementById("cursor");
  if (cursor && window.matchMedia("(hover: hover)").matches) {
    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let cx = tx, cy = ty;

    window.addEventListener("pointermove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });

    const tick = () => {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    tick();

    // hover-state triggers
    const hoverables = "a, button, summary, [data-magnet], .lab-card, .bench-row, .principle, input, .copy-btn";
    document.addEventListener("pointerover", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.add("hover");
    });
    document.addEventListener("pointerout", (e) => {
      if (e.target.closest(hoverables)) cursor.classList.remove("hover");
    });

    // hide on leave
    document.addEventListener("pointerleave", () => cursor.style.opacity = "0");
    document.addEventListener("pointerenter", () => cursor.style.opacity = "1");
  }

  // ───── 3. magnetic hover ────────────────────────────────
  const magnets = document.querySelectorAll("[data-magnet]");
  magnets.forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      const strength = 0.18;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      el.style.transition = "transform 0.08s linear";
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
      el.style.transition = "transform 0.4s cubic-bezier(.2,.8,.2,1)";
    });
  });

  // ───── 4. SAST lab time clock ───────────────────────────
  const labTime = document.getElementById("lab-time");
  const footerTime = document.getElementById("footer-time");
  function pad(n) { return n.toString().padStart(2, "0"); }
  function fmtTime() {
    // SAST = UTC+2
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
    const sast = new Date(utcMs + 2 * 60 * 60 * 1000);
    const h = pad(sast.getHours());
    const m = pad(sast.getMinutes());
    const s = pad(sast.getSeconds());
    return { full: `${h}:${m}:${s} SAST`, short: `${h}:${m} cape town` };
  }
  function updateClocks() {
    const t = fmtTime();
    if (labTime)    labTime.textContent = t.full;
    if (footerTime) footerTime.textContent = t.short;
  }
  updateClocks();
  setInterval(updateClocks, 1000);

  // ───── 5. duplicate marquee for seamless loop ───────────
  const track = document.getElementById("marquee-track");
  if (track) {
    track.innerHTML = track.innerHTML + track.innerHTML;
  }

  // ───── 6. copy email ────────────────────────────────────
  const copyBtn = document.getElementById("copy-btn");
  const emailText = document.getElementById("email-text");
  if (copyBtn && emailText) {
    copyBtn.addEventListener("click", async () => {
      const email = emailText.textContent.trim();
      try {
        await navigator.clipboard.writeText(email);
      } catch (e) {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = email;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e2) {}
        document.body.removeChild(ta);
      }
      copyBtn.classList.add("copied");
      const orig = copyBtn.textContent;
      copyBtn.textContent = "Copied ✓";
      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyBtn.textContent = orig;
      }, 1600);
    });
  }

  // ───── 7. parallax tilt on lab cards ────────────────────
  document.querySelectorAll(".lab-card").forEach((card) => {
    if (card.classList.contains("next")) return; // skip the no.3 placeholder
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-6px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      card.style.transition = "transform 0.12s linear";
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
      card.style.transition = "transform 0.5s cubic-bezier(.2,.8,.2,1)";
    });
  });

  // ───── 8. scroll-revealed underline on bench rows ───────
  // (no-op; reserved for future expansion)

})();
