import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';
import { loadContent } from './load-content.mjs';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const script = await readFile(new URL('../src/_includes/dialogs.js', import.meta.url), 'utf8');
const site = await loadContent(new URL('../content/', import.meta.url).pathname);

function setup(hash = '') {
  const { document, window } = parseHTML(html);
  const location = { hash, pathname: '/aboutme/', search: '' };
  let focused;
  for (const element of document.querySelectorAll('.case-tab, .impact-card')) {
    element.focus = () => { focused = element; };
  }
  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.showModal = () => { dialog.open = true; };
    dialog.close = () => {
      dialog.open = false;
      dialog.dispatchEvent(new window.Event('close'));
    };
  }
  const history = { replaceState(_state, _title, url) {
    location.hash = url.includes('#') ? `#${url.split('#')[1]}` : '';
  } };
  vm.runInNewContext(script, { document, location, history });
  return { document, window, location, focused: () => focused };
}

const app = setup();
assert.equal(app.document.querySelectorAll('dialog[id^="principles-"]').length, 0);
assert.equal(app.document.querySelectorAll('dialog.case-overlay').length, site.experience.case_studies.length);

for (const card of site.experience.case_studies) {
  const dialog = app.document.getElementById(`case-${card.detail}`);
  const storyTab = dialog.querySelector('[data-case-tab="story"]');
  const principlesTab = dialog.querySelector('[data-case-tab="principles"]');
  const story = app.document.getElementById(storyTab.getAttribute('aria-controls'));
  const principles = app.document.getElementById(principlesTab.getAttribute('aria-controls'));
  assert.equal(principlesTab.textContent.trim(), 'My working principles');
  assert.equal(principles.hidden, true);
  assert.equal(principles.querySelector('.overlay__intro'), null);
  assert.equal(principles.textContent.includes(card.title), false);
  assert.equal(dialog.querySelector('[data-open-dialog]'), null);
  const expected = site.case_studies[card.detail].principles.map(id => site.principles[id].title);
  assert.deepEqual([...principles.querySelectorAll('h3')].map(h => h.textContent), expected);

  app.document.querySelector(`[data-open-dialog="${dialog.id}"]`).click();
  assert.equal(dialog.open, true);
  story.scrollTop = 135;
  principlesTab.click();
  assert.equal(story.hidden, true);
  assert.equal(principles.hidden, false);
  assert.equal(principlesTab.getAttribute('aria-selected'), 'true');
  assert.equal(app.location.hash, `#${principles.id}`);
  principles.scrollTop = 42;
  storyTab.click();
  assert.equal(story.hidden, false);
  assert.equal(principles.hidden, true);
  assert.equal(story.scrollTop, 135);
  assert.equal(app.location.hash, `#${dialog.id}`);

  const key = new app.window.Event('keydown', { bubbles: true, cancelable: true });
  key.key = 'ArrowRight';
  storyTab.dispatchEvent(key);
  assert.equal(principles.hidden, false);
  assert.equal(principles.scrollTop, 42);
  assert.equal(app.focused(), principlesTab);
  dialog.close();
  assert.equal(app.location.hash, '#work');
}

const card = site.experience.case_studies[0];
const linked = setup(`#principles-${card.detail}`);
assert.equal(linked.document.getElementById(`case-${card.detail}`).open, true);
assert.equal(linked.document.getElementById(`principles-${card.detail}`).hidden, false);
assert.equal(linked.document.getElementById(`story-${card.detail}`).hidden, true);
console.log('Passed: all story tabs, principle references, keyboard navigation, reading positions, closing and existing principles links.');
