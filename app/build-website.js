const utilFunc = require('./utils.js');
const fs = require("fs-extra");
const path = require("path");

const sitedata = require('../output/json/index.json');
const handlebars = require("handlebars");
const partialsDir = "./src/components/"; // "./general/components/";


//let orderedChapters = orderChapterIndex(sitedata) all chapter navigation


let HtmlChapterNavigation = '';


build()

function build() {

    registerPartials()
        .then(generateHtml)
        // .catch((err) => {
        //   console.error(err);
        // });
}



function generateHtml() {
    sitedata.forEach(chapterData => {   
        
        let HtmlPageContent = '';
        let HtmlPageNotes = '';
        let HtmlPageContentNavigation = '';

        if (chapterData !== null) {
            fs.readFile('./output/json/d'+chapterData.part+'h'+chapterData.chapter+'.json', 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }
                //
                let chapterJson = JSON.parse(data)

                fs.readFile("./src/templates/nmgn-chapter.html", "utf-8", function (
                    error,
                    source
                    ) {
                    var template = handlebars.compile(source);
                    var html = template(chapterJson);
                    //html = beautify(html, { format: 'html' })

                    utilFunc.createFile('./output/html-site/d'+chapterJson.chapterMetadata.part+'h'+chapterJson.chapterMetadata.chapter+'-'+utilFunc.saveTitle(chapterJson.chapterMetadata.title)+'.html', html)

                    
                    

                });

                
                

                

            }
        )}
    
    })
}



// generate files
function generateHtml_old() {

  sitedata.forEach((item) => {

    fs.readFile(projct + "/templates/" + item.template, "utf-8", function (
      error,
      source
    ) {
      var template = handlebars.compile(source);
      var html = template(item);
      //html = beautify(html, { format: 'html' })
      //utilFunc.createFile('./output/html-site/'++'.html', JSON.stringify(jsonOut))

    });
  });

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





function orderChapterIndex(index) {
    //console.log(index);
	let jsonOut = []
	let part1 = []
	let part2 = []
	let part3 = []
	let part4 = []

	index.forEach(chapterData => {
		if (chapterData.part == "0") {
			jsonOut.push([chapterData])
		} else if (chapterData.part == "1") {
			part1.push(chapterData)
		} else if (chapterData.part == "2") {
			part2.push(chapterData)
		} else if (chapterData.part == "3") {
			part3.push(chapterData)
		} else if (chapterData.part == "4") {
			part4.push(chapterData)
		}
		
	});

    sortByKey(part1, 'chapter')
    sortByKey(part2, 'chapter')
    sortByKey(part3, 'chapter')
    sortByKey(part4, 'chapter')

    jsonOut.push(part1)
    jsonOut.push(part2)
    jsonOut.push(part3)
    jsonOut.push(part4)

    //utilFunc.createFile('./output/json/index2.json', JSON.stringify(jsonOut))

    return jsonOut

}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}



