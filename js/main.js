/* ===================================================================
   Gokul Dairy Farm — interactions
   =================================================================== */
(function () {
  "use strict";

  // Polyfill for NodeList.prototype.forEach (for older Android / WebView compatibility)
  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }

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

    /* ---- Hero: scroll-scrubbed animation ---- */
    /* Desktop: canvas approach (smooth, all 215 frames)
       Mobile/Android: IMG tag approach (reliable, ~20 keyframes) */
    (function () {
      var canvas = document.getElementById("heroCanvas");
      var seq = document.getElementById("heroSeq");
      var hero = document.getElementById("home");
      if (!canvas || !seq) return;

      var heroContent = seq.querySelector(".hero__content");
      var stickyEl = seq.querySelector(".hero__sticky");
      /* Robust viewport reference: the pinned sticky's real height.
         Avoids window.innerHeight, which on Android Chrome (URL bar /
         visual viewport) can exceed the seq height and make the scrub
         range negative — freezing the animation on frame 0. */
      function pinHeight() {
        var h = stickyEl ? stickyEl.getBoundingClientRect().height : 0;
        return h || document.documentElement.clientHeight || window.innerHeight;
      }
      var TOTAL_FRAMES = 215;
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      /* ---- Device detection ---- */
      var ua = navigator.userAgent || "";
      var isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua)
                     || window.innerWidth <= 900;
      var isAndroid = /Android/i.test(ua);

      /* ---- Frame selection ---- */
      /* Mobile: ~20 keyframes. Desktop: all 215 */
      var STEP = isMobile ? 10 : 1;
      var frameIndices = [];
      for (var fi = 0; fi < TOTAL_FRAMES; fi += STEP) frameIndices.push(fi);
      if (frameIndices[frameIndices.length - 1] !== TOTAL_FRAMES - 1) frameIndices.push(TOTAL_FRAMES - 1);
      var COUNT = frameIndices.length;

      function pad(n) { return ("00" + n).slice(-3); }
      function frameSrc(frameIdx) {
        return "images/hero-frames/ezgif-frame-" + pad(frameIndices[frameIdx] + 1) + ".jpg";
      }

      /* ============================================================
         MOBILE PATH: Use <img> tag — canvas is unreliable on Android
         ============================================================ */
      if (isMobile) {
        /* Hide the canvas, create an <img> instead */
        canvas.style.display = "none";

        var heroImg = document.createElement("img");
        heroImg.className = "hero__canvas hero__canvas--img";
        heroImg.alt = canvas.getAttribute("aria-label") || "";
        heroImg.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;position:absolute;top:0;left:0;";
        canvas.parentNode.insertBefore(heroImg, canvas);

        /* Preload frames into JS Image objects */
        var mImgs = new Array(COUNT);
        var mLoaded = 0;
        var mCurrentFrame = -1;

        function mShowFrame(idx) {
          if (idx === mCurrentFrame) return;
          if (mImgs[idx] && mImgs[idx].complete && mImgs[idx].naturalWidth) {
            heroImg.src = mImgs[idx].src;
            mCurrentFrame = idx;
          } else {
            /* Find nearest loaded frame */
            for (var d = 0; d < COUNT; d++) {
              var lo = idx - d, hi = idx + d;
              if (lo >= 0 && mImgs[lo] && mImgs[lo].complete && mImgs[lo].naturalWidth) {
                heroImg.src = mImgs[lo].src; mCurrentFrame = lo; return;
              }
              if (hi < COUNT && mImgs[hi] && mImgs[hi].complete && mImgs[hi].naturalWidth) {
                heroImg.src = mImgs[hi].src; mCurrentFrame = hi; return;
              }
            }
          }
        }

        /* Show first frame immediately as background */
        heroImg.src = frameSrc(0);

        /* Load all keyframes */
        for (var mi = 0; mi < COUNT; mi++) {
          (function(idx) {
            var im = new Image();
            im.onload = function() {
              mLoaded++;
              if (idx === 0 && heroImg.src !== im.src) heroImg.src = im.src;
            };
            im.onerror = function() { mLoaded++; };
            im.src = frameSrc(idx);
            mImgs[idx] = im;
          })(mi);
        }

        /* Scroll handler */
        function mGetProgress() {
          var rect = seq.getBoundingClientRect();
          var total = rect.height - pinHeight();
          if (total <= 0) return 0;
          var p = (-rect.top) / total;
          return p < 0 ? 0 : p > 1 ? 1 : p;
        }

        var mProgress = 0;
        var mRaf = 0;

        function mOnScroll() {
          mProgress = mGetProgress();
        }

        function mAnimate() {
          var f = Math.round(mProgress * (COUNT - 1));
          mShowFrame(f);

          /* Toggle hero text visibility */
          if (heroContent) {
            heroContent.classList.toggle("show-mobile-text", mProgress >= 0.75);
          }
          if (hero && (window.pageYOffset || window.scrollY) > 40) {
            hero.classList.add("scrolled-in");
          }
          mRaf = requestAnimationFrame(mAnimate);
        }

        if (reduce) {
          seq.style.height = "100vh";
          heroImg.src = frameSrc(COUNT - 1);
          if (heroContent) heroContent.classList.add("show-mobile-text");
        } else {
          window.addEventListener("scroll", mOnScroll, { passive: true });
          document.addEventListener("touchmove", mOnScroll, { passive: true });
          mOnScroll();
          mRaf = requestAnimationFrame(mAnimate);
        }

        return; /* skip desktop path */
      }

      /* ============================================================
         DESKTOP PATH: Canvas approach (unchanged, full quality)
         ============================================================ */
      var ctx = canvas.getContext("2d");
      if (!ctx) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var imgs = new Array(COUNT);
      var loaded = 0;
      var currentProgress = 0;
      var targetProgress = 0;
      var lerpFactor = 0.08;
      var lastDrawnFrame = -1;

      function sizeCanvas() {
        var r = canvas.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) return false;
        var w = Math.max(1, Math.round(r.width * dpr));
        var h = Math.max(1, Math.round(r.height * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          return true;
        }
        return false;
      }

      function nearest(i) {
        if (imgs[i] && imgs[i].complete && imgs[i].naturalWidth) return imgs[i];
        for (var d = 1; d < COUNT; d++) {
          if (i - d >= 0 && imgs[i - d] && imgs[i - d].complete && imgs[i - d].naturalWidth) return imgs[i - d];
          if (i + d < COUNT && imgs[i + d] && imgs[i + d].complete && imgs[i + d].naturalWidth) return imgs[i + d];
        }
        return null;
      }

      function draw(i) {
        var sizeChanged = sizeCanvas();
        if (i === lastDrawnFrame && !sizeChanged) return;
        var im = nearest(i); if (!im) return;
        var cw = canvas.width, ch = canvas.height, iw = im.naturalWidth, ih = im.naturalHeight;
        if (cw <= 1 || ch <= 1 || iw <= 0 || ih <= 0) return;
        var s = Math.max(cw / iw, ch / ih), dw = iw * s, dh = ih * s;
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(im, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
        lastDrawnFrame = i;
      }

      function getScrollProgress() {
        var rect = seq.getBoundingClientRect();
        var total = rect.height - pinHeight();
        if (total <= 0) return 0;
        var p = (-rect.top) / total;
        return p < 0 ? 0 : p > 1 ? 1 : p;
      }

      function updateAnimation() {
        currentProgress += (targetProgress - currentProgress) * lerpFactor;
        if (Math.abs(targetProgress - currentProgress) < 0.0005) {
          currentProgress = targetProgress;
        }
        var f = Math.round(currentProgress * (COUNT - 1));
        draw(f);
        requestAnimationFrame(updateAnimation);
      }

      function onScroll() {
        targetProgress = getScrollProgress();
        if (hero && (window.pageYOffset || window.scrollY) > 40) {
          hero.classList.add("scrolled-in");
        }
      }

      /* Load all frames */
      for (var i = 0; i < COUNT; i++) {
        (function (idx) {
          var im = new Image();
          im.onload = function () {
            loaded++;
            if (idx === 0) draw(0);
            if (loaded === COUNT) {
              targetProgress = getScrollProgress();
              currentProgress = targetProgress;
              draw(Math.round(currentProgress * (COUNT - 1)));
            }
          };
          im.onerror = function() { loaded++; };
          im.src = frameSrc(idx);
          imgs[idx] = im;
        })(i);
      }

      if (reduce) {
        seq.style.height = "100vh";
        var t = setInterval(function () { if (nearest(COUNT - 1)) { draw(COUNT - 1); clearInterval(t); } }, 120);
      } else {
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", function () {
          lastDrawnFrame = -1;
          draw(Math.round(currentProgress * (COUNT - 1)));
        });
        onScroll();
        currentProgress = targetProgress;
        requestAnimationFrame(updateAnimation);
      }
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

    /* ---- Cows Slider Gallery ---- */
    (function () {
      var container = document.querySelector('.community__slider-container');
      if (!container) return;
      var slides = container.querySelectorAll('.community__slide');
      var dots = container.querySelectorAll('.dot');
      var currentIndex = 0;
      var slideInterval = null;
      var duration = 3000;

      function showSlide(index) {
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
        currentIndex = index;
      }

      function nextSlide() {
        var nextIndex = (currentIndex + 1) % slides.length;
        showSlide(nextIndex);
      }

      function startAutoplay() {
        stopAutoplay();
        slideInterval = setInterval(nextSlide, duration);
      }

      function stopAutoplay() {
        if (slideInterval) clearInterval(slideInterval);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          var index = parseInt(dot.getAttribute('data-index'), 10);
          showSlide(index);
          startAutoplay();
        });
      });

      startAutoplay();
    })();
  });
})();
