import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';
import { loadContent } from './load-content.mjs';
const site = await loadContent(new URL('../content/', import.meta.url).pathname);
assert.equal(Object.keys(site.principles).length, 14);
assert.equal(Object.keys(site.case_studies).length, 3);
for (const story of Object.values(site.case_studies)) {
 assert.ok(new Set(story.principles).size >= 3);
 story.principles.forEach(id => assert.ok(site.principles[id]));
}
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const { document, window } = parseHTML(html);
const script = await readFile(new URL('../src/_includes/decision-lab.js', import.meta.url), 'utf8');
// Linkedom does not implement the native checkbox checked property.
document.querySelectorAll("[data-compare]").forEach(input => { input.checked = input.hasAttribute("checked"); });
vm.runInNewContext(script, {document, window: {matchMedia: () => ({matches: false})}});
const slides = [...document.querySelectorAll('.lab-slide')];
const next = document.querySelector('.lab-next');
const previous = document.querySelector('.lab-prev');
assert.equal(slides.length, 9);
for(let index = 0; index < slides.length; index++) {
 assert.equal(slides.filter(s => !s.hidden).length, 1);
 assert.equal(slides[index].hidden, false);
 assert.equal(document.querySelector('.lab-count').textContent, `${index + 1} of 9`);
 if(index < slides.length - 1) next.click();
}
assert.equal(next.textContent, site.decision_lab.restart_label);
next.click(); assert.equal(slides[0].hidden, false); assert.equal(previous.disabled, true);
const responses = new Set();
for (const answer of document.querySelectorAll('[data-answer]')) {
 answer.click(); responses.add(document.querySelector('.lab-assessment').textContent);
 assert.equal(answer.getAttribute('aria-checked'), 'true');
 assert.equal(document.querySelectorAll('.lab-choice-details details').length, 2);
 answer.dispatchEvent(new window.Event('dblclick', {bubbles:true}));
 assert.equal(answer.getAttribute('aria-checked'), 'false');
 assert.equal(document.querySelector('.lab-assessment').textContent, '');
}
assert.equal(responses.size, 3);
const selected = [...document.querySelectorAll('[data-compare]')].filter(e=>e.checked);
assert.deepEqual(selected.map(e=>e.dataset.compare), ['glean','custom']);
const extra = document.querySelector('[data-compare="benchling"]');
extra.checked = true; extra.dispatchEvent(new window.Event('change'));
assert.equal(document.querySelectorAll('thead [data-option]:not([hidden])').length,3);
extra.checked = false; extra.dispatchEvent(new window.Event('change'));
assert.equal(document.querySelectorAll('thead [data-option]:not([hidden])').length,2);
const strategy = document.querySelector('.strategy-lab');
assert.ok(strategy, 'Strategic trade-offs step should exist');
assert.equal(document.querySelector('[data-strategy-score="glean"]').textContent, '3.20 / 5');
const scientific = strategy.querySelector('[value="scientific"]');
strategy.querySelector('[value="acquisition"]').checked = false;
scientific.checked = true;
scientific.dispatchEvent(new window.Event('change'));
assert.equal(document.querySelector('[data-strategy-score="hybrid"]').textContent, '3.40 / 5');
const challenge = document.querySelector('[data-ceo-view="challenge"]');
challenge.click();
assert.equal(document.querySelector('[data-ceo-panel="challenge"]').hidden, false);
assert.equal(document.querySelector('[data-ceo-panel="recommendation"]').hidden, true);
console.log('Passed: nine-slide navigation, restart, answer feedback/clearing, comparison selection, and all story/principle references.');
