let docxToHtml = require('./stores/docx-to-html.js');
let createJsonRootFile = require('./stores/create-json-root-file.js');
let generateBasicHtml = require('./stores/generate-basic-html');

let generateMarkdown = require('./stores/generate-markdown');
let tempExport = require('./stores/tempExport.js');
//let generateIndex = require('./stores/generate-all-chapter-index.js');

const docxFiles = ['d1h6','d2h4'] //'d1h6-longnotes-meta','d2h4' 'd1h6',

docxFiles.forEach(file => {
    docxToHtml(file)
    .then(createJsonRootFile)
    .then(generateBasicHtml)
    .then(generateMarkdown)
    .then(tempExport)
    //.then(generateIndex)
});



