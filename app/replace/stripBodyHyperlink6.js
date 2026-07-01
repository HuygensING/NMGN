const { JSDOM } = require('jsdom');

const HYPERLINK_6 = 'Hyperlink.6';

function unwrapElement(el) {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) {
    parent.insertBefore(el.firstChild, el);
  }
  parent.removeChild(el);
}

function unwrapHyperlink6InFragment(fragmentHtml) {
  const dom = new JSDOM(`<body>${fragmentHtml}</body>`);
  const body = dom.window.document.body;

  let spans = body.querySelectorAll(`span[data-custom-style="${HYPERLINK_6}"]`);
  while (spans.length) {
    spans.forEach(span => unwrapElement(span));
    spans = body.querySelectorAll(`span[data-custom-style="${HYPERLINK_6}"]`);
  }

  return body.innerHTML;
}

module.exports = function stripBodyHyperlink6(html) {
  const sectionMatch = html.match(/<section\b/i);
  const bodyHtml = sectionMatch ? html.slice(0, sectionMatch.index) : html;
  const notesHtml = sectionMatch ? html.slice(sectionMatch.index) : '';

  if (!bodyHtml.includes(`data-custom-style="${HYPERLINK_6}"`)) {
    return html;
  }

  return unwrapHyperlink6InFragment(bodyHtml) + notesHtml;
};
