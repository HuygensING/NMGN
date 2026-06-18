let pandoc = require('node-pandoc');
const fs = require('fs-extra');
const utility = require('../utils.js');

module.exports = function(file, isLast) {

	src = './content/word/'+file+'.docx',
  args = '-f docx+styles -t html5'; // with profiles
  //args = '-f docx -t html5';

    return new Promise((resolve, reject) => {

        callback = function (err, htmlContent) {
          if (err) console.error('Oh Nos: ',err);


          resolve([htmlContent, isLast, file]);
          
        };
        pandoc(src, args, callback);
    })
}