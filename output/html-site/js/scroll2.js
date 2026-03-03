// Highlight links in `contentNavigationSource` based on scroll position.
// When a header (h2–h6) crosses 1/4 of the viewport height, its corresponding
// link (with id 'a' + headerId) is made bold.

(function() {
  function getFocusRuler() {
    return Math.floor(window.innerHeight / 4);
  }

  function getScrollRoot() {
    var main = document.querySelector('main');
    if (!main) return window;
    var el = main.parentElement;
    while (el && el !== document.body) {
      var style = window.getComputedStyle(el);
      var oy = style.overflowY;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight) {
        return el;
      }
      el = el.parentElement;
    }
    return window;
  }

  function setActiveHeader(headerId) {
    if (!headerId) return;
    var navContainer = document.getElementById('contentNavigationSource');
    if (!navContainer) return;

    var links = navContainer.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].classList.remove('font-bold');
      links[i].style.fontWeight = '';
    }

    var wantId = 'a' + headerId;
    var target = null;
    var navLinks = navContainer.querySelectorAll('a');
    for (var j = 0; j < navLinks.length; j++) {
      if (navLinks[j].id === wantId) { target = navLinks[j]; break; }
    }
    if (target) {
      target.classList.add('font-bold');
      target.style.fontWeight = '700';
    }
  }

  function getCurrentHeaderId(focusRulerPx) {
    var contentRoot = document.querySelector('main');
    var headers = (contentRoot || document).querySelectorAll('h2,h3,h4,h5,h6');
    if (!headers || headers.length === 0) return null;

    var above = [];
    for (var i = 0; i < headers.length; i++) {
      var rect = headers[i].getBoundingClientRect();
      if (rect.top <= focusRulerPx) above.push(headers[i]);
    }

    if (above.length === 0) {
      var id = headers[0].getAttribute('id');
      return id || null;
    }
    var last = above[above.length - 1];
    return last.getAttribute('id') || null;
  }

  function update() {
    var focusRulerPx = getFocusRuler();
    var currentId = getCurrentHeaderId(focusRulerPx);
    setActiveHeader(currentId);
  }

  function init() {
    update();
    var scrollRoot = getScrollRoot();
    scrollRoot.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


