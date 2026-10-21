// Scroll reveal: adds .is-visible to [data-reveal] elements as they enter the viewport.
// All motion itself lives in motion.css.
(() => {
  const root = document.documentElement;
  if (!root.classList.contains("reveal-on")) return;
  const items = document.querySelectorAll("[data-reveal]");
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      io.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  items.forEach((el) => io.observe(el));
  // Printing: show everything at once.
  const showAll = () => items.forEach((el) => el.classList.add("is-visible"));
  addEventListener("beforeprint", showAll);
})();
