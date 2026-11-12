(function () {
  function getQuery() {
    return (new URLSearchParams(window.location.search).get('q') || '').trim();
  }

  function escapeRegExp(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function shouldSkipTextNode(textNode) {
    var el = textNode.parentElement;
    while (el) {
      var tag = el.tagName;
      if (
        tag === 'SCRIPT' ||
        tag === 'STYLE' ||
        tag === 'NOSCRIPT' ||
        tag === 'MARK' ||
        tag === 'TEXTAREA' ||
        tag === 'INPUT' ||
        tag === 'BUTTON' ||
        tag === 'SELECT'
      ) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  function highlightTerms(root, keyword) {
    var terms = String(keyword)
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!terms.length || !root) return;

    var regex = new RegExp('(' + terms.map(escapeRegExp).join('|') + ')', 'gi');

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach(function (textNode) {
      if (shouldSkipTextNode(textNode)) return;

      var text = textNode.nodeValue;
      if (!text) return;

      // Met capturing group: oneven indexen zijn matches
      var parts = text.split(regex);
      if (parts.length < 2) return;

      var frag = document.createDocumentFragment();
      parts.forEach(function (part, index) {
        if (!part) return;
        if (index % 2 === 1) {
          var mark = document.createElement('mark');
          mark.className = 'bg-yellow-100';
          mark.textContent = part;
          frag.appendChild(mark);
        } else {
          frag.appendChild(document.createTextNode(part));
        }
      });

      textNode.parentNode.replaceChild(frag, textNode);
    });
  }

  function run() {
    if (document.getElementById('searchForm')) return;

    var keyword = getQuery();
    if (!keyword) return;

    var hashId = window.location.hash.replace(/^#/, '');
    var target = hashId ? document.getElementById(hashId) : null;
    var root =
      target ||
      document.querySelector('main .prose') ||
      document.getElementById('main');

    if (!root) return;

    // Alleen de zoekterm(en) wrappen, niet het hele blok
    highlightTerms(root, keyword);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
