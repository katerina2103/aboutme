(() => {
  const lab = document.querySelector(".decision-lab");
  if (!lab) return;
  const slides = [...lab.querySelectorAll(".lab-slide")];
  const controls = lab.querySelector(".lab-controls");
  const previous = lab.querySelector(".lab-prev");
  const next = lab.querySelector(".lab-next");
  const count = lab.querySelector(".lab-count");
  const progress = lab.querySelector(".lab-progress");
  const segments = slides.map(() => {
    const segment = document.createElement("span");
    segment.className = "lab-progress-segment";
    segment.setAttribute("aria-hidden", "true");
    progress.append(segment);
    return segment;
  });
  progress.setAttribute("aria-valuemax", slides.length);
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
  const slideRegion = lab.querySelector('.lab-slides');
  const studySlide = lab.querySelector('.study-stages')?.closest('.lab-slide');
  function fitStudySpacing() {
    if (typeof ResizeObserver === 'undefined' || !studySlide || studySlide.hidden) return;
    if (studySlide.querySelector('.study-stage__methods')?.open) return;
    const availableHeight = slideRegion.clientHeight - 2;
    if (availableHeight <= 0) return;
    let compact = 0;
    let spacious = 1;
    studySlide.style.setProperty('--study-room', '0');
    // Keep readable minimum spacing if the overview cannot fit on a small screen.
    if (studySlide.getBoundingClientRect().height > availableHeight) return;
    for (let pass = 0; pass < 9; pass++) {
      const candidate = (compact + spacious) / 2;
      studySlide.style.setProperty('--study-room', String(candidate));
      if (studySlide.getBoundingClientRect().height <= availableHeight) compact = candidate;
      else spacious = candidate;
    }
    studySlide.style.setProperty('--study-room', String(compact));
  }
  function show(index) {
    const previousIndex = current;
    current = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    lab.querySelector(".lab-slides").scrollTop = 0;
    celebrate(current === slides.length - 1 && !reducedMotion.matches);
    if (current === slides.length - 1 && previousIndex !== current) burstConfetti();
    previous.disabled = current === 0;
    next.textContent = current === slides.length - 1 ? labels.restart_label : labels.next_label;
    next.setAttribute('aria-label', current === slides.length - 1 ? labels.restart_label : labels.next_accessible_label);
    count.textContent = labels.position_label.replace('{current}', current + 1).replace('{total}', slides.length);
    progress.setAttribute("aria-valuenow", current + 1);
    progress.setAttribute("aria-valuetext", labels.slide_position_label.replace('{position}', count.textContent));
    segments.forEach((segment, i) => {
      segment.classList.toggle("is-past", i < current);
      segment.classList.toggle("is-current", i === current);
    });
    fitStudySpacing();
  }
  if (typeof ResizeObserver !== 'undefined' && studySlide) {
    new ResizeObserver(fitStudySpacing).observe(slideRegion);
    document.fonts?.ready.then(fitStudySpacing);
    studySlide.querySelector('.study-stage__methods')?.addEventListener('toggle', fitStudySpacing);
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
     other.classList.toggle('lab-my-choice', other === button && button.dataset.answer === 'test');
     const badge = other.querySelector('.lab-choice-badge');
     if (badge) badge.remove();
   });
   updateHandoff(button.dataset.answer);
   answerHint.textContent = button.dataset.answer === 'test' ? labels.agreement_hint : defaultAnswerHint;
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
 function compare() {
  const selected = new Set(choices.filter(input => input.checked).map(input => input.dataset.compare));
  lab.querySelectorAll('[data-option]').forEach(cell => { cell.hidden = !selected.has(cell.dataset.option); });
  lab.querySelector('.compare-status').textContent = selected.size ? labels.compare_status.replace('{count}', selected.size) : labels.compare_empty;
  lab.querySelector('.business-table--transpose').style.minWidth = selected.size > 2 ? (140 + selected.size * 205) + 'px' : '100%';
 }
 choices.forEach(input => input.addEventListener('change', compare));
 compare();
})();
