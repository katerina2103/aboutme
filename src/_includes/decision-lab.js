(() => {
  const lab = document.querySelector(".decision-lab");
  if (!lab) return;
  const section = lab.closest(".lab-section");
  const slides = [...lab.querySelectorAll(".lab-slide")];
  const controls = lab.querySelector(".lab-controls");
  const previous = lab.querySelector(".lab-prev");
  const next = lab.querySelector(".lab-next");
  const count = lab.querySelector(".lab-count");
  const progress = lab.querySelector(".lab-progress");
  const stepTopics = [
    'Your decision', 'Evidence and discovery',
    'Compare solutions', 'Strategic trade-offs', 'Design the pilot',
    'Investment decision', 'What we could build', 'Wrap-up',
  ];
  const segments = slides.map((_, index) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'lab-step-tile';
    tile.textContent = index + 1;
    tile.setAttribute('aria-label', `Step ${index + 1}: ${stepTopics[index]}`);
    const tip = document.createElement('span');
    tip.className = 'lab-step-tip';
    tip.setAttribute('aria-hidden', 'true');
    tip.textContent = stepTopics[index];
    tile.append(tip);
    tile.addEventListener('click', () => show(index));
    tile.addEventListener('keydown', event => {
      if (event.key === 'Escape') tile.classList.add('tip-dismissed');
    });
    tile.addEventListener('blur', () => tile.classList.remove('tip-dismissed'));
    tile.addEventListener('pointerleave', () => tile.classList.remove('tip-dismissed'));
    progress.append(tile);
    return tile;
  });
  const labels = JSON.parse(document.getElementById("lab-content").textContent);
  const celebration = lab.querySelector('.lab-celebration__gif');
  const celebrationToggle = lab.querySelector('.lab-celebration__toggle');
  const celebrationLabels = JSON.parse(document.getElementById('lab-celebration-content').textContent);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const confetti = document.createElement('div');
  confetti.className = 'lab-confetti';
  confetti.setAttribute('aria-hidden', 'true');
  slides[slides.length - 1].append(confetti);
  function burstConfetti() {
    if (reducedMotion.matches) return;
    for (let i = 0; i < 42; i++) {
      const piece = document.createElement('span');
      piece.className = 'lab-confetti__piece';
      piece.style.setProperty('--x', (Math.random() * 100) + '%');
      piece.style.setProperty('--drift', (Math.random() * 140 - 70) + 'px');
      piece.style.setProperty('--delay', (Math.random() * 0.35) + 's');
      piece.style.setProperty('--duration', (2.2 + Math.random() * 0.8) + 's');
      piece.style.setProperty('--spin', (Math.random() * 900 - 450) + 'deg');
      piece.style.setProperty('--confetti-color', ['#ffd36d', '#3658b5', '#ef8b83', '#7ebda8'][i % 4]);
      piece.addEventListener('animationend', () => piece.remove(), {once: true});
      confetti.append(piece);
    }
  }
  function celebrate(play) {
    if (!play) confetti.replaceChildren();
    celebration.hidden = !play;
    if (play) celebration.src = celebration.dataset.src;
    else celebration.removeAttribute('src');
    celebrationToggle.textContent = play ? celebrationLabels.stop_label : celebrationLabels.play_label;
  }
  celebrationToggle.addEventListener('click', () => celebrate(celebration.hidden));
  let current = 0;
  const headings = slides.map(slide => slide.querySelector('.dilemma__title'));
  const nextLabels = [
    'Scope the problem', 'Compare options', 'Weigh trade-offs',
    'Design the pilot', 'Decide what to fund', 'Plan what to build',
    'Wrap up the case',
  ];
  function show(index, moveFocus = true) {
    const previousIndex = current;
    current = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    lab.querySelector(".lab-slides").scrollTop = 0;
    celebrate(current === slides.length - 1 && !reducedMotion.matches);
    if (current === slides.length - 1 && previousIndex !== current) burstConfetti();
    previous.disabled = current === 0;
    next.textContent = current === slides.length - 1 ? labels.restart_label : `Next: ${nextLabels[current]} →`;
    next.removeAttribute('aria-label');
    previous.setAttribute('aria-label', labels.previous_label);
    count.textContent = labels.position_label.replace('{current}', current + 1).replace('{total}', slides.length);
    segments.forEach((tile, i) => {
      tile.classList.toggle('is-past', i < current);
      if (i === current) tile.setAttribute('aria-current', 'step');
      else tile.removeAttribute('aria-current');
    });
    const heading = headings[current];
    heading.setAttribute('tabindex', '-1');
    heading.setAttribute('aria-describedby', count.id);
    if (moveFocus) {
      heading.focus?.({preventScroll: true});
      heading.scrollIntoView?.({block: 'start', behavior: 'instant'});
    }
  }
  count.id = 'lab-step-count';
  section.querySelectorAll('[data-lab-target]').forEach(button => {
    const index = slides.findIndex(slide => slide.dataset.labStage === button.dataset.labTarget);
    button.addEventListener('click', () => show(index));
  });
  section.querySelector('.lab-jump').hidden = false;
  previous.addEventListener("click", () => show(current - 1));
  next.addEventListener("click", () => show(current === slides.length - 1 ? 0 : current + 1));
  controls.addEventListener("keydown", (event) => {
    if (event.target.closest(".lab-step-tile")) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    show(current + (event.key === "ArrowRight" ? 1 : -1));
    if (previous.disabled && document.activeElement === previous) next.focus();
  });
  lab.classList.add("lab-ready");
  controls.hidden = false;
  show(0, false);

})();

(() => {
 const lab=document.querySelector('.decision-lab');
 const labels = JSON.parse(document.getElementById("lab-content").textContent);
 const feedback = labels.answers;
 const answerHint = lab.querySelector('.lab-answer-hint');
 const defaultAnswerHint = answerHint.textContent;
 const handoffChoice = lab.querySelector('.lab-handoff-choice');
 const handoffRoute = lab.querySelector('.lab-handoff-route');
 function updateHandoff(answer) {
   handoffRoute.textContent = answer === 'test' ? labels.handoff.agreement_route : labels.handoff.route;
   handoffChoice.textContent = answer
     ? labels.handoff.selected.replace('{choice}', labels.handoff.choices[answer]) + ' '
     : '';
 }
 lab.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => {
   lab.querySelectorAll('[data-answer]').forEach(other => {
     other.setAttribute('aria-checked', String(other === button));
     other.classList.toggle('lab-my-choice', other.dataset.answer === 'test');
     const badge = other.querySelector('.lab-choice-badge');
     if (badge) badge.remove();
   });
   updateHandoff(button.dataset.answer);
   answerHint.textContent = button.dataset.answer === 'test' ? labels.agreement_hint : defaultAnswerHint;
   const choice = feedback[button.dataset.answer];
   {
     const badge = document.createElement('span');
     badge.className = 'lab-choice-badge';
     badge.textContent = labels.choice_label;
     lab.querySelector('[data-answer="test"]').append(badge);
   }
   lab.querySelector('.lab-assessment').textContent = choice.assessment;
   lab.querySelector('.lab-choice-details').innerHTML =
     '<details><summary>' + labels.challenge_label + '</summary><p>' + choice.challenge + '</p></details>' +
     '<details><summary>' + labels.reconsider_label + '</summary><p>' + choice.change + '</p></details>';
 }));
 const answers = [...lab.querySelectorAll('[data-answer]')];
 function clearAnswer() {
   updateHandoff();
   answerHint.textContent = defaultAnswerHint;
   answers.forEach(button => {
     button.setAttribute('aria-checked', 'false');
     button.classList.remove('lab-my-choice');
     button.querySelector('.lab-choice-badge')?.remove();
   });
   lab.querySelector('.lab-assessment').textContent = ''; 
   lab.querySelector('.lab-choice-details').replaceChildren();
 }
 answers.forEach((button, index) => {
   button.addEventListener('dblclick', () => {
     if (button.getAttribute('aria-checked') === 'true') clearAnswer();
   });
   button.addEventListener('keydown', event => {
     if (event.key === 'Escape') { event.preventDefault(); clearAnswer(); return; }
     const direction = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1}[event.key];
     if (!direction) return;
     event.preventDefault();
     const target = answers[(index + direction + answers.length) % answers.length];
     target.click();
     target.focus();
   });
 });
})();

(() => {
 const lab = document.querySelector('.decision-lab');
 const labels = JSON.parse(document.getElementById("lab-content").textContent);
 const choices = [...lab.querySelectorAll('[data-compare]')];
 const original = lab.querySelector('.business-table--transpose');
 const optionHeaders = [...original.querySelectorAll('thead [data-option]')];
 const criteriaRows = [...original.querySelectorAll('tbody tr')];
 const context = JSON.parse(document.getElementById('comparison-context').textContent);
 function addParagraph(parent, label, text) {
  const p = document.createElement('p');
  if (label) { const strong = document.createElement('strong'); strong.textContent = label + ': '; p.append(strong); }
  p.append(document.createTextNode(text)); parent.append(p);
 }
 function fillDetail(content, source, option, index) {
  if (index === 0) {
   const cost = context.visual_costs.find(item => item.option === option);
   addParagraph(content, 'Planning estimate', cost.amount + ' for year one · ' + cost.team + '.');
   ['.lab-cost-range', '.lab-cost-axis'].forEach(selector => content.append(source.querySelector(selector).cloneNode(true)));
   const breakdown = {
    copilot: ['Included', 'Internal staff and service / usage allowances.'],
    glean: ['Included', 'Internal staff and service allowances.'],
    benchling: ['Included', 'Internal staff and integration allowances.'],
    haystack: ['Included', 'Staff: €480k–1.01m. Infrastructure and APIs: €40–120k.'],
    custom: ['Included', 'Staff: €840k–1.68m. Infrastructure and APIs: €80–200k.']
   }[option];
   addParagraph(content, ...breakdown);
   const extras = {
    copilot: 'Add US$216k a year for 600 seats at US$30 per user per month, plus qualifying M365 licences. Other unquoted supplier fees are excluded. This is not a complete total; USD and EUR have not been converted.',
    glean: 'Obtain a supplier quote. No verified public list price was available in the case research; unquoted supplier fees are excluded from this estimate.',
    benchling: 'Obtain a quote for the platform, AI, usage and any migration. These costs are excluded from this estimate.'
   }[option];
   if (extras) addParagraph(content, 'Still to price', extras);
   if (option === 'haystack' || option === 'custom') addParagraph(content, 'Team responsibilities', option === 'haystack' ? context.backend_platform_data_integration_retrieval_evaluation_product : 'The Haystack route’s capabilities, plus frontend development, QA and reliability.');
   const basis = document.createElement('details'); basis.className = 'comparison-estimate-basis';
   const summary = document.createElement('summary'); summary.textContent = 'Estimate assumptions and exclusions'; basis.append(summary);
   addParagraph(basis, '', 'Illustrative case assumptions, not supplier quotes or market averages. Loaded staff cost: €120–168k per FTE-year, including allocated internal time. Year-two staffing may remain similar.');
   addParagraph(basis, 'Excluded', 'VAT, major data remediation, whole-platform replacement and foundation-model training.');
   addParagraph(basis, 'Cost basis', 'Case research dated 28 October 2026. The bar marks the lower and upper planning estimates.');
   content.append(basis);
  } else {
   const main = source.cloneNode(true); main.querySelectorAll('span').forEach(node => node.remove());
   addParagraph(content, index === 1 ? 'Value' : index === 5 ? 'Before committing' : 'Available capability', main.textContent.trim());
   const secondary = source.querySelector('span');
   if (secondary) {
    const copy = secondary.cloneNode(true); copy.querySelectorAll('a').forEach(node => node.remove());
    addParagraph(content, index === 1 ? 'Trade-off' : 'What this means', copy.textContent.trim());
   }
   const checks = {
    1: 'Test this trade-off on our researchers’ tasks before choosing a solution.',
    2: 'Verify source coverage, permissions and answer quality on our lab systems. Documentation review: 13 November 2026.',
    3: 'Test an exit plan for our data, configuration and workflows. These are architectural assessments, not measured vendor scores.',
    4: 'Agree permitted countries for storage, processing and remote access. Check the deployment, model providers and contract; European hosting alone is insufficient. No option has passed this check yet.'
   };
   if (checks[index]) addParagraph(content, 'Validate', checks[index]);
  }
  const connectorEvidence = index === 2 ? context.connector_evidence[option] : null;
  if (connectorEvidence) addParagraph(content, 'Connector catalog', connectorEvidence.detail);
  const sources = [...source.querySelectorAll('a')].map(a => ({url:a.getAttribute('href'), label:a.textContent.trim()}));
  if (connectorEvidence) sources.push(...connectorEvidence.sources);
  if (index === 0 && option === 'copilot') sources.push({url:context.source_link_1, label:'Microsoft Copilot pricing'});
  if (index === 1 || index === 5) {
   const header = optionHeaders.find(header => header.dataset.option === option)?.querySelector('a');
   if (header) sources.push({url:header.getAttribute('href'), label:'Solution documentation'});
  }
  if (sources.length) {
   const references = document.createElement('p'); references.className = 'comparison-detail-sources';
   const label = document.createElement('strong'); label.textContent = 'References: '; references.append(label);
   const seen = new Set();
   sources.forEach(item => {
    if (seen.has(item.url)) return;
    if (seen.size) references.append(document.createTextNode(' · '));
    seen.add(item.url); const link = document.createElement('a'); link.href=item.url;
    link.textContent=item.label; link.target='_blank'; link.rel='noopener noreferrer'; references.append(link);
   });
   content.append(references);
  }
 }
 const scroll = original.parentElement;
 const workspace = document.createElement('section');
 workspace.className = 'comparison-workspace';
 const picker = lab.querySelector('.compare-picker');
 picker.before(workspace);
 let sibling = picker;
 while (sibling) {
  const following = sibling.nextElementSibling;
  workspace.append(sibling);
  if (sibling.classList.contains('business-scroll-hint')) break;
  sibling = following;
 }
 const detail = document.createElement('section');
 detail.className = 'comparison-cell-detail'; detail.id = 'comparison-cell-detail';
 detail.setAttribute('aria-live', 'polite'); detail.hidden = true;
 scroll.after(detail);
 const table = document.createElement('table');
 table.className = 'business-table comparison-table';
 table.setAttribute('aria-label', original.getAttribute('aria-label'));
 const head = document.createElement('thead'), heading = document.createElement('tr');
 heading.append(original.querySelector('thead th').cloneNode(true));
 criteriaRows.forEach(row => {
  const th = row.querySelector('th').cloneNode(true);
  th.setAttribute('scope', 'col'); heading.append(th);
 });
 head.append(heading); table.append(head);
 const body = document.createElement('tbody');
 let activeCell;
 optionHeaders.forEach(option => {
  const row = document.createElement('tr'); row.dataset.option = option.dataset.option;
  const name = option.cloneNode(true); name.removeAttribute('data-option');
  name.removeAttribute('hidden'); name.setAttribute('scope', 'row'); row.append(name);
  criteriaRows.forEach((criterion, index) => {
   const source = criterion.querySelector('[data-option="' + option.dataset.option + '"]');
   const td = document.createElement('td'), button = document.createElement('button');
   button.type = 'button'; button.className = 'comparison-cell';
   button.dataset.criterion = String(index);
   const summary = source.cloneNode(true);
   summary.querySelectorAll('span, .lab-cost-range, .lab-cost-axis').forEach(node => node.remove());
   button.textContent = summary.textContent.trim();
   if (source.querySelector('.lab-cost-value')) {
    button.classList.add('comparison-cell--cost');
    const team = document.createElement('span');
    team.textContent = source.querySelector('span').textContent;
    button.append(team);
    const estimate = context.visual_costs.find(cost => cost.option === option.dataset.option)?.infrastructure_note;
    if (estimate) {
     const infrastructure = document.createElement('small');
     infrastructure.className = 'comparison-infrastructure';
     infrastructure.textContent = estimate; button.append(infrastructure);
    }
   }
   if (index === 2) {
    button.classList.add('comparison-cell--integration');
    const count = document.createElement('small'); count.className = 'comparison-infrastructure';
    count.textContent = context.connector_evidence[option.dataset.option].summary; button.append(count);
   }
   button.setAttribute('aria-expanded', 'false');
   button.setAttribute('aria-controls', detail.id);
   button.addEventListener('click', () => {
    if (activeCell) activeCell.setAttribute('aria-expanded', 'false');
    activeCell = button; button.setAttribute('aria-expanded', 'true');
    const title = document.createElement('h3');
    title.textContent = option.childNodes[0].textContent.trim() + ' — ' + criterion.querySelector('th').childNodes[0].textContent.trim();
    const content = document.createElement('div');
    content.className = 'comparison-cell-content';
    fillDetail(content, source, option.dataset.option, index);
    detail.replaceChildren(title, content);
    detail.hidden = false;
    detail.scrollIntoView?.({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest', inline: 'nearest'});
   });
   td.append(button); row.append(td);
  });
  body.append(row);
 });
 table.append(body); original.replaceWith(table);
 function compare() {
  const selected = new Set(choices.filter(input => input.checked).map(input => input.dataset.compare));
  table.querySelectorAll('[data-option]').forEach(row => { row.hidden = !selected.has(row.dataset.option); });
  workspace.querySelector('.compare-status').textContent = selected.size ? labels.compare_status.replace('{count}', selected.size) : labels.compare_empty;
  table.hidden = !selected.size;
  if (activeCell && !selected.has(activeCell.closest('tr').dataset.option)) {
   activeCell.setAttribute('aria-expanded', 'false'); activeCell = null; detail.hidden = true;
  }
 }
 choices.forEach(input => input.addEventListener('change', compare));
 compare();
})();


/* Strategic comparison: hypothetical ratings and strategy-dependent weights. */
(() => {
 const lab=document.querySelector('.strategy-lab'); if(!lab) return;
 const ratings=[[4,3,2],[3,4,4],[3,2,1],[3,3,3],[2,4,3]];
 const configurations={
  acquisition:{weights:[30,25,20,15,10],insight:'Glean narrowly leads. A 0.05-point difference from hybrid does not justify a supplier commitment. Validate scientific access and acquisition integration before deciding.'},
  scientific:{weights:[15,40,15,15,15],insight:'Hybrid leads when scientific differentiation matters most. That does not yet prove custom ownership will pay off: validate the specific workflow gap and full maintenance cost.'},
  cost:{weights:[25,15,35,15,10],insight:'Glean leads provisionally under stronger cost discipline. Vendor fees remain incomplete; obtain a full quote and test total cost before approving a rollout.'}
 };
 const keys=['glean','hybrid','custom'];
 function update(){
  const selected=lab.querySelector('[data-priority][aria-pressed="true"]')?.dataset.priority || 'acquisition';
  const config=configurations[selected];
  const totals=keys.map((_,column)=>ratings.reduce((sum,row,index)=>sum+row[column]*config.weights[index]/100,0));
  keys.forEach((key,i)=>{
   lab.querySelector('[data-strategy-score="'+key+'"]').textContent=totals[i].toFixed(2)+' / 5';
   lab.querySelector('[data-strategy-bar="'+key+'"]').style.width=(totals[i]/5*100)+'%';
   lab.querySelector('[data-strategy-option="'+key+'"]').classList.toggle('strategy-score--leader',totals[i]===Math.max(...totals));
  });
  config.weights.forEach((weight,i)=>lab.querySelector('[data-strategy-weight="'+i+'"]').textContent=weight+'%');
  lab.querySelector('[data-strategy-insight]').textContent=config.insight;
 }
 const priorities = lab.querySelectorAll('[data-priority]');
 priorities.forEach(button => button.addEventListener('click', () => {
  priorities.forEach(option => {
   option.classList.toggle('is-selected', option === button);
   option.setAttribute('aria-pressed', String(option === button));
  });
  update();
 }));
 update();
})();
(() => {
 const section=document.querySelector('.ceo-decision'); if(!section) return;
 section.querySelectorAll('[data-ceo-view]').forEach(button=>button.addEventListener('click',()=>{
  const selection=button.dataset.ceoView;
  section.querySelectorAll('[data-ceo-view]').forEach(b=>{b.classList.toggle('is-selected',b===button);b.setAttribute('aria-pressed',String(b===button));});
  section.querySelectorAll('[data-ceo-panel]').forEach(panel=>{panel.hidden=panel.dataset.ceoPanel!==selection;});
 }));
})();
