// Highlight links in `contentNavigationSource` based on scroll position.
// When a header (h2–h6) crosses 1/4 of the scroll area height, its corresponding
// link (with id 'a' + headerId) is made bold.
// When an inline image row (.imgFirstOfSet) is nearest that line in the visible
// scroll area, the aside image panel is updated (same as clicking the image button).

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

  function getScrollRootViewport() {
    if (scrollRoot === window) {
      return { top: 0, bottom: window.innerHeight };
    }
    var rect = scrollRoot.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom };
  }

  function getFocusRuler() {
    if (scrollRoot === window) {
      return Math.floor(window.innerHeight / 4);
    }
    var rect = scrollRoot.getBoundingClientRect();
    return rect.top + Math.floor(scrollRoot.clientHeight / 4);
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

  function getCurrentImageButton(focusRulerPx) {
    var contentRoot = document.querySelector('main');
    var images = (contentRoot || document).querySelectorAll('.imgFirstOfSet');
    if (!images || images.length === 0) return null;

    var viewport = getScrollRootViewport();
    var best = null;
    var bestDist = Infinity;
    var bestIndex = -1;

    for (var i = 0; i < images.length; i++) {
      var btn = images[i].closest('.inlineImage');
      if (!btn) continue;
      var rect = btn.getBoundingClientRect();
      var inView = rect.bottom > viewport.top && rect.top < viewport.bottom;
      if (!inView) continue;

      var dist;
      if (focusRulerPx < rect.top) {
        dist = rect.top - focusRulerPx;
      } else if (focusRulerPx > rect.bottom) {
        dist = focusRulerPx - rect.bottom;
      } else {
        dist = 0;
      }

      if (dist < bestDist || (dist === bestDist && i > bestIndex)) {
        bestDist = dist;
        best = btn;
        bestIndex = i;
      }
    }

    if (best) return best;

    var lastAbove = null;
    for (var k = 0; k < images.length; k++) {
      var fallbackBtn = images[k].closest('.inlineImage');
      if (!fallbackBtn) continue;
      if (fallbackBtn.getBoundingClientRect().top <= focusRulerPx) {
        lastAbove = fallbackBtn;
      }
    }
    if (lastAbove) return lastAbove;
    return images[0].closest('.inlineImage');
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
