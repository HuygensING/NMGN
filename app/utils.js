const fs = require("fs-extra");

const createFile = (fileName, content) => {
    // Check if content is defined and not undefined
    if (content === undefined) {
        console.error(`Error: Cannot write file ${fileName} - content is undefined`);
        return;
    }
    
    fs.writeFile(fileName, content, function(err) {
        if (err) throw err;
    });
};

const replaceSpaces = (str) => {
    if (str == null || typeof str !== 'string') return '';
    return str.replaceAll(" ","-");
};

const formatTitle = (str) => {
    if (str == null || typeof str !== 'string') return '';
    return str.replaceAll(':±', '.').replaceAll('±', '.');
};

const formatTitleH1 = (str) => {
    if (str == null || typeof str !== 'string') return '';
    return str.replaceAll(':±', '.<br>').replaceAll('±', '.<br>');
};

const saveTitle = (str) => {
    if (str == null || typeof str !== 'string') return '';
    return str.replaceAll(" ","-").replaceAll("|","").replaceAll(",","").replaceAll("(","").replaceAll(")","").replaceAll(":±","").replaceAll("‘","").replaceAll("’","").replaceAll("ë","e").replaceAll("±","").toLowerCase();
};

const navigationData = (indexJson) => {
    
};

const getChapterHtmlFilename = (metadata) => {
    if (metadata.filename) {
        return metadata.filename.endsWith('.html')
            ? metadata.filename
            : metadata.filename + '.html';
    }
    return 'd' + metadata.part + 'h' + metadata.chapter + '-' + saveTitle(metadata.title) + '.html';
};

module.exports = {createFile, replaceSpaces, formatTitle, formatTitleH1, saveTitle, navigationData, getChapterHtmlFilename};


