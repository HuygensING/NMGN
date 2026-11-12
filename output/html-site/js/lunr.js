var idx = null;
var documentsByRef = null;

function ensureIndex() {
  if (idx !== null) return true;
  if (typeof lunr === 'undefined' || typeof documents === 'undefined' || typeof chapters === 'undefined') {
    return false;
  }

  documentsByRef = {};
  documents.forEach(function (doc) {
    documentsByRef[doc.name] = doc;
  });

  idx = lunr(function () {
    this.ref('name');
    this.field('text');
    documents.forEach(function (doc) {
      this.add(doc);
    }, this);
  });

  return true;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, keyword) {
  var safe = escapeHtml(text);
  var terms = String(keyword || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!terms.length) return safe;

  var pattern = terms.map(escapeRegExp).join('|');
  var regex = new RegExp('(' + pattern + ')', 'gi');
  return safe.replace(regex, '<mark class="bg-yellow-100">$1</mark>');
}

function snippetAroundMatch(text, keyword, maxLength) {
  maxLength = maxLength || 180;
  var source = text || '';
  var terms = String(keyword || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  var matchIndex = -1;
  for (var i = 0; i < terms.length; i++) {
    var idxMatch = source.toLowerCase().indexOf(terms[i].toLowerCase());
    if (idxMatch !== -1) {
      matchIndex = idxMatch;
      break;
    }
  }

  if (matchIndex === -1) {
    var short = source.slice(0, maxLength);
    return source.length > maxLength ? short + '…' : short;
  }

  var start = Math.max(0, matchIndex - Math.floor(maxLength / 3));
  var end = Math.min(source.length, start + maxLength);
  start = Math.max(0, end - maxLength);

  var snippet = source.slice(start, end);
  if (start > 0) snippet = '…' + snippet;
  if (end < source.length) snippet = snippet + '…';
  return snippet;
}

function resolveResult(ref, keyword) {
  var hashIdx = ref.indexOf('#');
  if (hashIdx === -1) {
    return {
      chapterIdx: -1,
      href: ref,
      title: 'Zonder titel',
      part: '',
      chapter: '',
      snippet: '',
    };
  }

  var chapterIdx = parseInt(ref.slice(0, hashIdx), 10);
  var fragment = ref.slice(hashIdx + 1);
  var chapter = chapters[chapterIdx] || {};
  var href = chapter.h || '';
  if (keyword) {
    href += '?q=' + encodeURIComponent(keyword);
  }
  if (fragment) {
    href += '#' + fragment;
  }
  var title = (chapter.t || 'Zonder titel').replaceAll('±', '');
  var doc = documentsByRef && documentsByRef[ref];
  var rawSnippet = doc && doc.text ? snippetAroundMatch(doc.text, keyword) : '';

  return {
    chapterIdx: chapterIdx,
    href: href,
    title: title,
    part: chapter.p || '',
    chapter: chapter.c || '',
    snippet: rawSnippet,
  };
}

function chapterMetaLabel(resolved) {
  var parts = [];
  if (resolved.part && resolved.part !== '0') parts.push('Deel ' + resolved.part);
  if (resolved.chapter && resolved.chapter !== '0') parts.push('Hoofdstuk ' + resolved.chapter);
  return parts.join(' · ');
}

function setStatus(message) {
  var searchStatus = document.getElementById('searchStatus');
  if (searchStatus) searchStatus.textContent = message || '';
}

function getQueryFromUrl() {
  return (new URLSearchParams(window.location.search).get('q') || '').trim();
}

function syncQueryToUrl(keyword, replace) {
  var url = new URL(window.location.href);
  if (keyword) {
    url.searchParams.set('q', keyword);
  } else {
    url.searchParams.delete('q');
  }

  var next = url.pathname + url.search + url.hash;
  var current = window.location.pathname + window.location.search + window.location.hash;
  if (next === current) return;

  if (replace) {
    history.replaceState({ q: keyword }, '', next);
  } else {
    history.pushState({ q: keyword }, '', next);
  }
}

function performSearch(keyword, options) {
  var searchResults = document.getElementById('searchResults');
  var searchResultsList = document.getElementById('searchResultsList');
  options = options || {};

  if (!searchResults || !searchResultsList) return;

  keyword = (keyword || '').trim();

  if (!options.skipUrl) {
    syncQueryToUrl(keyword, options.replaceUrl);
  }

  if (!keyword) {
    searchResults.classList.add('hidden');
    searchResultsList.innerHTML = '';
    setStatus('Typ een zoekwoord en druk op Zoeken.');
    return;
  }

  if (!ensureIndex()) {
    setStatus('Zoekindex kon niet worden geladen.');
    searchResults.classList.add('hidden');
    return;
  }

  try {
    var results = idx.search(keyword);
    searchResultsList.innerHTML = '';

    if (results.length === 0) {
      setStatus('Geen resultaten voor "' + keyword + '".');
      searchResults.classList.add('hidden');
      return;
    }

    var groups = [];
    var groupByChapter = {};

    results.forEach(function (result) {
      var resolved = resolveResult(result.ref, keyword);
      var key = String(resolved.chapterIdx);
      if (!groupByChapter[key]) {
        groupByChapter[key] = {
          meta: chapterMetaLabel(resolved),
          title: resolved.title || 'Overig',
          href: (chapters[resolved.chapterIdx] && chapters[resolved.chapterIdx].h) || resolved.href,
          items: [],
        };
        groups.push(groupByChapter[key]);
      }
      groupByChapter[key].items.push(resolved);
    });

    setStatus(results.length + ' resultaten in ' + groups.length + ' hoofdstukken voor "' + keyword + '".');

    groups.forEach(function (group) {
      var section = document.createElement('li');
      section.className = 'border-b border-neutral-200 pb-4 mb-2 last:border-b-0';

      if (group.meta) {
        var meta = document.createElement('p');
        meta.className = 'text-xs text-neutral-500 m-0 leading-tight';
        meta.textContent = group.meta;
        section.appendChild(meta);
      }

      var heading = document.createElement('h3');
      heading.className = 'text-base font-bold !mt-0 !mb-2 leading-tight';
      heading.textContent = group.title;
      section.appendChild(heading);

      var hits = document.createElement('ul');
      hits.className = 'flex flex-col gap-3';

      group.items.forEach(function (item) {
        var hit = document.createElement('li');

        var link = document.createElement('a');
        link.href = item.href;
        link.className = 'underline text-nmgnBlue-800';
        link.innerHTML = highlightText(item.snippet || 'Bekijk passage', keyword);
        hit.appendChild(link);

        hits.appendChild(hit);
      });

      section.appendChild(hits);
      searchResultsList.appendChild(section);
    });

    searchResults.classList.remove('hidden');
  } catch (error) {
    console.error('Search error:', error);
    setStatus('Er ging iets mis tijdens het zoeken.');
    searchResults.classList.add('hidden');
  }
}

function restoreSearchFromUrl() {
  var searchField = document.getElementById('searchField');
  if (!searchField) return;

  var query = getQueryFromUrl();
  searchField.value = query;
  if (query) {
    performSearch(query, { skipUrl: true });
  } else {
    performSearch('', { skipUrl: true });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var searchForm = document.getElementById('searchForm');
  var searchField = document.getElementById('searchField');

  if (!searchForm || !searchField) return;

  setStatus('Zoekindex wordt geladen…');
  if (ensureIndex()) {
    setStatus('Typ een zoekwoord en druk op Zoeken.');
  } else {
    setStatus('Zoekindex kon niet worden geladen.');
  }

  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    performSearch(searchField.value);
  });

  window.addEventListener('popstate', restoreSearchFromUrl);

  // Herstel na terugnavigatie uit bfcache
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) restoreSearchFromUrl();
  });

  restoreSearchFromUrl();
});
