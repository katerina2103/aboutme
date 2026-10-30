(() => {
  const lab = document.querySelector(".decision-lab");
  if (!lab) return;
  const slides = [...lab.querySelectorAll(".lab-slide")];
  const controls = lab.querySelector(".lab-controls");
  const previous = lab.querySelector(".lab-prev");
  const next = lab.querySelector(".lab-next");
  const count = lab.querySelector(".lab-count");
  let current = 0;
  function show(index) {
    current = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    lab.querySelector(".lab-slides").scrollTop = 0;
    previous.disabled = current === 0;
    next.textContent = current === slides.length - 1 ? "Start again ↺" : "Next →";
    count.textContent = (current + 1) + " / " + slides.length + " · " + slides[current].querySelector(".lab-step").textContent;
  }
  previous.addEventListener("click", () => show(current - 1));
  next.addEventListener("click", () => show(current === slides.length - 1 ? 0 : current + 1));
  controls.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    show(current + (event.key === "ArrowRight" ? 1 : -1));
    if (previous.disabled && document.activeElement === previous) next.focus();
  });
  lab.classList.add("lab-ready");
  controls.hidden = false;
  show(0);

})();

(() => {
 const lab=document.querySelector('.decision-lab');
 const feedback = {
   build: {
     assessment: 'Build: control can create strategic value, but limited software engineering makes delivery and upkeep risky. I would first test whether a scientific need justifies owning the software.',
     challenge: 'Am I dismissing a strategic capability because the team is small today? A tightly scoped internal product could build expertise and protect differentiated scientific workflows. A pilot must not become an excuse to avoid that commitment.',
     change: 'I would move from option 3 to building if a repeatable scientific need is beyond vendor capabilities, a senior engineering team is committed, and a scoped prototype demonstrates enough value to justify three-year ownership costs.'
   },
   buy: {
     assessment: 'Buy: a reasonable route to faster delivery when existing tools fit. Test lab connectors, permissions, source support and total cost first; procurement alone does not solve scattered knowledge.',
     challenge: 'Am I adding unnecessary experimentation when an existing product already solves this? A short, real-data vendor evaluation could be enough. Rebuilding mature search capabilities would waste time scientists could use now.',
     change: 'I would move from option 3 directly to a bounded vendor rollout if an evaluation on our tasks proves useful answers, correct access controls and source coverage, with lower total cost than the alternatives and committed users.'
   },
   test: {
     assessment: 'Compare a narrow pilot with better search. This is my choice: commit users and owners, compare AI with a simpler workflow, and make a funding decision after eight weeks.',
     challenge: 'Am I funding a pilot before proving AI matters—or creating another round of discovery? Improved search must be a real comparator. Agree who will act on the evidence and when; a polished demo is not the outcome.',
     change: 'I would stop the AI route if improved search performs as well, correction effort erases the gain, or scientists do not return. I would choose a vendor or custom build only when the same task evidence and ownership costs justify it.'
   }
 };
 lab.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => {
   lab.querySelectorAll('[data-answer]').forEach(other => {
     other.setAttribute('aria-checked', String(other === button));
     other.classList.toggle('lab-my-choice', other === button && button.dataset.answer === 'test');
     const badge = other.querySelector('.lab-choice-badge');
     if (badge) badge.remove();
   });
   const choice = feedback[button.dataset.answer];
   if (button.dataset.answer === 'test') {
     const badge = document.createElement('span');
     badge.className = 'lab-choice-badge';
     badge.textContent = 'Katya’s choice';
     button.append(badge);
   }
   lab.querySelector('.lab-assessment').textContent = choice.assessment;
   lab.querySelector('.lab-choice-details').innerHTML =
     '<details><summary>Challenge my reasoning</summary><p>' + choice.challenge + '</p></details>' +
     '<details><summary>What would change my mind</summary><p>' + choice.change + '</p></details>';
 }));
 const answers = [...lab.querySelectorAll('[data-answer]')];
 function clearAnswer() {
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
 const choices = [...lab.querySelectorAll('[data-compare]')];
 function compare() {
  const selected = new Set(choices.filter(input => input.checked).map(input => input.dataset.compare));
  lab.querySelectorAll('[data-option]').forEach(cell => { cell.hidden = !selected.has(cell.dataset.option); });
  lab.querySelector('.compare-status').textContent = selected.size ? `Comparing ${selected.size} option${selected.size === 1 ? '' : 's'}` : 'Select at least one option to compare.';
  lab.querySelector('.business-table--transpose').style.minWidth = selected.size > 2 ? (140 + selected.size * 205) + 'px' : '100%';
 }
 choices.forEach(input => input.addEventListener('change', compare));
 compare();
})();
