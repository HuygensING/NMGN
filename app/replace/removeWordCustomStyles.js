const preservedWordStyles = require('./preservedWordStyles.json');

function unwrapElement(el) {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) {
    parent.insertBefore(el.firstChild, el);
  }
  parent.removeChild(el);
}

function convertHeadingWrapper(document, dom, div, headingTag) {
  const parent = div.parentNode;
  if (!parent) return;

  const childNodes = Array.from(div.childNodes);
  let firstParagraphHandled = false;

  childNodes.forEach(node => {
    if (!firstParagraphHandled && node.nodeType === dom.window.Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'p') {
      const headingEl = document.createElement(headingTag);
      headingEl.innerHTML = node.innerHTML;
      parent.insertBefore(headingEl, div);
      firstParagraphHandled = true;
    } else {
      parent.insertBefore(node, div);
    }
  });

  parent.removeChild(div);
}

function convertEmphasisSpan(document, dom, span) {
  const onlyChild = span.children.length === 1 ? span.children[0] : null;
  if (onlyChild && onlyChild.tagName.toLowerCase() === 'em' && span.childNodes.length === 1) {
    span.replaceWith(onlyChild);
    return;
  }
  const em = document.createElement('em');
  em.innerHTML = span.innerHTML;
  span.replaceWith(em);
}

function applyTableCellStyles(body, tableCellStyles) {
  const tableStyleNames = new Set(Object.keys(tableCellStyles));

  body.querySelectorAll('table td, table th').forEach(cell => {
    const styledElements = cell.querySelectorAll('[data-custom-style]');
    let cellClass = null;

    styledElements.forEach(el => {
      const styleName = el.getAttribute('data-custom-style');
      if (tableStyleNames.has(styleName) && !cellClass) {
        cellClass = tableCellStyles[styleName];
      }
    });

    if (cellClass) {
      cell.classList.add(cellClass);
    }

    let divs = cell.querySelectorAll('div');
    while (divs.length) {
      divs.forEach(div => unwrapElement(div));
      divs = cell.querySelectorAll('div');
    }
  });
}

function removeRemainingCustomStyles(body) {
  const preservedStyles = new Set([
    ...Object.keys(preservedWordStyles.tableCellStyles),
    ...Object.keys(preservedWordStyles.headingWrapperStyles),
    ...preservedWordStyles.emphasisSpanStyles
  ]);

  let found = true;
  while (found) {
    found = false;
    body.querySelectorAll('[data-custom-style]').forEach(el => {
      const styleName = el.getAttribute('data-custom-style');
      if (preservedStyles.has(styleName)) return;

      found = true;
      const tag = el.tagName.toLowerCase();
      if (tag === 'span' || tag === 'div') {
        unwrapElement(el);
      } else {
        el.removeAttribute('data-custom-style');
      }
    });
  }
}

function removeEmptyParagraphs(body) {
  body.querySelectorAll('p').forEach(p => {
    if (!p.textContent.trim() && !p.querySelector('img, a, sup')) {
      p.remove();
    }
  });
}

module.exports = function removeWordCustomStyles(document, dom) {
  const body = document.querySelector('body');
  if (!body) return;

  Object.entries(preservedWordStyles.headingWrapperStyles).forEach(([styleName, headingTag]) => {
    body.querySelectorAll(`div[data-custom-style="${styleName}"]`).forEach(div => {
      convertHeadingWrapper(document, dom, div, headingTag);
    });
  });

  preservedWordStyles.emphasisSpanStyles.forEach(styleName => {
    body.querySelectorAll(`span[data-custom-style="${styleName}"]`).forEach(span => {
      convertEmphasisSpan(document, dom, span);
    });
  });

  applyTableCellStyles(body, preservedWordStyles.tableCellStyles);
  removeRemainingCustomStyles(body);
  removeEmptyParagraphs(body);
};
