/* ===================================================================
   Gokul Dairy Farm — interactions
   =================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {

    /* ---- Current year in footer ---- */
    var yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();

    /* ---- Header shadow on scroll ---- */
    var header = document.getElementById("header");
    var backToTop = document.getElementById("backToTop");
    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle("scrolled", y > 10);
      if (backToTop) backToTop.classList.toggle("show", y > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---- Mobile navigation ---- */
    var hamburger = document.getElementById("hamburger");
    var nav = document.getElementById("nav");
    var overlay = document.getElementById("navOverlay");

    function closeNav() {
      if (!nav) return;
      nav.classList.remove("open");
      if (hamburger) { hamburger.classList.remove("active"); hamburger.setAttribute("aria-expanded", "false"); }
      if (overlay) overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
    function toggleNav() {
      if (!nav) return;
      var open = nav.classList.toggle("open");
      if (hamburger) { hamburger.classList.toggle("active", open); hamburger.setAttribute("aria-expanded", open ? "true" : "false"); }
      if (overlay) overlay.classList.toggle("active", open);
      document.body.style.overflow = open ? "hidden" : "";
    }
    if (hamburger) hamburger.addEventListener("click", toggleNav);
    if (overlay) overlay.addEventListener("click", closeNav);
    if (nav) {
      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", closeNav);
      });
    }
    window.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

    /* ---- Scroll reveal (staggered cascade) ---- */
    var reveals = document.querySelectorAll(".reveal");
    reveals.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) {
        return c.classList && c.classList.contains("reveal");
      });
      var i = sibs.indexOf(el);
      if (i > 0) el.style.transitionDelay = Math.min(i * 90, 540) + "ms";
    });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("in"); });
    }

    /* ---- Hero background slideshow ---- */
    (function () {
      var bg = document.getElementById("heroBg");
      var dotsWrap = document.getElementById("slideDots");
      if (!bg) return;
      var slides = bg.querySelectorAll(".hero__slide");
      var count = slides.length, idx = 0, timer = null, dots = [];
      if (!count) return;
      if (dotsWrap) {
        for (var d = 0; d < count; d++) {
          (function (n) {
            var b = document.createElement("button");
            b.setAttribute("aria-label", "Show image " + (n + 1));
            b.addEventListener("click", function () { go(n); restart(); });
            dotsWrap.appendChild(b); dots.push(b);
          })(d);
        }
      }
      function go(n) {
        idx = (n + count) % count;
        slides.forEach(function (s, k) { s.classList.toggle("is-active", k === idx); });
        dots.forEach(function (dd, k) { dd.classList.toggle("active", k === idx); });
      }
      function next() { go(idx + 1); }
      function prev() { go(idx - 1); }
      function restart() { clearInterval(timer); timer = setInterval(next, 5000); }
      var nb = document.getElementById("slideNext"), pb = document.getElementById("slidePrev");
      if (nb) nb.addEventListener("click", function () { next(); restart(); });
      if (pb) pb.addEventListener("click", function () { prev(); restart(); });
      go(0); restart();
    })();

    /* ---- Scroll progress bar ---- */
    (function () {
      var bar = document.getElementById("scrollProgress");
      if (!bar) return;
      function upd() {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        var top = h.scrollTop || window.pageYOffset || 0;
        bar.style.width = (max > 0 ? (top / max) * 100 : 0) + "%";
      }
      window.addEventListener("scroll", upd, { passive: true });
      window.addEventListener("resize", upd); upd();
    })();

    /* ---- Hero parallax ---- */
    (function () {
      var bg = document.getElementById("heroBg");
      var hero = document.getElementById("home");
      if (!bg || !hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var ticking = false;
      window.addEventListener("scroll", function () {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () {
          var y = window.pageYOffset || 0;
          if (y < hero.offsetHeight) bg.style.transform = "translateY(" + (y * 0.25) + "px)";
          ticking = false;
        });
      }, { passive: true });
    })();

    /* ---- Animated count-up stats ---- */
    (function () {
      var nums = document.querySelectorAll("[data-count]");
      if (!nums.length) return;
      function animate(el) {
        var target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        var dur = 1500, start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(eased * target).toLocaleString("en-IN") + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target.toLocaleString("en-IN") + suffix;
        }
        requestAnimationFrame(step);
      }
      if ("IntersectionObserver" in window) {
        var io2 = new IntersectionObserver(function (ents) {
          ents.forEach(function (en) { if (en.isIntersecting) { animate(en.target); io2.unobserve(en.target); } });
        }, { threshold: 0.5 });
        nums.forEach(function (n) { io2.observe(n); });
      } else { nums.forEach(animate); }
    })();

    /* ---- Cartoon cow parade (auto-generated) ---- */
    (function () {
      var wrap = document.getElementById("cowParade");
      if (!wrap) return;
      var cow = '<svg class="parade-cow" viewBox="0 0 90 64" aria-hidden="true">' +
        '<rect x="24" y="40" width="7" height="16" rx="3.5" fill="#fff" stroke="#20342a" stroke-width="2.5"/>' +
        '<rect x="56" y="40" width="7" height="16" rx="3.5" fill="#fff" stroke="#20342a" stroke-width="2.5"/>' +
        '<ellipse cx="46" cy="32" rx="30" ry="18" fill="#fff" stroke="#20342a" stroke-width="3"/>' +
        '<circle cx="40" cy="27" r="7" fill="#7a4a22"/><circle cx="55" cy="36" r="5" fill="#7a4a22"/>' +
        '<path d="M75 24c7-2 9 7 4 12" fill="none" stroke="#20342a" stroke-width="3" stroke-linecap="round"/>' +
        '<ellipse cx="16" cy="29" rx="12" ry="10" fill="#fff" stroke="#20342a" stroke-width="3"/>' +
        '<ellipse cx="9" cy="20" rx="4.5" ry="3.5" fill="#fff" stroke="#20342a" stroke-width="2.5"/>' +
        '<path d="M18 19c-1-6 5-6 5-1" fill="#ffe0a6" stroke="#20342a" stroke-width="2.5"/>' +
        '<circle cx="13" cy="28" r="2.2" fill="#20342a"/>' +
        '<ellipse cx="7" cy="34" rx="5.5" ry="4.5" fill="#ffc1d6" stroke="#20342a" stroke-width="2"/></svg>';
      var html = ""; for (var k = 0; k < 10; k++) html += cow;
      wrap.innerHTML = html;
    })();

    /* ---- Contact form (Web3Forms) ---- */
    var form = document.getElementById("enquiryForm");
    var status = document.getElementById("formStatus");
    var submitBtn = document.getElementById("formSubmit");
    var submitSpan = submitBtn ? submitBtn.querySelector("span") : null;

    function tr(key, fallback) {
      try { return window.GokulI18n.t(window.GokulI18n.current(), key) || fallback; }
      catch (e) { return fallback; }
    }

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var keyField = form.querySelector('input[name="access_key"]');
        var accessKey = keyField ? keyField.value : "";

        // If the Web3Forms key hasn't been set yet, fall back to WhatsApp so no lead is lost.
        if (!accessKey || accessKey === "YOUR_WEB3FORMS_ACCESS_KEY") {
          var name = (form.querySelector('[name="name"]') || {}).value || "";
          var phone = (form.querySelector('[name="phone"]') || {}).value || "";
          var interest = (form.querySelector('[name="interest"]') || {}).value || "";
          var msg = (form.querySelector('[name="message"]') || {}).value || "";
          var text = "Hello Gokul Dairy Farm, I would like to enquire.\nName: " + name +
                     "\nPhone: " + phone + "\nInterested in: " + interest +
                     (msg ? "\nMessage: " + msg : "");
          window.open("https://wa.me/917900000179?text=" + encodeURIComponent(text), "_blank", "noopener");
          if (status) { status.className = "form__status ok"; status.textContent = tr("contact.form.success", "Thank you! Your enquiry has been sent."); }
          return;
        }

        var data = new FormData(form);
        if (submitSpan) submitSpan.textContent = tr("contact.form.sending", "Sending…");
        if (submitBtn) submitBtn.disabled = true;
        if (status) { status.className = "form__status"; status.textContent = ""; }

        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: data,
          headers: { "Accept": "application/json" }
        }).then(function (r) { return r.json(); })
          .then(function (json) {
            if (json.success) {
              form.reset();
              if (status) { status.className = "form__status ok"; status.textContent = tr("contact.form.success", "Thank you! Your enquiry has been sent."); }
            } else {
              if (status) { status.className = "form__status err"; status.textContent = tr("contact.form.error", "Something went wrong. Please call or WhatsApp us instead."); }
            }
          }).catch(function () {
            if (status) { status.className = "form__status err"; status.textContent = tr("contact.form.error", "Something went wrong. Please call or WhatsApp us instead."); }
          }).finally(function () {
            if (submitSpan) submitSpan.textContent = tr("contact.form.submit", "Send Enquiry");
            if (submitBtn) submitBtn.disabled = false;
          });
      });
    }
  });
})();
