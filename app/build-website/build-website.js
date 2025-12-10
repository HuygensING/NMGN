const utilFunc = require('../utils.js');
const htmlVars = require('../vars.js');
const fs = require("fs-extra");
const path = require("path");

let sitedata = require('../../output/json/all_chapters.json');
let indexPageData = require('../../output/json/d0h0.json');

const handlebars = require("handlebars");
const { log } = require('console');
const partialsDir = "./src/components/"; 

sitedata = sortByKey(sitedata, 'chapter')
sitedata = sortByKey(sitedata, 'part')

let currPart = 0;
sitedata.forEach((element, i) => {
  sitedata[i].fileName = 'd'+element.part+'h'+element.chapter+'-'+utilFunc.saveTitle(element.title)+'.html'
  if ( (element.status == 'development') || (element.status == 'published') ) {
    sitedata[i].render = true
  } else {
    sitedata[i].render = false
  }
   
  for (let j = 1; j < 5; j++) {
      if (element.part == j) {
        sitedata[i].partNr= indexPageData.chapterMetadata['part'+(j)+'Nr']
        sitedata[i].partTitle = indexPageData.chapterMetadata['part'+(j)+'Title']
        sitedata[i].partYearRange = indexPageData.chapterMetadata['part'+(j)+'YearRange']
        sitedata[i].partEditors = indexPageData.chapterMetadata['part'+(j)+'Editors']
        sitedata[i].partIsbn = indexPageData.chapterMetadata['part'+(j)+'Isbn']
        
        if (currPart != j) {
          sitedata[i].isFirst = true
          currPart = j
        }
        
      }
  }
});
sitedata.shift()
indexPageData.chapters = sitedata

build()

function build() {

    registerPartials()
        .then(generateHtml)
}

handlebars.registerHelper('split', function (str) {
  return str.split(';');
});

handlebars.registerHelper('removeCapSpace', function (str) {
  return str.replaceAll(' ', '_').toLowerCase();
});


handlebars.registerHelper('ifSame', function (val1, val2) {
  let out = false;
  if (val1 == val2) {
    out = true;
  }
  return out;
});


handlebars.registerHelper('randomBetween', function (min, max) {
  min = parseInt(min);
  max = parseInt(max);
  return (Math.floor(Math.random()*(max-min+1)+min));
});

handlebars.registerHelper('replaceStr', function (str, replce, replceWith) {
  return str.replaceAll(replce, replceWith);
});


function generateHtml() {
    sitedata.forEach(chapterData => {
      
      if ( (chapterData.status != 'development') || (chapterData.status != 'published') ) {
        
      
        
        const chapterCode = 'd'+chapterData.part+'h'+chapterData.chapter;

        if (chapterData !== null) {
            fs.readFile('./output/json/d'+chapterData.part+'h'+chapterData.chapter+'.json', 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }
                
                let chapterJson = JSON.parse(data)
                let firstImageStatus = true
                let lastType = '';

                chapterJson.chapterMetadata.partNr= indexPageData.chapterMetadata['part'+chapterJson.chapterMetadata.part+'Nr']
                chapterJson.chapterMetadata.partTitle = indexPageData.chapterMetadata['part'+chapterJson.chapterMetadata.part+'Title']
                chapterJson.chapterMetadata.partYearRange = indexPageData.chapterMetadata['part'+chapterJson.chapterMetadata.part+'YearRange']
                chapterJson.chapterMetadata.partEditors = indexPageData.chapterMetadata['part'+chapterJson.chapterMetadata.part+'Editors']
                chapterJson.chapterMetadata.partIsbn = indexPageData.chapterMetadata['part'+chapterJson.chapterMetadata.part+'Isbn']

                chapterJson.chapters = sitedata

                chapterJson.content.forEach((block, index) => {

                  // repeating blocks?
                    let blockIsLast = chapterJson.content[index].elementIsLast
                    let blockIsFirst = chapterJson.content[index].elementIsFirst
                  
									
									

									// images
									if (block.type == 'img') {
                    //set first images aside 
                    if (firstImageStatus) {
                      chapterJson.firstImage = block;
                      firstImageStatus = false
                    }

                  block.newHtml = renderIMGbasic(block, chapterCode, blockIsFirst, blockIsLast)
        									
									}
                  
                  // paragraphs
                  if (block.type == 'p') {
                    let newHtml = block.htmlRaw
                    // markup notes
                    if (block.footnotes !== undefined) {
                      block.footnotes.forEach(note => {
                        const originalHtmlNote = '<a href=\"#fn'+note.noteNumber+'\" class=\"footnote-ref\" id=\"fnref'+note.noteNumber+'\" role=\"doc-noteref\"><sup>'+note.noteNumber+'</sup></a>'
                        newHtml = newHtml.replaceAll(originalHtmlNote, htmlVars.htmlinlineNoteMarker(note.noteNumber))
                    }); 
                    }
                    block.newHtml = newHtml
                  }
 

                  lastType = block.type;
                  
                });

                fs.readFile("./src/templates/nmgn-chapter.html", "utf-8", function (
                    error,
                    source
                    ) {
                    var template = handlebars.compile(source);
                    var html = template(chapterJson);
                    //html = beautify(html, { format: 'html' })

                    utilFunc.createFile('./output/html-site/d'+chapterJson.chapterMetadata.part+'h'+chapterJson.chapterMetadata.chapter+'-'+utilFunc.saveTitle(chapterJson.chapterMetadata.title)+'.html', html)

                   // utilFunc.createFile('./test-output/json/d'+chapterJson.chapterMetadata.part+'h'+chapterJson.chapterMetadata.chapter+'.json', JSON.stringify(chapterJson.content))
                    
                });

                
                

                

            }
        )}
    }
    })

    fs.readFile("./src/templates/nmgn-index.html", "utf-8", function ( error, source ) {
    var template = handlebars.compile(source);
    var html = template(indexPageData);

    utilFunc.createFile('./output/html-site/index.html', html)

    
});
}






function renderIMGbasic(imgObject, chapterCode, blockIsFirst, blockIsLast) {
	
	const imgSize = 170
  let title = ''
  let caption = ''
  if (imgObject.imagedata.title !== undefined) {
    title = imgObject.imagedata.title
    caption = imgObject.imagedata.description+' '+imgObject.imagedata.description2+' '+imgObject.imagedata.description3+'<br>'+imgObject.imagedata.location
    imageSrc = 'images/'+chapterCode+'/'+chapterCode+'-600/'+imgObject.htmlRaw
  } else {
    imageSrc = 'images/'+chapterCode+'/'+chapterCode+'-600/'+imgObject.htmlRaw
  }

  let imgFirstOfSet = ''
  if (blockIsFirst) {
    imgFirstOfSet = 'imgFirstOfSet'
  }


	let singleImage = '<button class="inlineImage text-sm flex flex-col gap-2 text-left font-sans text-neutral-600 italic w-52 hover:bg-nmgnBlue-50 transition cursor-pointer" '
    singleImage += 'data-title="'+title+'" '
    singleImage += 'data-caption="'+caption+'"'
    singleImage += 'data-src="'+imageSrc+'">'
    singleImage += '<img src="images/'+chapterCode+'/'+chapterCode+'-'+imgSize+'/'+imgObject.htmlRaw+'" class="'+ imgFirstOfSet +' w-24 md:w-40" alt="'+title+' '+caption+'" id="img_'+imgObject.htmlRaw+'">'

  singleImage += '<div>'+title +'</div></button>';
  
	let HTMLout = '';
	if (blockIsFirst) {
		HTMLout += '<div class="flex flex-wrap gap-4 my-2 items-baseline py-4">';
	}
	HTMLout += singleImage;
	if (blockIsLast) {
		HTMLout += '</div>';
	}

	return HTMLout;
  


}





// register partials (components) and generate site files
function registerPartials() {

  return new Promise((resolve, reject) => {
    const longPath = path.resolve(partialsDir);
    var walk = function (dir, done) {
      var results = [];
      fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
          file = path.resolve(dir, file);
          fs.stat(file, function (err, stat) {
            // if dir
            if (stat && stat.isDirectory()) {
              walk(file, function (err, res) {
                results = results.concat(res);
                if (!--pending) done(null, results);
              });
            } else {
              results.push(file.replace(longPath + "/", ""));
              file = file.replace(longPath + "/", "");

              fs.readFile(partialsDir + file, "utf-8", function (
                error,
                source
              ) {
                handlebars.registerPartial(
                  file.replace(path.extname(file), ""),
                  source
                );
              });
              if (!--pending) done(null, results);
            }
          });
        });
      });
    };

    walk(partialsDir, function (err, results) {
      if (err) throw err;
      setTimeout(() => {
        resolve(results);
      }, 500);
    });
  });
}




function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}



