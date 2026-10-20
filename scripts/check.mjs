import fs from 'node:fs';import assert from 'node:assert/strict';import {parseHTML} from 'linkedom';import {execFileSync} from 'node:child_process';
execFileSync(process.execPath,['--check','src/app.js'],{stdio:'inherit'});
const html=fs.readFileSync('dist/index.html','utf8');const {document}=parseHTML(html);
assert(!html.includes('{{'),'Unrendered template');
const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);assert.equal(new Set(ids).size,ids.length,'Duplicate IDs');
const order=[...document.querySelectorAll('nav .links a')].map(a=>{assert(document.querySelector(a.getAttribute('href')),'Missing navigation target');return html.indexOf('id="'+a.getAttribute('href').slice(1)+'"')});assert.deepEqual(order,[...order].sort((a,b)=>a-b));
const data=JSON.parse(document.querySelector('#site-content').textContent);assert.equal(data.principles.length,14);assert.equal(data.cases.length,3);assert.equal(data.stories.length,4);assert.equal(data.panels.length,2);assert(data.cases.every(c=>c.body.includes('<h2>')));assert(!/logex|elsevier|pega/i.test(html),'Employer name reintroduced');
for(const f of ['styles.css','app.js'])assert(fs.existsSync('dist/'+f));
console.log('Verified static HTML, content rendering, navigation order, 14 principles, case studies and assets.');
