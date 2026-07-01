const { execFileSync } = require('child_process');
const fs = require('fs');

function readStylesXml(docxPath) {
  if (!fs.existsSync(docxPath)) return null;
  try {
    return execFileSync('unzip', ['-p', docxPath, 'word/styles.xml'], {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024
    });
  } catch {
    return null;
  }
}

function styleBlockIsItalic(styleBlock) {
  const rPrMatch = styleBlock.match(/<w:rPr\b[^>]*>([\s\S]*?)<\/w:rPr>/);
  if (!rPrMatch) return false;
  const rPr = rPrMatch[1];
  if (/<w:i\s+w:val="(?:0|false)"/.test(rPr)) return false;
  return /<w:i(?:\s|\/>)/.test(rPr);
}

function parseHyperlinkItalicMap(stylesXml) {
  const map = {};
  if (!stylesXml) return map;

  const styleRe = /<w:style\b[^>]*w:styleId="(Hyperlink[^"]*)"[^>]*>([\s\S]*?)<\/w:style>/g;
  let match;
  while ((match = styleRe.exec(stylesXml)) !== null) {
    map[match[1]] = styleBlockIsItalic(match[2]);
  }
  return map;
}

module.exports = function getHyperlinkItalicMapFromDocx(docxPath) {
  return parseHyperlinkItalicMap(readStylesXml(docxPath));
};
