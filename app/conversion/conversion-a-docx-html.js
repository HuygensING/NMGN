let pandoc = require('node-pandoc');
const utility = require('../utils.js');

module.exports = function(file, isLast) {

	src = './content/word/'+file+'.docx',
  args = '-f docx+styles -t html5'; // with profiles
  //args = '-f docx -t html5';

    return new Promise((resolve, reject) => {

        callback = function (err, htmlContent) {
          if (err) console.error('Oh Nos: ',err);
         utility.createFile('./test-output/html/1---'+file+'.html', JSON.stringify(htmlContent))

          resolve([htmlContent, isLast, file]);
          
        };
        pandoc(src, args, callback);
    })
}