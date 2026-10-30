(() => {
 const toggle = document.querySelector('.theme-toggle');
 function update() {
  const dark = document.documentElement.dataset.theme === 'dark';
  toggle.setAttribute('aria-pressed', String(dark));
  toggle.querySelector('span').textContent = dark ? toggle.dataset.lightLabel : toggle.dataset.darkLabel;
 }
 toggle.hidden = false;
 update();
 toggle.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('katya-theme', theme); } catch { }
  update();
 });
})();
