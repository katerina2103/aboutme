import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';
const html=await fs.readFile(new URL('../dist/index.html',import.meta.url),'utf8');
const script=await fs.readFile(new URL('../src/_includes/feedback.js',import.meta.url),'utf8');
const values=new Map();
const localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
const calls=[];let succeeds=true;
const fetch=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return {ok:succeeds,json:async()=>({success:succeeds})};};
function start(){const {document,window}=parseHTML(html);vm.runInNewContext(script,{document,localStorage,Date,fetch});return {document,window};}
let {document,window}=start();
const form=document.querySelector('.feedback-followup');
document.querySelector('[data-vote="up"]').click();assert.equal(calls.length,0);assert.equal(form.hidden,true);
document.querySelector('[data-vote="down"]').click();assert.equal(calls.length,0);assert.equal(form.hidden,false);
form.querySelector('textarea').value='';form.dispatchEvent(new window.Event('submit',{cancelable:true}));await new Promise(r=>setTimeout(r,0));assert.equal(calls.length,0);
form.querySelector('textarea').value='The role you want is unclear.';
succeeds=false;form.dispatchEvent(new window.Event('submit',{cancelable:true}));await new Promise(r=>setTimeout(r,0));assert.equal(form.hidden,false);assert.equal(form.querySelector('textarea').value,'The role you want is unclear.');assert.equal(form.querySelector('button').disabled,false);assert.equal(document.querySelector('.feedback-email-fallback').hidden,false);assert.match(decodeURIComponent(document.querySelector('.feedback-email-fallback').href),/not the contact form/);
succeeds=true;form.dispatchEvent(new window.Event('submit',{cancelable:true}));await new Promise(r=>setTimeout(r,0));
assert.equal(form.hidden,true);assert.equal(JSON.parse([...values.values()][0]).sent,true);
assert.equal(calls.at(-1).url,'https://formsubmit.co/ajax/shimanovskatya@gmail.com');
assert.match(calls.at(-1).body._subject,/Website feedback form/);assert.match(calls.at(-1).body.form_source,/not the contact form/);assert.equal(calls.at(-1).body.comment,'The role you want is unclear.');
({document}=start());assert.equal(document.querySelector('[data-vote="down"]').getAttribute('aria-pressed'),'true');assert.equal(document.querySelector('a[href^="mailto:"]').getAttribute('href'),'mailto:shimanovskatya@gmail.com');
console.log('Passed: local votes, email routing and form identification, comment validation, error recovery and successful submission.');

// Exercise adversarial input without submitting anything to the email service.
({document,window}=start());
document.querySelector('[data-vote="down"]').click();
const securityForm=document.querySelector('.feedback-followup');
const textarea=securityForm.querySelector('textarea');
const blocked=['https://example.com','www.example.org','example.com/path','katya@example.org','<img src=x onerror=alert(1)>','<script>alert(1)</script>','![image](photo.png)','[open](/somewhere)','data:image/png;base64,abcd','javascript:alert(1)','file:///tmp/file','https://127.0.0.1','127.0.0.1','[2001:db8::1]','ｈｔｔｐｓ：／／example.com','test\u200b.com','example。com','&lt;img src=x&gt;','x'.repeat(2001)];
for(const text of blocked){const count=calls.length;textarea.value=text;securityForm.dispatchEvent(new window.Event('submit',{cancelable:true}));await new Promise(r=>setTimeout(r,0));assert.equal(calls.length,count,`Blocked input reached network: ${text}`);assert.equal(textarea.getAttribute('aria-invalid'),'true');assert.equal(document.querySelector('.feedback-email-fallback').hidden,true);}
for(const type of ['paste','drop']){const event=new window.Event(type,{cancelable:true});Object.defineProperty(event,type==='paste'?'clipboardData':'dataTransfer',{value:{files:[{}],items:[{kind:'file'}]}});textarea.dispatchEvent(event);assert.equal(event.defaultPrevented,true);}
for(const text of ['I liked the stories.\nThe role you want could be clearer.','Très clair, merci! 20% more context would help.','x'.repeat(2000)]){document.querySelector('[data-vote="down"]').click();textarea.value=text;const count=calls.length;securityForm.dispatchEvent(new window.Event('submit',{cancelable:true}));await new Promise(r=>setTimeout(r,0));assert.equal(calls.length,count+1);assert.equal(calls.at(-1).body.comment,text);assert.ok(!('attachment' in calls.at(-1).body));}
console.log('Passed: plain text and Unicode accepted; links, HTML, image markup, files, controls and oversized comments blocked before delivery or fallback.');
