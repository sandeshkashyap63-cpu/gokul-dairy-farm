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

    /* ---- Scroll reveal ---- */
    var reveals = document.querySelectorAll(".reveal");
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
