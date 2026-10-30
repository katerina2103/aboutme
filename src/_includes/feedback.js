(() => {
 const content = JSON.parse(document.getElementById('feedback-content').textContent);
 const root = document.querySelector('.site-feedback');
 const status = root.querySelector('.feedback-status');
 const buttons = [...root.querySelectorAll('[data-vote]')];
 const key = 'katya-portfolio-feedback-v2';
 let vote = null;
 try {
  const previous = JSON.parse(localStorage.getItem(key));
  if (['up', 'down'].includes(previous?.vote)) {
   vote = previous.vote;
   // Retain the vote only; remove any old comment or delivery state.
   localStorage.setItem(key, JSON.stringify({ vote }));
  }
 } catch { }
 function display() {
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.vote === vote)));
  status.textContent = vote ? content.messages.thanks : '';
 }
 display();
 buttons.forEach(button => button.addEventListener('click', () => {
  vote = button.dataset.vote;
  try { localStorage.setItem(key, JSON.stringify({ vote })); } catch { }
  display();
 }));
})();
