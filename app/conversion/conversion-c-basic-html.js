const utility = require('../utils.js');
const htmlVars = require('../vars.js');
const fs = require("fs-extra");

module.exports = function (resolveData) {
  let siteJson = resolveData[0]
  let isLast = resolveData[1]


  


	return new Promise((resolve, reject) => {

		const chapterCode = 'd'+siteJson.chapterMetadata.part+'h'+siteJson.chapterMetadata.chapter;

					let htmlBlocks = '';
					let lastType = '';
					let noteBlocks = '';

							// // generate blocks
					siteJson.content.forEach((contentBlock, index) => {


						// repeating blocks?
						let blockIsFirst = false;
						let blockIsLast = false;
						if (contentBlock.type != lastType) { // first
							blockIsFirst = true
						}
						if (siteJson.content[index+1] !== undefined) {
							if (contentBlock.type != siteJson.content[index+1].type) { // last
								blockIsLast = true
							}
						}
						
						

						// block types
						if (contentBlock.type == 'img') {
							htmlBlocks += renderIMGbasic(contentBlock.htmlRaw, chapterCode, blockIsFirst, blockIsLast)
							
						} else {
							htmlBlocks += '<'+contentBlock.type+'>'+contentBlock.htmlRaw+'</'+contentBlock.type+'>'
						}
						
						lastType = contentBlock.type;
					});

					// generate notes
					siteJson.footNotes.forEach((noteBlockHtml, index) => {
						noteBlocks += '<li id=fn'+noteBlockHtml.noteId+'>'
						noteBlocks += noteBlockHtml.noteContent;
						noteBlocks += '</li>'

					});

					// build the page
					let outputHTML = htmlVars.htmlHeader(siteJson.chapterMetadata.title)

					outputHTML += '<main class="container">';
					outputHTML += htmlVars.htmlChapterHeaderMinimal(siteJson.chapterMetadata.part, siteJson.chapterMetadata.chapter,siteJson.chapterMetadata.title,siteJson.chapterMetadata.author)
					outputHTML += htmlBlocks
					outputHTML += '<h2>Footnotes</h2>';
					outputHTML += '<ol>';
					outputHTML += noteBlocks
					outputHTML += '</ol>';
					outputHTML += '</main>';
					outputHTML += htmlVars.htmlFooter




					utility.createFile('./output/html-clean/d'+siteJson.chapterMetadata.part+'h'+siteJson.chapterMetadata.chapter+'-'+utility.saveTitle(siteJson.chapterMetadata.title)+'.html', outputHTML)



		
	
      resolve([htmlJson, isLast]);


	});
	

}

function renderIMGbasic(imgName, chapterCode, blockIsFirst, blockIsLast) {
	
	const imgSize = 170
	let singleImage = '<img src="images/'+chapterCode+'/'+chapterCode+'-'+imgSize+'/'+imgName+'" class="" alt="" loading="lazy">';
	let HTMLout = '';
	if (blockIsFirst) {
		HTMLout += '<div class="imgBlock">';
	}
	HTMLout += singleImage;
	if (blockIsLast) {
		HTMLout += '</div>';
	}

	return HTMLout;

}

