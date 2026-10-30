const feedbackContent = JSON.parse(document.getElementById("feedback-content").textContent);
(() => {
const root=document.querySelector('.site-feedback'), status=root.querySelector('.feedback-status'), form=root.querySelector('form'), buttons=[...root.querySelectorAll('[data-vote]')];
if (!['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname)) {
 root.querySelector('.feedback-votes').hidden = true;
 const link=document.createElement('a');
 link.className='text-link'; link.href=feedbackContent.messages.email_link;
 link.textContent=feedbackContent.messages.email_label;
 status.append(link);
 return;
}
const key='katya-portfolio-feedback-v1'; let saved=null;
try { saved=JSON.parse(localStorage.getItem(key)); } catch {}
function display(vote){buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.vote===vote))); form.hidden=vote!=='down';}
if(saved){display(saved.vote);status.textContent=feedbackContent.messages.thanks;}
async function send(payload){const response=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!response.ok)throw Error('save');return response.json();}
buttons.forEach(button=>button.addEventListener('click',async()=>{
buttons.forEach(b=>b.disabled=true);status.textContent=feedbackContent.messages.saving;
try {const vote=button.dataset.vote;const result=await send({vote,id:saved?.id});saved={id:result.id,vote};try{localStorage.setItem(key,JSON.stringify(saved));}catch{}display(vote);status.textContent=feedbackContent.messages.thanks;}
catch {status.textContent=feedbackContent.messages.vote_error;}
finally{buttons.forEach(b=>b.disabled=false);}
}));
form.addEventListener('submit',async event=>{event.preventDefault();if(!saved)return;const button=form.querySelector('button');button.disabled=true;try{await send({...saved,comment:form.querySelector('textarea').value});form.hidden=true;status.textContent=feedbackContent.messages.comment_thanks;}catch{status.textContent=feedbackContent.messages.comment_error;}finally{button.disabled=false;} });
})();