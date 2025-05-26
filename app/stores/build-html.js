const handlebars = require("handlebars");
const fs = require("fs-extra");
const path = require("path");

const beautify = require('beautify');

const myArgs = process.argv.slice(2);
const projct = myArgs[0];

let sitedata = require('../' + projct + '/data/site-' + projct + '.json');
let outputDir = "./" + projct + "/_dist/"
const partialsDir = "./" + projct + "/components/"; // "./general/components/";


build()

function build() {

  fs.remove(outputDir)
    .then(createFolder)
    .then(registerPartials)
    .then(generateHtml)
    .then(copyFiles)
    .then(copyDist)
    .catch((err) => {
      console.error(err);
    });
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

              fs.readFile(projct + "/components/" + file, "utf-8", function (
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



// generate files
function generateHtml() {

  sitedata.forEach((item) => {

    fs.readFile(projct + "/templates/" + item.template, "utf-8", function (
      error,
      source
    ) {
      var template = handlebars.compile(source);
      var html = template(item);
      html = beautify(html, { format: 'html' })
      createFile(outputDir + '/' + item.file_name, html);

    });
  });

}





// create new files
function createFile(fileName, content) {
  fs.writeFile(fileName, content, function (err) {
    if (err) throw err;
  });
}



// create folders
function createFolder() {
  fs.mkdirSync(outputDir);
  fs.mkdirSync(outputDir + '/images');
  fs.mkdirSync(outputDir + '/js');
}

function copyFiles() {
  fs.cp("./" + projct + "/images/", outputDir + '/images/', { recursive: true }, (err) => {
    if (err) {
      console.error(err);
    }
  });

  fs.cp("./" + projct + "/js/", outputDir + '/js/', { recursive: true }, (err) => {
    if (err) {
      console.error(err);
    }
  });

  const copyFolder = "./" + projct + "/copy/"
  if (fs.existsSync(copyFolder)) {
    fs.cp(copyFolder, outputDir + '/', { recursive: true }, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }


}

function saveName(str) {
  str = str.replaceAll(' ', '-')
  str = str.replaceAll('&', '')
  str = str.replaceAll(':', '')
  str = str.replaceAll('?', '')
  str = str.replaceAll('\n', '')
  return str.toLowerCase();
}

function copyDist() {
  const copyfolderPath = projct + '/data/copy_folder.json'
  if (fs.existsSync('./' + copyfolderPath)) {
    const copyPath = require('../' + copyfolderPath)
    setTimeout(function () {
      fs.cp(outputDir, copyPath[0], { recursive: true }, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }, 1000);
  }
}