// Opens <dialog> overlays from links with data-open-dialog="<id>".
// The link's href (#id) also works as a shareable URL: visiting /#principles opens it.
(() => {
  const origins = new WeakMap();
  const open = (dialog) => {
    if (!dialog || dialog.open || typeof dialog.showModal !== "function") return false;
    origins.set(dialog, document.activeElement);
    dialog.showModal();
    history.replaceState(null, "", `#${dialog.id}`);
    return true;
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-dialog]");
    if (trigger && open(document.getElementById(trigger.dataset.openDialog))) event.preventDefault();
  });

  for (const dialog of document.querySelectorAll("dialog.overlay")) {
    // Click on the dimmed backdrop (outside the panel) closes the overlay.
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    // Remove the #id from the URL again when it closes.
    dialog.addEventListener("close", () => {
      if (location.hash === `#${dialog.id}`) history.replaceState(null, "", location.pathname + location.search + (dialog.dataset.returnHash || ""));
      const origin = origins.get(dialog);
      if (origin?.isConnected) origin.focus({ preventScroll: true });
    });
  }

  const id = decodeURIComponent(location.hash.slice(1));
  const fromUrl = id ? document.getElementById(id) : null;
  if (fromUrl && fromUrl.matches("dialog.overlay")) open(fromUrl);
})();

