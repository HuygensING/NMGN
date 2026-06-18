// Highlight links in `contentNavigationSource` based on scroll position.
// When a header (h2–h6) crosses 1/4 of the scroll area height, its corresponding
// link (with id 'a' + headerId) is made bold.
// When an inline image (.imgFirstOfSet) crosses 1/4 of the scroll area height,
// the aside image panel is updated (same as clicking the image button).

(function() {
  var scrollRoot = window;

  function getScrollRoot() {
    var main = document.querySelector('main');
    if (!main) return window;
    var el = main.parentElement;
    while (el && el !== document.body) {
      var style = window.getComputedStyle(el);
      var oy = style.overflowY;
      if ((oy === 'auto' || oy === 'scroll' || oy === 'overlay') && el.scrollHeight > el.clientHeight) {
        return el;
      }
      el = el.parentElement;
    }
    return window;
  }

  function getFocusRuler() {
    if (scrollRoot === window) {
      return Math.floor(window.innerHeight / 4);
    }
    var rect = scrollRoot.getBoundingClientRect();
    return rect.top + Math.floor(scrollRoot.clientHeight / 4);
  }

  function getLastPassedTop(markers, focusRulerPx) {
    var above = [];
    for (var i = 0; i < markers.length; i++) {
      var rect = markers[i].getBoundingClientRect();
      if (rect.top <= focusRulerPx) above.push(markers[i]);
    }
    if (above.length === 0) return markers[0] || null;
    return above[above.length - 1];
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

    var last = getLastPassedTop(headers, focusRulerPx);
    return last ? last.getAttribute('id') || null : null;
  }

  function getCurrentImageButton(focusRulerPx) {
    var contentRoot = document.querySelector('main');
    var images = (contentRoot || document).querySelectorAll('.imgFirstOfSet');
    if (!images || images.length === 0) return null;

    var lastImg = getLastPassedTop(images, focusRulerPx);
    return lastImg ? lastImg.closest('.inlineImage') : null;
  }

  function setActiveImage(button) {
    if (!button || typeof window.updateAsideFromInlineButton !== 'function') return;
    window.updateAsideFromInlineButton(button, true);
  }

  function update() {
    var focusRulerPx = getFocusRuler();
    var currentId = getCurrentHeaderId(focusRulerPx);
    setActiveHeader(currentId);
    setActiveImage(getCurrentImageButton(focusRulerPx));
  }

  function initTableScrollRegions() {
    var regions = document.querySelectorAll('.table-scroll');
    for (var i = 0; i < regions.length; i++) {
      regions[i].addEventListener('keydown', function(e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        var step = 48;
        if (e.key === 'ArrowLeft') this.scrollLeft -= step;
        else this.scrollLeft += step;
        e.preventDefault();
      });
    }
  }

  function onScrollOrResize() {
    update();
  }

  function init() {
    scrollRoot = getScrollRoot();
    update();
    initTableScrollRegions();
    scrollRoot.addEventListener('scroll', onScrollOrResize, { passive: true });
    if (scrollRoot !== window) {
      window.addEventListener('scroll', onScrollOrResize, { passive: true });
    }
    window.addEventListener('resize', function() {
      scrollRoot = getScrollRoot();
      update();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
