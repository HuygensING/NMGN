
const utility = require('../utils.js');
const replaceStrings = require('../replace/replaceStrings.json');
const replaceStringsFromDocx = require('../replace/replaceFromDocx.json');
const removeWordCustomStyles = require('../replace/removeWordCustomStyles.js');
const contentCorrectionsImages = require('../replace/contentAjustmentsImages.json');
const contentCorrections = require('../replace/contentAjustments.json');
const notStoreStrings = require('../doNotStoreStrings.json');
const imagesJson = require('../../content/data/images.json');
let parseString = require('xml2js').parseString;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


module.exports = function (resolveData) {
  let htmlContent = resolveData[0]
  let isLast = resolveData[1]
  let file = resolveData[2]



  return new Promise((resolve, reject) => {

    htmlJson = {}
    htmlJson.chapterMetadata = {}
    htmlJson.content = []
    htmlJson.footNotes = []
    
    // Remove zero-width spaces and other invisible Unicode characters before processing
    // This ensures replacement rules can match patterns correctly
    htmlContent = htmlContent.replace(/[\u200B-\u200D\uFEFF]/g, '')

    // replace docx strings
    replaceStringsFromDocx.forEach(replaceString => {
      htmlContent = htmlContent.replaceAll(replaceString[0], replaceString[1]);
    });

    // replace incorrect image names
    contentCorrectionsImages.forEach(replaceString => {
      htmlContent = htmlContent.replaceAll(replaceString[0], replaceString[1]);
    });


    const dom = new JSDOM('<html><body>' + htmlContent + '</body></html>');
    const document = dom.window.document;
    const body = document.querySelector("body");

    removeWordCustomStyles(document, dom);

    const domNodeList = body.children;
    
    let inMetadata = false;
    let paragraphCounter = 1
    let tableCounter = 1
    let blockIsFirst 
    let blockIsLast 
    let inSeries = false;
    let currentChapter = ''

    for (let i = 0; i < domNodeList.length; i++) {
      let domNodeItem = domNodeList[i]
      let storeElement = true

      


      //remove divs and spans
      if ( (domNodeItem.tagName.toLowerCase() == 'div')) {
        if (domNodeList[i].children.length == 1) {
          domNodeItem = domNodeList[i].children[0]
        } 
      }


      //set values
      let elementTagName = domNodeItem.tagName
      let elementInner = (domNodeItem.innerHTML != null && typeof domNodeItem.innerHTML === 'string') ? domNodeItem.innerHTML : ''
      let elementId = utility.saveTitle(elementInner)
      let elementData = {}
      let elementImageData = {}
      let elementFootnotes = []
      
      elementInner = elementInner.replaceAll('\n', ' ');

      
      // set metadata status
      if (elementInner == '---') {
        
          if (inMetadata == false) {
              inMetadata = true;
          } else {
              inMetadata = false;

          }
      }

      // store metadata
      if (inMetadata) { // handle metadata
        let metdataLine = elementInner;
        if (typeof metdataLine === 'string') { //metdataLine.includes(": ")  
            let metdataLineArr = metdataLine.split(": ");
            const metadataValueRaw = metdataLineArr[1] ?? "";
            htmlJson.chapterMetadata[metdataLineArr[0]] = convertStrToBool(metadataValueRaw.replace(/&nbsp;/g, " "));
        }
        currentChapter ='d'+htmlJson.chapterMetadata.part+'h'+htmlJson.chapterMetadata.chapter; 
        htmlJson.chapterMetadata.chapterId = currentChapter; 
        storeElement = false;
      }





      // if headers
      if ( (elementTagName.toLowerCase() == 'h1') || (elementTagName.toLowerCase() == 'h2') || (elementTagName.toLowerCase() == 'h3') || (elementTagName.toLowerCase() == 'h4') || (elementTagName.toLowerCase() == 'h5') || (elementTagName.toLowerCase() == 'h6') ) {
        if (elementInner.includes("@H@&")) {
          elementData.isHigherLevel = true
          htmlJson.chapterMetadata.hasHigherLevel = true
        }
        elementInner = removeSpacesBeginEnd(elementInner).replaceAll('<p></p><p> </p>', '')
        elementId = utility.saveTitle(elementInner)

        if ( ( currentChapter == 'd4h8') ||  ( currentChapter == 'd2h4') ) {  
          if (domNodeItem.tagName.toLowerCase() == 'h3') {
            elementTagName = 'h2'
            //console.log('3',domNodeItem.outerHTML);
          }else 
          
          if (domNodeItem.tagName.toLowerCase() == 'h2') {
            elementTagName = 'h3'
            //console.log('2',domNodeItem.outerHTML);
          }

          
        }
      }


      // if table
      if ( elementTagName.toLowerCase() == 'table' ) {
        elementId = 'table_'+tableCounter
        tableCounter++

        const firstRow = domNodeItem.querySelector('tr')
        let tableColumns = 0
        if (firstRow) {
          for (const cell of firstRow.querySelectorAll('th, td')) {
            tableColumns += parseInt(cell.getAttribute('colspan'), 10) || 1
          }
        }
        elementData.tableColumns = tableColumns

        elementInner = elementInner.replaceAll('</p>', ' ').replaceAll('<p>', ' ').replace(/\s+/g, ' ').trim()
        
      }
      
    




      // if paragraph
      if ( elementTagName.toLowerCase() == 'p' ) {
        parseString('<p>'+elementInner+'</p>', function (err, xmlJson) {
          // id
          elementId = 'paragraph_'+paragraphCounter
          paragraphCounter++

          // footnote data
          if (xmlJson.p.a != undefined) {
            xmlJson.p.a.forEach(note => {
              let noteNr = 0
              if (note["$"].id != undefined) {
                noteNr  = note["$"].id.replaceAll('fnref', '')
              }

              elementFootnotes.push({
                htmlInfo: note["$"],
                noteNumber: noteNr
              })
              
            });
          }
        })
      }

      // if section / notes
      if ( elementTagName.toLowerCase() == 'section' ) {
        storeElement = false;

        let noteItems = domNodeItem.querySelector("ol").children
        for (let i = 0; i < noteItems.length; i++) {

          let nId = (noteItems[i].getAttribute('id') ?? '').replaceAll('fn', '')
          
          let noteContentHTML = noteItems[i].outerHTML
          // Remove the backlink to the note in the text (↩︎ link); match any <a> with href="#fnref{nId}"
          let noteContentHTMLReplace = noteContentHTML
            .replace(new RegExp('<a[^>]*href="#fnref' + nId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"[^>]*>[^<]*</a>', 'g'), '')
            .replaceAll('<li', '<div').replaceAll('</li>', '</div>').replaceAll('id="fn', 'id="noteContent').replaceAll('<a href="', '<a class="underline" href="')

          htmlJson.footNotes.push({noteContent: noteContentHTMLReplace, noteId: nId,})
          
        }

      }



      // if image
      if (( elementInner.toLowerCase().includes(".jpg") ) || (elementInner.toLowerCase().includes(".jpeg")) || (elementInner.toLowerCase().includes(".png"))  || (elementInner.toLowerCase().includes(".gif"))  ) {
        elementTagName = 'img'

         const nextElementInner = domNodeList[i + 1]?.innerHTML; // safely get next element's innerHTML

          if (inSeries) {
            if (nextElementInner && nextElementInner.includes("^^^^^^^^^^^^^^^^^^^^^")) {
              inSeries = true
              blockIsFirst = false
              blockIsLast = false
            } else {
              inSeries = false
              blockIsFirst = false
              blockIsLast = true
          }
            
          } else {
              if (nextElementInner && nextElementInner.includes("^^^^^^^^^^^^^^^^^^^^^")) {
                inSeries = true
                blockIsFirst = true
                blockIsLast = false
              } else {
                inSeries = false
                blockIsFirst = true
                blockIsLast = true
            }

          }
          

        elementInner = removeSpacesBeginEnd(domNodeItem.textContent || '')
        elementInner = elementInner.replace('^^^^^^^^^^^^^^^^^^^^^', '').replaceAll(' ', '').replaceAll('\n', '').replace(/[\u200B-\u200D\uFEFF]/g, '')
        elementId = utility.saveTitle(elementInner)

        
        imagesJson.forEach(imageData => {
            if (imageData.filename == elementInner) {
                elementImageData = imageData;
            }
        });
      }


      // replace strings
      replaceStrings.forEach(replaceString => {
        elementInner = elementInner.replaceAll(replaceString[0], replaceString[1]);
      });

      // replace incorrect image names
      contentCorrections.forEach(replaceString => {
        elementInner = elementInner.replaceAll(replaceString[0], replaceString[1]);
      });






      // do not add to htmljson
      notStoreStrings.forEach(str => {
        if (str == elementInner) {
          storeElement = false
        }
      });


      // store value if not metadata
      if ( storeElement ) {
        htmlJson.content.push({
        type: elementTagName.toLowerCase(),
        htmlRaw: elementInner,
        id: elementId,
        footnotes: elementFootnotes,
        imagedata: elementImageData,
        ...(elementData.tableColumns !== undefined ? { tableColumns: elementData.tableColumns } : {}),
        ...(Object.keys(elementData).filter(k => k !== 'tableColumns').length ? { data: Object.fromEntries(Object.entries(elementData).filter(([k]) => k !== 'tableColumns')) } : {}),
        elementIsFirst: blockIsFirst,
        elementIsLast: blockIsLast
      })
      }


    }
    
    utility.createFile('./output/json/d'+htmlJson.chapterMetadata.part+'h'+htmlJson.chapterMetadata.chapter+'.json', JSON.stringify(htmlJson))
    resolve([htmlJson, isLast, file]);

  })
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


function removeSpacesBeginEnd(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}