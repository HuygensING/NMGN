const { JSDOM } = require('jsdom');

/**
 * Mark column and row headers in a table.
 * - All cells in the top header band (first row, extended by rowspan) become <th scope="col">
 * - The first cell of each data row becomes <th scope="row">
 * Handles rowspan/colspan via a grid occupancy model.
 * Accepts a full <table>…</table> or an inner fragment (rows/colgroup).
 */
function markTableHeaders(html) {
  if (html == null || typeof html !== 'string') return html;
  const trimmed = html.trim();
  if (!trimmed) return html;

  const hasOuterTable = /^<table[\s>]/i.test(trimmed);
  const dom = new JSDOM(hasOuterTable ? trimmed : `<table>${trimmed}</table>`);
  const table = dom.window.document.querySelector('table');
  if (!table) return html;

  const rows = Array.from(table.querySelectorAll('tr'));
  if (rows.length === 0) return html;

  const occupied = new Map();
  const origin = new Map(); // cell -> { r, c }
  let maxCol = 0;

  rows.forEach((tr, r) => {
    let c = 0;
    Array.from(tr.querySelectorAll('td, th')).forEach((cell) => {
      while (occupied.has(`${r},${c}`)) c += 1;
      const rowspan = parseInt(cell.getAttribute('rowspan') || '1', 10) || 1;
      const colspan = parseInt(cell.getAttribute('colspan') || '1', 10) || 1;
      origin.set(cell, { r, c });
      for (let dr = 0; dr < rowspan; dr += 1) {
        for (let dc = 0; dc < colspan; dc += 1) {
          occupied.set(`${r + dr},${c + dc}`, cell);
        }
      }
      maxCol = Math.max(maxCol, c + colspan);
      c += colspan;
    });
  });

  const numRows = rows.length;

  // Header band height = max rowspan in the first row
  let headerBand = 1;
  Array.from(rows[0].querySelectorAll('td, th')).forEach((cell) => {
    headerBand = Math.max(
      headerBand,
      parseInt(cell.getAttribute('rowspan') || '1', 10) || 1
    );
  });
  headerBand = Math.min(headerBand, numRows);

  const colHeaders = new Set();
  for (let r = 0; r < headerBand; r += 1) {
    Array.from(rows[r].querySelectorAll('td, th')).forEach((cell) => {
      colHeaders.add(cell);
    });
  }

  const rowHeaders = new Set();
  for (let r = headerBand; r < numRows; r += 1) {
    for (let c = 0; c < maxCol; c += 1) {
      const cell = occupied.get(`${r},${c}`);
      if (!cell) continue;
      const cellOrigin = origin.get(cell);
      // Only the cell that starts on this row (not a rowspan from above)
      if (cellOrigin && cellOrigin.r === r) {
        rowHeaders.add(cell);
      }
      break;
    }
  }

  const doc = table.ownerDocument;
  new Set([...colHeaders, ...rowHeaders]).forEach((cell) => {
    const isCol = colHeaders.has(cell);
    const isRow = rowHeaders.has(cell);
    const scope = isRow && !isCol ? 'row' : 'col';

    if (cell.tagName.toLowerCase() === 'th') {
      cell.setAttribute('scope', scope);
      return;
    }

    const th = doc.createElement('th');
    Array.from(cell.attributes).forEach((attr) => {
      th.setAttribute(attr.name, attr.value);
    });
    th.setAttribute('scope', scope);
    while (cell.firstChild) th.appendChild(cell.firstChild);
    cell.parentNode.replaceChild(th, cell);
  });

  return hasOuterTable ? table.outerHTML : table.innerHTML;
}

module.exports = markTableHeaders;
