(() => {
 const content = JSON.parse(document.getElementById('feedback-content').textContent);
 const root = document.querySelector('.site-feedback');
 const status = root.querySelector('.feedback-status');
 const form = root.querySelector('form');
 const buttons = [...root.querySelectorAll('[data-vote]')];
 const fallback = root.querySelector('.feedback-email-fallback');
 const input = form.querySelector('textarea');
 function clearFallback() { fallback.hidden = true; fallback.removeAttribute('href'); }
 function reject(message) { clearFallback(); status.textContent = message; input.setAttribute('aria-invalid', 'true'); input.focus(); }
 function validateComment(raw) {
  const comment = raw.normalize('NFKC').replace(/\r\n?/g, '\n').trim();
  if (!comment) return { error: content.messages.comment_required };
  if (comment.length > 2000) return { error: content.messages.comment_too_long };
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/u.test(comment)) return { error: content.messages.comment_plain_text };
  const check = comment.replace(/[\u3002\uff61]/g, '.');
  const domain = /(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?\.)+(?:[\p{L}]{2,63}|xn--[a-z0-9-]{2,59})/iu;
  const scheme = /\b(?:https?|ftp|mailto|javascript|data|file|blob|vbscript)\s*:/iu;
  if (scheme.test(check) || domain.test(check) || /\bwww\s*\.|\b(?:\d{1,3}\.){3}\d{1,3}\b|\[[0-9a-f:]*:[0-9a-f:]*\]/iu.test(check)) return { error: content.messages.comment_no_links };
  if (/[<>]|!\[|\]\s*\(|&(?:lt|gt|#0*(?:60|62)|#x0*(?:3c|3e));?/iu.test(check)) return { error: content.messages.comment_plain_text };
  return { comment };
 }
 input.addEventListener('input', () => { clearFallback(); input.removeAttribute('aria-invalid'); });
 for (const type of ['paste', 'drop', 'dragover']) input.addEventListener(type, event => {
  const transfer = event.clipboardData || event.dataTransfer;
  if (transfer && (transfer.files?.length || [...(transfer.items || [])].some(item => item.kind === 'file'))) {
   event.preventDefault();
   reject(content.messages.comment_no_files);
  }
 });
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
  remember(); display(); fallback.hidden = true; status.textContent = content.messages.thanks;
 }));
 form.addEventListener('submit', async event => {
  event.preventDefault();
  if (saved?.vote !== 'down') return;
  clearFallback();
  const result = validateComment(input.value);
  if (result.error) { reject(result.error); return; }
  const { comment } = result;
  input.removeAttribute('aria-invalid');
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
  } catch {
   status.textContent = content.messages.comment_error;
   const body = 'Source: Website feedback form (not the contact form)\nWebsite: ' + content.delivery.website + '\nRating: Not quite yet\n\nComment:\n' + comment;
   fallback.href = 'mailto:' + content.delivery.email + '?subject=' + encodeURIComponent(content.delivery.subject) + '&body=' + encodeURIComponent(body);
   fallback.hidden = false;
  }
  finally { submit.disabled = false; buttons.forEach(button => { button.disabled = false; }); }
 });
})();
