const utility = require('../utils.js');
let TurndownService = require('turndown')


module.exports = function([jsonDoc, isLast]) {

	return new Promise((resolve, reject) => {
		let turndownService = new TurndownService()

		let outputYaml = '---\n'
		let outputMardown = ''

				// generate metadat YAML

				for (const key in jsonDoc.chapterMetadata) {
					if (key != '---') {
					outputYaml += key
					outputYaml += ': '
					outputYaml += jsonDoc.chapterMetadata[key]
					outputYaml += '\n'
					}

				};
				outputYaml += '---\n\n'


				// generate blocks
				jsonDoc.content.forEach((contentBlock, index) => {

					

					if (contentBlock.type == 'img') {
						outputMardown += '![Alt text todo]('+contentBlock.htmlRaw+')\n\n';
						
					} else if ((contentBlock.type == 'h1') || (contentBlock.type == 'h2') || (contentBlock.type == 'h3') || (contentBlock.type == 'h4') || (contentBlock.type == 'h5') || (contentBlock.type == 'h6') ) {
						outputMardown += markDownHeader(contentBlock.type, contentBlock.htmlRaw)+'\n\n';
						
					} else if (contentBlock.type == 'table') {
						outputMardown += contentBlock.htmlRaw+'\n\n';
						
					} else {
						outputMardown += turndownService.turndown(contentBlock.htmlRaw)+'\n\n';
					}
					
				});


		utility.createFile('./output/markdown/d'+jsonDoc.chapterMetadata.part+'h'+jsonDoc.chapterMetadata.chapter+'-'+utility.saveTitle(jsonDoc.chapterMetadata.title)+'.md', outputYaml+outputMardown)

		resolve([jsonDoc, isLast])
	})
}



function markDownHeader(type, content) {
	let count = parseInt(type.replace("h", ""));
	let dash = '';
	for (let index = 0; index < count; index++) {
		dash += '#'
		
	}
	return dash+' '+content
}