/**
 * motion.js — lớp animation & micro-interaction cho trang chủ.
 * Thư viện: GSAP + ScrollTrigger (reveal/parallax), Lenis (smooth scroll).
 * Mọi thứ đều có fallback: thiếu thư viện hoặc người dùng bật
 * "giảm chuyển động" thì nội dung vẫn hiển thị bình thường.
 */
(() => {
  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const { gsap, ScrollTrigger, Lenis } = window;
  const canAnimate = !prefersReducedMotion && Boolean(gsap && ScrollTrigger);

  window.__motionReady = true;

  /* ---------- Scroll progress + back-to-top (không phụ thuộc thư viện) ---------- */
  const progressBar = document.querySelector("[data-scroll-progress]");
  const backToTop = document.querySelector("[data-back-to-top]");
  const backToTopRing = document.querySelector("[data-back-to-top-ring]");
  let lenis = null;
  let ticking = false;

  const renderScrollUi = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    if (backToTopRing) backToTopRing.style.strokeDashoffset = String(100 - progress * 100);
    backToTop?.classList.toggle("is-visible", window.scrollY > 640);
  };

  const requestScrollUi = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(renderScrollUi);
  };

  window.addEventListener("scroll", requestScrollUi, { passive: true });
  window.addEventListener("resize", requestScrollUi, { passive: true });
  renderScrollUi();

  backToTop?.addEventListener("click", () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* ---------- Spotlight theo chuột trên service card ---------- */
  if (finePointer) {
    document.querySelectorAll(".service-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    });
  }

  if (!canAnimate) {
    root.classList.remove("has-motion");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll ---------- */
  const header = document.querySelector("[data-header]");
  const headerOffset = () => -((header?.offsetHeight || 80) + 8);

  if (Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Neo nội trang (#bang-gia, #lien-he...) cuộn mượt và trừ chiều cao header sticky
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"], a[href^="/#"]');
      if (!link) return;
      const hash = link.getAttribute("href").replace(/^\//, "");
      if (hash.length < 2) return;
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(hash === "#home" ? 0 : target, { offset: headerOffset(), duration: 1.2 });
      history.replaceState(null, "", hash);
    });

    // Khóa cuộn trang khi modal giao hàng mở (script.js bật class modal-open)
    new MutationObserver(() => {
      if (document.body.classList.contains("modal-open")) lenis.stop();
      else lenis.start();
    }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }

  /* ---------- Hero entrance ---------- */
  const heroItems = gsap.utils.toArray("[data-hero]");
  const heroCard = document.querySelector("[data-hero-card]");

  gsap
    .timeline({ defaults: { ease: "power3.out", duration: 1 } })
    .fromTo(heroItems, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, stagger: 0.12, clearProps: "transform" })
    .fromTo(
      heroCard,
      { autoAlpha: 0, x: 48, rotateY: -8, transformPerspective: 1200 },
      { autoAlpha: 1, x: 0, rotateY: 0, duration: 1.2, clearProps: "transform" },
      0.25,
    );

  // Parallax nhẹ cho ảnh nền hero
  const heroMedia = document.querySelector("[data-hero-media]");
  if (heroMedia) {
    gsap.to(heroMedia, {
      yPercent: 14,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

  /* ---------- Reveal khi cuộn ---------- */
  const revealTargets = [
    ...document.querySelectorAll("[data-reveal]"),
    ...document.querySelectorAll("[data-reveal-stagger] > *"),
  ];

  ScrollTrigger.batch(revealTargets, {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.fromTo(
        batch,
        { autoAlpha: 0, y: 42 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
          overwrite: true,
          // Gỡ transform inline để hiệu ứng :hover trong CSS hoạt động lại
          clearProps: "transform",
        },
      ),
  });

  /* ---------- Hiệu ứng đổi chiều tuyến trên fare card ---------- */
  document.querySelectorAll("[data-card-fare-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".fare-card");
      if (!card) return;
      gsap.fromTo(
        card.querySelectorAll("h3, [data-route-from], [data-route-to]"),
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power2.out", clearProps: "all" },
      );
    });
  });

  /* ---------- Tiêu đề section hiện từng chữ ---------- */
  document.querySelectorAll(".section-head h2, .process-intro h2, .contact-box h2").forEach((heading) => {
    if (heading.children.length) return; // chỉ tách tiêu đề thuần chữ
    const words = heading.textContent.trim().split(/\s+/);
    heading.textContent = "";
    words.forEach((word, index) => {
      const outer = document.createElement("span");
      const inner = document.createElement("span");
      outer.className = "split-word";
      inner.textContent = word;
      outer.appendChild(inner);
      heading.appendChild(outer);
      if (index < words.length - 1) heading.appendChild(document.createTextNode(" "));
    });

    const inners = heading.querySelectorAll(".split-word > span");
    gsap.set(inners, { yPercent: 115 });
    ScrollTrigger.create({
      trigger: heading,
      start: "top 90%",
      once: true,
      onEnter: () =>
        gsap.to(inners, { yPercent: 0, duration: 0.9, stagger: 0.045, ease: "power4.out", delay: 0.1 }),
    });
  });

  /* ---------- Timeline quy trình sáng dần theo cuộn ---------- */
  document.querySelectorAll(".steps li").forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: "top 70%",
      onEnter: () => step.classList.add("is-active"),
      onLeaveBack: () => step.classList.remove("is-active"),
    });
  });

  /* ---------- Active nav link theo section đang xem ---------- */
  const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
  const setActive = (id) => {
    navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`));
  };

  [
    [".hero", "home"],
    ["#bang-gia", "bang-gia"],
    ["#dich-vu", "dich-vu"],
    ["#quy-trinh", "quy-trinh"],
    ["#lien-he", "lien-he"],
  ].forEach(([selector, id]) => {
    if (!document.querySelector(selector)) return;
    ScrollTrigger.create({
      trigger: selector,
      start: "top 45%",
      end: "bottom 45%",
      onToggle: (self) => self.isActive && setActive(id),
    });
  });

  // Ảnh/font tải xong có thể làm thay đổi chiều cao trang
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
