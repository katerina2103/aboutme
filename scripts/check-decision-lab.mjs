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
const originalComparison = document.querySelector('.business-table--transpose').cloneNode(true);
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
assert.equal(document.querySelectorAll('.comparison-table tbody tr:not([hidden])').length,3);
extra.checked = false; extra.dispatchEvent(new window.Event('change'));
assert.equal(document.querySelectorAll('.comparison-table tbody tr:not([hidden])').length,2);
// Every cell opens readable details and retains its original reference URLs.
const normalize = value => value.replace(/\s+/g, ' ').trim();
for (const row of document.querySelectorAll('.comparison-table tbody tr')) {
 const originalHeader = originalComparison.querySelector('thead [data-option="'+row.dataset.option+'"]');
 assert.equal(normalize(row.querySelector('th').textContent), normalize(originalHeader.textContent));
 for (const button of row.querySelectorAll('.comparison-cell')) {
  const source = originalComparison.querySelectorAll('tbody tr')[Number(button.dataset.criterion)].querySelector('[data-option="'+row.dataset.option+'"]');
  button.click();
  const detail = document.querySelector('.comparison-cell-detail');
  assert.equal(detail.hidden, false);
  assert.ok(detail.querySelector('.comparison-cell-content').textContent.trim());
  assert.ok(![...detail.querySelectorAll('p')].some(p => /^\s*\+/.test(p.textContent)));
  for (const link of source.querySelectorAll('a')) assert.ok([...detail.querySelectorAll('a')].some(a => a.href === link.href));
  assert.equal(button.getAttribute('aria-expanded'), 'true');
 }
}
assert.equal(document.querySelector('.comparison-dialog'), null);
assert.equal(document.querySelector('.comparison-expand'), null);
assert.ok(![...document.querySelectorAll('summary')].some(s=>s.textContent.includes('Cost basis, exclusions and source dates')));
assert.ok(![...document.querySelectorAll('summary')].some(s=>s.textContent.includes('How to read this comparison')));
document.querySelector('.comparison-table [data-option="haystack"] [data-criterion="0"]').click();
let contextText = document.querySelector('.comparison-cell-content').textContent;
assert.ok(contextText.includes('€120–168k'));
assert.ok(contextText.includes('VAT'));
assert.ok(contextText.includes('28 October 2026'));
assert.ok(contextText.includes('Backend / platform'));
assert.ok(contextText.includes('€40–120k'));
assert.ok(document.querySelector('.comparison-cell-content .lab-cost-axis'));
assert.equal(document.querySelector('.comparison-estimate-basis').hasAttribute('open'), false);
document.querySelector('.comparison-table [data-option="glean"] [data-criterion="0"]').click();
assert.ok(document.querySelector('.comparison-cell-content').textContent.includes('unquoted supplier fees are excluded'));
document.querySelector('.comparison-table [data-option="glean"] [data-criterion="4"]').click();
contextText = document.querySelector('.comparison-cell-content').textContent;
assert.ok(contextText.includes('permitted countries'));
assert.ok(contextText.includes('No option has passed'));
assert.ok(contextText.includes('European hosting alone'));
assert.ok(!contextText.includes('VAT'));
document.querySelector('.comparison-table [data-option="benchling"] [data-criterion="2"]').click();
assert.ok(document.querySelector('.comparison-cell-content').textContent.includes('13 November 2026'));
const strategy = document.querySelector('.strategy-lab');
assert.ok(strategy, 'Strategic trade-offs step should exist');
assert.equal(document.querySelector('[data-strategy-score="glean"]').textContent, '3.20 / 5');
const scientific = strategy.querySelector('[value="scientific"]');
strategy.querySelector('[value="acquisition"]').removeAttribute('checked');
scientific.setAttribute('checked', '');
scientific.dispatchEvent(new window.Event('change'));
assert.equal(document.querySelector('[data-strategy-score="hybrid"]').textContent, '3.40 / 5');
const challenge = document.querySelector('[data-ceo-view="challenge"]');
challenge.click();
assert.equal(document.querySelector('[data-ceo-panel="challenge"]').hidden, false);
assert.equal(document.querySelector('[data-ceo-panel="recommendation"]').hidden, true);
console.log('Passed: nine-slide navigation, restart, answer feedback/clearing, comparison selection, and all story/principle references.');
