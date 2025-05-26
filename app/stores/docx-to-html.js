let pandoc = require('node-pandoc');
const utility = require('../utils.js');


module.exports = function(file, isLast) {
	src = './content/word/'+file+'.docx',
  args = '-f docx -t html5';

    return new Promise((resolve, reject) => {

        callback = function (err, htmlContent) {
          
          if (err) console.error('Oh Nos: ',err);
          //utility.createFile('0---'+file+'.html', htmlContent)


          // new lines handling
          const returnTags = ['<p>','<li','</li','<ol>','</ol>', '<ul>','</ul>', '<blockquote>','</blockquote>', '<h1','<h2','<h3','<h4','<h5','<h6','<table>','<section','</section>']

          htmlContent = htmlContent.replace(/(?:\r\n|\r|\n)/g, ' ');
        
          returnTags.forEach(replaceString => {
            htmlContent = htmlContent.replaceAll(replaceString, '\n'+replaceString);
          });
        
          // cleanup
          htmlContent = htmlContent.replaceAll('.jpg<br />', '.jpg</p>\n<p>');
          htmlContent = htmlContent.replaceAll('.jpeg<br />', '.jpeg</p>\n<p>');
          htmlContent = htmlContent.replaceAll('.png<br />', '.png</p>\n<p>');
          htmlContent = htmlContent.replaceAll('.gif<br />', '.gif</p>\n<p>');
          htmlContent = htmlContent.replaceAll('<hr />', '');
          htmlContent = htmlContent.replaceAll('<em><br /> Tabel', '<em>Tabel');
          //htmlContent = htmlContent.replaceAll('@i@[[[', '\n');
          htmlContent = htmlContent.replaceAll(']]]@/i@', '');
          htmlContent = htmlContent.replaceAll(']]] [[[', '</p>\n<p>');


          htmlContent = htmlContent.replaceAll('@i@[[[', '</p>\n<p>');
          htmlContent = htmlContent.replaceAll(']]]', '</p>\n<p>##');


          htmlContent = htmlContent.replaceAll('@q@', '');
          htmlContent = htmlContent.replaceAll('@/q@', '');
          htmlContent = htmlContent.replaceAll(':<span dir="rtl">±</span>', '|');
          htmlContent = htmlContent.replaceAll('@H@&lt;', '');
          htmlContent = htmlContent.replaceAll('&gt;@/h@', '');


          //utility.createFile('1---'+file+'.html', htmlContent)

          resolve([htmlContent, isLast]);
          
        };
         
        pandoc(src, args, callback);




        

    })
}