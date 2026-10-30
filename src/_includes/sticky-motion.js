(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const notes = document.querySelectorAll('.sticky');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('sticky--arrived');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.25 });
  notes.forEach(note => {
    note.addEventListener('animationend', () => note.classList.remove('sticky--arrived'), { once: true });
    observer.observe(note);
  });
})();
