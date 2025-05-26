let parseString = require('xml2js').parseString;
const utilFunc = require('../utils.js');

module.exports = function([importedHtmlContent, isLast]) {

        return new Promise((resolve, reject) => {

            let jsonDoc = {"chapterMetadata": {}, "content": [], "footNotes": []}

            let inMetadata = false;
            let inNotesSection = false;
            let currentFootNoteId = '';

            htmlInLinesArr = importedHtmlContent.split('\n');
            htmlInLinesArr.forEach(line => {
                parseString(line, function (err, domLine) {
                    
                    if (domLine != null) {
                        let lineObject = {};
                        
                        //items in p tag
                        if (domLine.p !== undefined) {

                            // set metadata status
                            if (domLine.p == '---') {
                                if (inMetadata == false) {
                                    inMetadata = true;
                                } else {
                                    inMetadata = false;
                                }
                            }

                                // store metadata
                                if (inMetadata) { // handle metadata
                                    let metdataLine = domLine.p;
                                    //console.log(metdataLine);
                                    let metdataLineArr = metdataLine.split(": ");
                                    jsonDoc.chapterMetadata[metdataLineArr[0]] = convertStrToBool(metdataLineArr[1]);

                                } else if(inNotesSection) { // handle notes
                                    
                                    //let strippedLine = line.replaceAll('<a href="#fnref'+currentFootNoteId+'" class="footnote-back" role="doc-backlink">↩︎</a>','');
                                    let strippedLine = line;

                                    jsonDoc.footNotes.push({
                                        "noteContent": removeTag('p', strippedLine),
                                        "noteId": currentFootNoteId
                                    }) 


                                } else {// handle paragraph
                                    lineObject.type = 'p';
                                    lineObject.htmlRaw = removeTag('p', line);

                                    // p with notes, em or strong     
                                    if (typeof domLine.p == 'object') {
                                        

                                    // store footnotes data
                                    if (domLine.p.a !== undefined) {
                                        lineObject.footnotes = [];
                                        domLine.p.a.forEach(noteData => {
                                            let noteDataObj = {}
                                            noteDataObj.htmlInfo = noteData['$'];
                                            noteDataObj.noteNumber = parseInt(noteData.sup);

                                            lineObject.footnotes.push(noteDataObj);
                                            
                                        });
                                    }
                                    } 

                                    // if image
                                    const imageFormats = ['.jpg', '.jpeg', '.png', '.gif'];
                                    imageFormats.forEach(format => {
                                        if ( removeSpaces(lineObject.htmlRaw).slice(0-format.length) == format ) {
                                            lineObject.htmlRaw = removeSpacesBeginEnd(lineObject.htmlRaw);
                                            lineObject.type = 'img';
                                        } 
                                    });
                                    
  
                                }
                        } else if (domLine.table !== undefined)  { 
                            // if table item
                            lineObject.type = 'table';
                            lineObject.htmlRaw = line;
                        } else if (domLine.li !== undefined)  { 
                            // if li item
                            console.log(domLine.li);
                            
                            
                        
                        } else if (domLine.h1 !== undefined)  { 
                            // if h1 item
                            lineObject.type = 'h1';
                            lineObject.htmlRaw = domLine.h1['_']
                            lineObject.id = domLine.h1['$'].id;
                        
                        } else if (domLine.h2 !== undefined)  { 
                            // if h2 item
                            lineObject.type = 'h2';
                            lineObject.htmlRaw = domLine.h2['_']
                            lineObject.id = domLine.h2['$'].id;
                        } else if (domLine.h3 !== undefined)  { 
                            // if h3 item
                            lineObject.type = 'h3';
                            lineObject.htmlRaw = domLine.h3['_']
                            lineObject.id = domLine.h3['$'].id;
                        } else if (domLine.h4 !== undefined)  { 
                            // if h4 item
                            lineObject.type = 'h4';
                            lineObject.htmlRaw = domLine.h4['_']
                            lineObject.id = domLine.h4['$'].id;
                        } else if (domLine.h5 !== undefined)  { 
                            // if h5 item
                            lineObject.type = 'h5';
                            lineObject.htmlRaw = domLine.h5['_']
                            lineObject.id = domLine.h5['$'].id;
                        } else if (domLine.h6 !== undefined)  { 
                            // if h6 item
                            lineObject.type = 'h6';
                            lineObject.htmlRaw = domLine.h6['_']
                            lineObject.id = domLine.h6['$'].id;
                        } else {
                            //console.log(line); 
                        }


                        // if valid (not empty, str) -> store
                        if (lineObject.htmlRaw !== undefined) {
                            if ( (removeSpaces(lineObject.htmlRaw) != '') && (removeSpaces(lineObject.htmlRaw) != '') && (removeSpaces(lineObject.htmlRaw) != '---') && (removeSpaces(lineObject.htmlRaw) != '<strong><br/></strong>')) {
                                jsonDoc.content.push(lineObject)                                        
                            } else {
                                // dispay missed lines
                                //console.log('inv >',line);
                            }
                        } else {
                            // dispay missed lines
                            //console.log('inv >',line);
                        }

                        
                        
                    } else { // Not DOM but string (single blocknote or li)
                        //console.log('inv >',line);

                        if ( line.includes('<section id="footnotes"')) {
                            
                            inNotesSection = true; 
                        } else if ( line.includes('</section>')) {
                            inNotesSection = false 
                        } else if ( line.includes('<li id="')) {
                            if (inNotesSection) {
                                currentFootNoteId = getIdFromTagString(line, 'li');
                            }
                        }


                    }
                    
                });
            });
            utilFunc.createFile('./output/json/d'+jsonDoc.chapterMetadata.part+'h'+jsonDoc.chapterMetadata.chapter+'.json', JSON.stringify(jsonDoc))
            resolve([jsonDoc, isLast])
    
        })

}

function removeTag(tag, str) {
    return str.replaceAll('<'+tag+'>','').replaceAll('</'+tag+'>',"");
}

function removeSpaces(str) {
    return str.replaceAll(" ","");
}

function removeSpacesBeginEnd(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function convertStrToBool(str) {
    let out = str
    if (out == 'true') {
        out = true
    }
    if (out == 'false') {
        out = false
    }
    return out;
}

function getIdFromTagString(str, tag) {
    return parseInt(str.replaceAll('<'+tag+' id="fn','').replaceAll('">',""));
}