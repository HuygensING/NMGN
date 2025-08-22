var https = require('https');
const fs = require('fs');

const spreadsheetId = '1YAFTCWGrWyPjclnV16mR-S0-H2531DpOTfjCdESFSRk'; //'1yPdxfDZteyxekd9Ois8m8OpQHDT2v9G5vyAIdF0chrY'
const urlA = 'https://docs.google.com/spreadsheets/d/';
const urlB = '/gviz/tq?tqx=out:json';
const files = [
  {id:'15B_aMTtiGuokP1KP6Iu09RNr4X3ZZQyO-Qp1dq8eg7I', name:'images'}
  // {id:'1Rh6CIMnB9Vs4ot21nZqFSQDMraWf4RLaoXpAM4JvFI4', name:'notes'},
  // {id:'1YAFTCWGrWyPjclnV16mR-S0-H2531DpOTfjCdESFSRk', name:'sites'}
]
// https://docs.google.com/spreadsheets/d/15B_aMTtiGuokP1KP6Iu09RNr4X3ZZQyO-Qp1dq8eg7I/gviz/tq?tqx=out:json
// https://docs.google.com/spreadsheets/d/1Rh6CIMnB9Vs4ot21nZqFSQDMraWf4RLaoXpAM4JvFI4/gviz/tq?tqx=out:json
// https://docs.google.com/spreadsheets/d/1YAFTCWGrWyPjclnV16mR-S0-H2531DpOTfjCdESFSRk/gviz/tq?tqx=out:json




files.forEach((item) => {
  generateAllFiles(item.id, item.name)
});

//generateAllFiles('1PEcLCaI47jAgLoQlHh4k5BDcVpysYiSBuI0zqHDhdjE', 'images')

//
function generateAllFiles(id, name) {
  var jsonOut = [];
  const url = urlA+id+urlB
  console.log(url);
  // get the json
  https.get(urlA+id+urlB, function(res){
      var body = '';

      res.on('data', function(chunk){
          body += chunk;
      });

      res.on('end', function(){
          const fbResponse = JSON.parse(body.substr(47).slice(0, -2))
          createFile(name, JSON.stringify(createNewJson(fbResponse.table)));

      });
  }).on('error', function(e){
        console.log("Got an error: ", e);
  });
}






function createNewJson(obj) {

  let jOut = [];
  let hasLabel = false;

  // table headers
  const objectNames = []
  const firstCell = obj.cols[0].label

  if (firstCell !== '') {
    hasLabel = true;
  }

  if (hasLabel) {
    // get labels from coll info
    obj.cols.forEach((item, i) => {
      if (item.label !== null) {
        objectNames.push(item.label.toLowerCase())
      }
    });
  } else {
    // get labels from first row
    obj.rows[0].c.forEach((item, i) => {
      if (item.v !== null) {
        objectNames.push(item.v.toLowerCase())
      }
    });
  }


  // rows
  obj.rows.forEach((roww) => {
    let rowObject = {};

    //console.log('----')
    roww.c.forEach((item2, rowIndex) => {
      // cell
      if (item2 !== null) {
        //console.log(item2.v)
        rowObject[objectNames[rowIndex]] = item2.v

      } else {
        //console.log('nul')
        rowObject[objectNames[rowIndex]] = '';
      }

    });
    jOut.push(rowObject)

  });
  if (!hasLabel) {
    jOut.splice(0, 1);

  }
  return jOut;
}



function createFile(fileName, content) {
  fs.writeFile('./content/data/'+fileName+'.json', content, function (err) {
    if (err) throw err;
    console.log('File is created successfully.');
  });
}
