import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';
const html=await fs.readFile(new URL('../dist/index.html',import.meta.url),'utf8');
const script=await fs.readFile(new URL('../src/_includes/feedback.js',import.meta.url),'utf8');
const values=new Map();
const localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
function start(){const {document}=parseHTML(html);vm.runInNewContext(script,{document,localStorage});return document;}
let document=start();
for(const vote of ['down','up']) {
 document.querySelector(`[data-vote="${vote}"]`).click();
 assert.equal(document.querySelector(`[data-vote="${vote}"]`).getAttribute('aria-pressed'),'true');
 assert.deepEqual(JSON.parse(values.get('katya-portfolio-feedback-v2')),{vote});
 assert.ok(document.querySelector('.feedback-status').textContent);
 assert.equal(document.querySelector('.site-feedback').querySelectorAll('form, textarea, input, a').length,0);
}
document=start();assert.equal(document.querySelector('[data-vote="up"]').getAttribute('aria-pressed'),'true');
values.set('katya-portfolio-feedback-v2',JSON.stringify({vote:'down',comment:'Old private note',sent:true}));
document=start();assert.deepEqual(JSON.parse(values.get('katya-portfolio-feedback-v2')),{vote:'down'});
assert.doesNotMatch(script,/fetch\(|mailto:|FormSubmit|formsubmit|feedback-followup/);
assert.equal(document.querySelector('a[href="mailto:shimanovskatya@gmail.com"]').textContent.trim(),'Email Katya ↗');
console.log('Passed: thumbs-only feedback, vote changes/persistence, old-comment cleanup, no form or delivery code, and separate contact link.');
