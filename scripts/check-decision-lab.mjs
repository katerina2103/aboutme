import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const { document, window } = parseHTML(html);
const script = await readFile(new URL('../src/_includes/decision-lab.js', import.meta.url), 'utf8');
vm.runInNewContext(script, {document});
const slides = [...document.querySelectorAll('.lab-slide')];
const next = document.querySelector('.lab-next');
const prev = document.querySelector('.lab-prev');
const visible = () => slides.findIndex(s => !s.hidden);
assert.equal(slides.length, 8);
assert.equal(visible(), 0);
assert.equal(prev.disabled, true);
for (let i = 1; i < 8; i++) {
  next.click();
  assert.equal(visible(), i);
  assert.equal(slides.filter(s => !s.hidden).length, 1);
  assert.match(document.querySelector('.lab-count').textContent, new RegExp('^' + (i + 1) + ' / 8'));
}
assert.match(next.textContent, /Start again/);
prev.click();
assert.equal(visible(), 6);
const key = new window.Event('keydown', {bubbles: true, cancelable: true});
Object.defineProperty(key, 'key', {value: 'ArrowRight'});
next.dispatchEvent(key);
assert.equal(visible(), 7);
next.click();
assert.equal(visible(), 0);
assert.equal(prev.disabled, true);
assert.match(document.querySelector('.lab-disclosure').textContent, /hypothetical/);
const answers = [...document.querySelectorAll('[data-answer]')];
assert.equal(answers.length, 3);
assert.equal(document.querySelectorAll('.lab-choice-details details').length, 0);
assert.equal(document.querySelectorAll('.lab-choice-badge').length, 0);
assert.equal(document.querySelectorAll('[role="radio"]').length, 3);
const responses = new Set();
const challenges = new Set();
for (const answer of answers) {
 answer.click();
 responses.add(document.querySelector('.lab-assessment').textContent);
 assert.equal(answer.getAttribute('aria-checked'), 'true');
 assert.equal(document.querySelectorAll('.lab-choice-details details').length, 2);
 challenges.add(document.querySelector('.lab-choice-details').textContent);
 assert.equal(document.querySelectorAll('.lab-choice-badge').length, answer.dataset.answer === 'test' ? 1 : 0);
}
assert.equal(responses.size, 3);
assert.equal(challenges.size, 3);
assert.equal(document.querySelector('.lab-choice-badge').textContent, 'Katya’s choice');
answers[0].click();
assert.equal(document.querySelectorAll('.lab-choice-badge').length, 0);
assert.equal(document.querySelectorAll('.lab-my-choice').length, 0);
answers[2].click();
// A native double-click emits two click events before dblclick.
answers[2].click();
answers[2].dispatchEvent(new window.Event('dblclick', {bubbles:true}));
assert.ok(answers.every(answer => answer.getAttribute('aria-checked') === 'false'));
assert.equal(document.querySelectorAll('.lab-choice-badge').length, 0);
assert.equal(document.querySelectorAll('.lab-choice-details details').length, 0);
assert.match(document.querySelector('.lab-assessment').textContent, /Choose an answer/);
answers[1].click();
const escape = new window.Event('keydown', {bubbles:true, cancelable:true});
Object.defineProperty(escape, 'key', {value:'Escape'});
answers[1].dispatchEvent(escape);
assert.ok(answers.every(answer => answer.getAttribute('aria-checked') === 'false'));
const select = document.querySelector('#lab-scenario');
for (const [value, hours] of [['low','3,000'],['base','17,000'],['high','45,000']]) { Object.defineProperty(select, 'value', {value, configurable:true}); select.dispatchEvent(new window.Event('change')); assert.ok(document.querySelector('#lab-model').textContent.includes(hours)); }
assert.equal(document.querySelectorAll('.lab-paths').length,0);
assert.ok(document.querySelectorAll('.lab-slide a').length >= 6);
console.log('Passed: 8 slides, navigation, keyboard, restart, all 3 assessments, 3 model scenarios, reasoning paths and citations.');

assert.match(slides[0].textContent, /2,000 employees, including 600 scientists/);
assert.doesNotMatch(slides[2].textContent, /600|Incyte|scientist users/);

assert.doesNotMatch(slides[2].textContent, /McKinsey|2012|65%|7.6h/);
assert.match(slides[2].textContent, /2025/);
assert.match(slides[2].textContent, /2024/);
assert.doesNotMatch(slides[2].textContent, /What recent evidence says about search gains/);
assert.match(slides[2].textContent, /Scenario assumption/);
assert.ok(!document.querySelector('a[href="https://www.benchling.com/digital-assessment"]'));

assert.equal(document.querySelectorAll('.lab-more').length, 5);
for (const index of [2,3,4,6,7]) {
 assert.ok(slides[index].querySelector('.lab-slide-summary'));
 assert.ok(!slides[index].querySelector('.lab-more').hasAttribute('open'));
}
assert.equal(document.querySelector('.lab-slides').getAttribute('tabindex'), '0');
document.querySelector('.lab-slides').scrollTop = 180;
next.click();
assert.equal(document.querySelector('.lab-slides').scrollTop, 0);
