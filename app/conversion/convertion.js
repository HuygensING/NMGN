let docxToHtml = require('./conversion-a-docx-html.js');
let docxToJson = require('./conversion-b-json.js');
let generateBasicHtml = require('./conversion-c-basic-html.js');
let generateMarkdown = require('./conversion-d-markdown.js');
let docxFiles = require('./wordfiles.json');

return new Promise((resolve, reject) => {

    //const docxFiles = ['index', 'd1h6','d2h4'] // test
    //const docxFiles = ['d_index', 'd1h2', 'd1h3', 'd1h4', 'd1h6','d2h4','d2h6','d2h7','d3h2','d3h6','d3h7','d4h6','d4h8'] // final
    
    docxFiles.forEach((file, index) => {
        let isLast = false
        if (index == docxFiles.length-1) { isLast = true }

        docxToHtml(file, isLast)
        .then(docxToJson)
        .then(generateMarkdown)
        .then(generateBasicHtml)
    });

})







