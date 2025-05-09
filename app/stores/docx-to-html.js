let pandoc = require('node-pandoc');
const utility = require('../utils.js');


module.exports = function(file) {
	src = './content/word/'+file+'.docx',
  args = '-f docx -t html5';

    return new Promise((resolve, reject) => {

        callback = function (err, htmlContent) {
          if (err) console.error('Oh Nos: ',err);
          utility.createFile('z5-test-'+Date.now ( )+'.html', htmlContent)
          //console.log(htmlContent);
          //console.log('444');

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
          htmlContent = htmlContent.replaceAll('@i@[[[', '');
          htmlContent = htmlContent.replaceAll(']]]@/i@', '');
          htmlContent = htmlContent.replaceAll(']]] [[[', '</p>\n<p>');
          htmlContent = htmlContent.replaceAll('@q@', '');
          htmlContent = htmlContent.replaceAll('@/q@', '');
          htmlContent = htmlContent.replaceAll(':<span dir="rtl">±</span>', '|');
          htmlContent = htmlContent.replaceAll('@H@&lt;', '');
          htmlContent = htmlContent.replaceAll('&gt;@/h@', '');



        

          //utility.createFile('z2-test-'+Date.now ( )+'.html', htmlContent)

          resolve(htmlContent);
          
        };
         
        pandoc(src, args, callback);




        

    })
}