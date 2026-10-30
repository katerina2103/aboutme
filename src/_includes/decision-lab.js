(() => {
  const lab = document.querySelector(".decision-lab");
  if (!lab) return;
  const slides = [...lab.querySelectorAll(".lab-slide")];
  const controls = lab.querySelector(".lab-controls");
  const previous = lab.querySelector(".lab-prev");
  const next = lab.querySelector(".lab-next");
  const count = lab.querySelector(".lab-count");
  const labels = JSON.parse(document.getElementById("lab-content").textContent);
  let current = 0;
  function show(index) {
    current = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    lab.querySelector(".lab-slides").scrollTop = 0;
    previous.disabled = current === 0;
    next.textContent = current === slides.length - 1 ? labels.restart_label : labels.next_label;
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
 const labels = JSON.parse(document.getElementById("lab-content").textContent);
 const feedback = labels.answers;
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
     badge.textContent = labels.choice_label;
     button.append(badge);
   }
   lab.querySelector('.lab-assessment').textContent = choice.assessment;
   lab.querySelector('.lab-choice-details').innerHTML =
     '<details><summary>' + labels.challenge_label + '</summary><p>' + choice.challenge + '</p></details>' +
     '<details><summary>' + labels.reconsider_label + '</summary><p>' + choice.change + '</p></details>';
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
 const labels = JSON.parse(document.getElementById("lab-content").textContent);
 const choices = [...lab.querySelectorAll('[data-compare]')];
 function compare() {
  const selected = new Set(choices.filter(input => input.checked).map(input => input.dataset.compare));
  lab.querySelectorAll('[data-option]').forEach(cell => { cell.hidden = !selected.has(cell.dataset.option); });
  lab.querySelector('.compare-status').textContent = selected.size ? labels.compare_status.replace('{count}', selected.size) : labels.compare_empty;
  lab.querySelector('.business-table--transpose').style.minWidth = selected.size > 2 ? (140 + selected.size * 205) + 'px' : '100%';
 }
 choices.forEach(input => input.addEventListener('change', compare));
 compare();
})();
