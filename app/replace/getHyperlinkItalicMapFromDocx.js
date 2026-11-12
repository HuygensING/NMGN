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

function parseItalicStyleMap(stylesXml) {
  const map = {};
  if (!stylesXml) return map;

  // Include Hyperlink.* (needed as false for unwrap) and italic character styles
  // such as "Emphasis A".
  const styleRe = /<w:style\b([^>]*)>([\s\S]*?)<\/w:style>/g;
  let match;
  while ((match = styleRe.exec(stylesXml)) !== null) {
    const attrs = match[1];
    const styleIdMatch = attrs.match(/w:styleId="([^"]+)"/);
    if (!styleIdMatch) continue;

    const styleId = styleIdMatch[1];
    const isCharacter = /w:type="character"/.test(attrs);
    const isHyperlink = styleId.startsWith('Hyperlink');
    if (!isCharacter && !isHyperlink) continue;

    const isItalic = styleBlockIsItalic(match[2]);
    if (isHyperlink || isItalic) {
      map[styleId] = isItalic;
    }
  }
  return map;
}

module.exports = function getHyperlinkItalicMapFromDocx(docxPath) {
  return parseItalicStyleMap(readStylesXml(docxPath));
};
