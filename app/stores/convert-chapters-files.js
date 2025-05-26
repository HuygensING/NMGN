let docxToHtml = require('./docx-to-html.js');
let createJsonRootFile = require('./create-json-root-file.js');
let generateBasicHtml = require('./generate-basic-html.js');
let generateMarkdown = require('./generate-markdown.js');
let generateIndex = require('./generate-all-chapter-index.js');
let generateWebsite = require('./generate-website-html.js');

module.exports = function() {

    return new Promise((resolve, reject) => {

        //const docxFiles = ['index', 'd1h6','d2h4'] // test
        const docxFiles = ['index', 'd1h2', 'd1h3', 'd1h4', 'd1h6','d2h4','d2h6','d2h7','d3h2','d3h6','d3h7','d4h6'] // final
        
        docxFiles.forEach((file, index) => {
            let isLast = false
            if (index == docxFiles.length-1) { isLast = true }

            docxToHtml(file, isLast)
            .then(createJsonRootFile)
            .then(generateIndex)
            .then(generateMarkdown)
            .then(generateBasicHtml)
            .then(generateWebsite)
        });

    })
}






