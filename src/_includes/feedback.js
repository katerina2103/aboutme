(() => {
 const content = JSON.parse(document.getElementById('feedback-content').textContent);
 const root = document.querySelector('.site-feedback');
 const status = root.querySelector('.feedback-status');
 const form = root.querySelector('form');
 const buttons = [...root.querySelectorAll('[data-vote]')];
 const key = 'katya-portfolio-feedback-v2';
 let saved = null;
 try { saved = JSON.parse(localStorage.getItem(key)); } catch { }
 function remember() { try { localStorage.setItem(key, JSON.stringify(saved)); } catch { } }
 function display() {
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.vote === saved?.vote)));
  form.hidden = saved?.vote !== 'down' || Boolean(saved?.sent);
 }
 if (saved) { display(); status.textContent = content.messages.thanks; }
 buttons.forEach(button => button.addEventListener('click', () => {
  saved = { vote: button.dataset.vote, date: new Date().toISOString(), sent: false };
  remember(); display(); status.textContent = content.messages.thanks;
 }));
 form.addEventListener('submit', async event => {
  event.preventDefault();
  if (saved?.vote !== 'down') return;
  const comment = form.querySelector('textarea').value.trim();
  if (!comment) { status.textContent = content.messages.comment_required; form.querySelector('textarea').focus(); return; }
  if (form.querySelector('[name="_honey"]').value) return;
  const submit = form.querySelector('button');
  submit.disabled = true;
  buttons.forEach(button => { button.disabled = true; });
  status.textContent = content.messages.sending;
  try {
   const response = await fetch(content.delivery.endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
     _subject: content.delivery.subject,
     _template: 'table',
     _honey: '',
     form_source: 'Website feedback form (not the contact form)',
     website: content.delivery.website,
     question: content.copy.i_treat_this_website_as_a_product,
     rating: content.copy.not_quite_yet,
     comment
    })
   });
   const result = await response.json();
   if (!response.ok || ![true, 'true'].includes(result.success)) throw new Error('Feedback submission failed');
   saved.sent = true;
   remember(); display();
   form.querySelector('textarea').value = '';
   status.textContent = content.messages.comment_thanks;
  } catch { status.textContent = content.messages.comment_error; }
  finally { submit.disabled = false; buttons.forEach(button => { button.disabled = false; }); }
 });
})();
