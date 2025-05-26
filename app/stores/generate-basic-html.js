const utility = require('../utils.js');
const htmlVars = require('../vars.js');
const fs = require("fs-extra");

module.exports = function([jsonDoc, isLast]) {



	return new Promise((resolve, reject) => {

		const chapterCode = 'd'+jsonDoc.chapterMetadata.part+'h'+jsonDoc.chapterMetadata.chapter;

		if (isLast) {
			setTimeout(() => {
				fs.readFile('./output/json/index.json', 'utf8', (err, siteJson) => {
					if (err) {
						console.error(err);
						return;
					}
					siteJson = JSON.parse(siteJson)

					let siteNavigationHTML = '<nav>';
					siteJson.forEach(navigationData => {
						if (navigationData !== null) {
							siteNavigationHTML += '<a '
							siteNavigationHTML += 'href="d'+navigationData.part+'h'+navigationData.chapter+'-'+utility.saveTitle(navigationData.title)+'.html'+'">'
							siteNavigationHTML += navigationData.title
							siteNavigationHTML += '</a>'
						}
					});
					siteNavigationHTML += '</nav>';

					siteJson.forEach(chapterData => {
						if (chapterData !== null) {
							fs.readFile('./output/json/d'+chapterData.part+'h'+chapterData.chapter+'.json', 'utf8', (err, data) => {
								if (err) {
									console.error(err);
									return;
								}
								
								let chapterJson = JSON.parse(data)
								let htmlBlocks = '';
								let lastType = '';
								let noteBlocks = '';

										// // generate blocks
								chapterJson.content.forEach((contentBlock, index) => {


									// repeating blocks?
									let blockIsFirst = false;
									let blockIsLast = false;
									if (contentBlock.type != lastType) { // first
										blockIsFirst = true
									}
									if (chapterJson.content[index+1] !== undefined) {
										if (contentBlock.type != chapterJson.content[index+1].type) { // last
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
								chapterJson.footNotes.forEach((noteBlockHtml, index) => {
									noteBlocks += '<li id=fn'+noteBlockHtml.noteId+'>'
									noteBlocks += noteBlockHtml.noteContent;
									noteBlocks += '</li>'

								});

								// build the page
								let outputHTML = htmlVars.htmlHeader(chapterJson.chapterMetadata.title)
								outputHTML += siteNavigationHTML
								outputHTML += '<main class="container">';
								outputHTML += htmlVars.htmlChapterHeaderMinimal(chapterJson.chapterMetadata.part, chapterJson.chapterMetadata.chapter,chapterJson.chapterMetadata.title,chapterJson.chapterMetadata.author)
								outputHTML += htmlBlocks
								outputHTML += '<h2>Footnotes</h2>';
								outputHTML += '<ol>';
								outputHTML += noteBlocks
								outputHTML += '</ol>';
								outputHTML += '</main>';
								outputHTML += htmlVars.htmlFooter




								utility.createFile('./output/html-clean/d'+chapterJson.chapterMetadata.part+'h'+chapterJson.chapterMetadata.chapter+'-'+utility.saveTitle(chapterJson.chapterMetadata.title)+'.html', outputHTML)
							});
						}
					
						
					});
	
				});
        	}, 200);
		}
		resolve([jsonDoc, isLast])

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

