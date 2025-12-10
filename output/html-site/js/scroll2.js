// Highlight links in `contentNavigationSource` based on scroll position.
// When a header (h2–h6) crosses 1/4 of the viewport height, its corresponding
// link (with id 'a' + headerId) is made bold.



(function() {
  function getFocusRuler() {
    return Math.floor(window.innerHeight / 4);
  }

  function setActiveHeader(headerId) {
    if (!headerId) return;
    const navContainer = document.getElementById('contentNavigationSource');
    if (!navContainer) return;

    const links = navContainer.querySelectorAll('a');
    links.forEach(link => {
      link.classList.remove('font-bold');
      link.style.fontWeight = '';
    });

    const target = document.getElementById('a' + headerId);
    if (target) {
      target.classList.add('font-bold');
      // Force bold even if classes are overridden by CSS
      target.style.fontWeight = '700';
      if (window.console && console.debug) {
        console.debug('[scroll2] Active header link =>', 'a' + headerId);
      }
    }
  }

  function getCurrentHeaderId(focusRulerPx) {
    const headers = document.querySelectorAll('h2,h3,h4,h5,h6');
    if (!headers || headers.length === 0) return null;

    const above = [];
    headers.forEach(h => {
      const rect = h.getBoundingClientRect();
      if (rect.top <= focusRulerPx) {
        above.push(h);
      }
    });

    if (above.length === 0) {
      // Nothing passed the ruler yet; use the first header if present
      return headers[0].getAttribute('id') || null;
    }

    const last = above[above.length - 1];
    return last.getAttribute('id') || null;
  }

  function update() {
    const focusRulerPx = getFocusRuler();
    const currentId = getCurrentHeaderId(focusRulerPx);
    setActiveHeader(currentId);
  }

  function init() {
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


