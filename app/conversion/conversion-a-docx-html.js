let pandoc = require('node-pandoc');
const fs = require('fs-extra');
const utility = require('../utils.js');
const stripBodyHyperlink6 = require('../replace/stripBodyHyperlink6.js');

module.exports = function(file, isLast) {

	src = './content/word/'+file+'.docx',
  args = '-f docx+styles -t html5'; // with profiles
  //args = '-f docx -t html5';

    return new Promise((resolve, reject) => {

        callback = function (err, htmlContent) {
          if (err) console.error('Oh Nos: ',err);

          htmlContent = stripBodyHyperlink6(htmlContent);

          fs.ensureDirSync('./test-output/html');
          utility.createFile('./test-output/html/' + file + '.html', htmlContent);

          resolve([htmlContent, isLast, file]);
          
        };
        pandoc(src, args, callback);
    })
}