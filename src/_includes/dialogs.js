// Impact stories use one dialog with separate story and principles tabs.
(() => {
  const origins = new WeakMap();
  const tabControllers = new WeakMap();
  const currentId = () => {
    try { return decodeURIComponent(location.hash.slice(1)); }
    catch { return ""; }
  };

  for (const dialog of document.querySelectorAll("dialog.case-overlay")) {
    const tabs = [...dialog.querySelectorAll("[data-case-tab]")];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute("aria-controls")));
    const scrollPositions = new Map();
    const activate = (name, updateUrl = false) => {
      const selected = tabs.find(tab => tab.dataset.caseTab === name);
      if (!selected) return;
      panels.forEach(panel => {
        if (!panel.hidden) scrollPositions.set(panel, panel.scrollTop);
      });
      tabs.forEach((tab, index) => {
        const active = tab === selected;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[index].hidden = !active;
        if (active) panels[index].scrollTop = scrollPositions.get(panels[index]) || 0;
      });
      if (updateUrl) {
        const id = name === "story" ? dialog.id : selected.getAttribute("aria-controls");
        history.replaceState(null, "", `#${id}`);
      }
    };
    tabControllers.set(dialog, activate);
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab.dataset.caseTab, true));
      tab.addEventListener("keydown", event => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(tabs[next].dataset.caseTab, true);
        tabs[next].focus({ preventScroll: true });
      });
    });
  }

  const open = (dialog, tab = "story") => {
    if (!dialog || dialog.open || typeof dialog.showModal !== "function") return false;
    origins.set(dialog, document.activeElement);
    dialog.showModal();
    tabControllers.get(dialog)?.(tab);
    const selected = dialog.querySelector('[data-case-tab][aria-selected="true"]');
    const id = tab === "principles" && selected ? selected.getAttribute("aria-controls") : dialog.id;
    history.replaceState(null, "", `#${id}`);
    return true;
  };

  document.addEventListener("click", event => {
    const trigger = event.target.closest("[data-open-dialog]");
    if (trigger && open(document.getElementById(trigger.dataset.openDialog))) event.preventDefault();
  });

  for (const dialog of document.querySelectorAll("dialog.overlay")) {
    dialog.addEventListener("click", event => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      const target = document.getElementById(currentId());
      if (target === dialog || (target && dialog.contains(target))) {
        history.replaceState(null, "", location.pathname + location.search + (dialog.dataset.returnHash || ""));
      }
      const origin = origins.get(dialog);
      if (origin?.isConnected) origin.focus({ preventScroll: true });
    });
  }

  const fromUrl = document.getElementById(currentId());
  if (fromUrl?.matches("dialog.overlay")) open(fromUrl);
  // Keep previously shared principles links working in the new tab.
  else if (fromUrl?.matches(".case-tab-panel")) {
    open(fromUrl.closest("dialog.case-overlay"), fromUrl.id.startsWith("principles-") ? "principles" : "story");
  }
})();

