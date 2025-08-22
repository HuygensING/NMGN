const htmlHeader = (pageTitle) => {
    const htmlHeader = `
    <!DOCTYPE html>
        <html lang=\"nl\">
        <head>
            <meta charset=\"UTF-8\">
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
            <title>${pageTitle}</title>
            <link rel="stylesheet" href="style.css">
        </head>
        <body>
    `;
    return htmlHeader;
};

const htmlFooter = `
    </body>
   </html>
`;

const htmlChapterHeaderMinimal = (part, chapter, title, author) => {
    const pageHeader = `
    <header>
    <div>Deel ${part} hoofdstuk ${chapter}</div>
    <h1>${title}</h1>
    <div>Door <strong>${author}</strong></div>
    
    </header>`;
    return pageHeader;
};

const htmlinlineNoteMarker = (nr) => {
    const inlineNoteMarker = `
    <button id="noteRef${nr}" data-noteNumber="${nr}"
    class="noteRef bg-white inline-flex justify-center items-center text-xs p-2 border border-neutral-300 text-neutral-600 rounded-full h-7 w-7 font-sans -translate-y-1 cursor-pointer">
    ${nr}
    </button>`;
    return inlineNoteMarker;
};


module.exports = {htmlHeader, htmlFooter, htmlChapterHeaderMinimal,htmlinlineNoteMarker};


