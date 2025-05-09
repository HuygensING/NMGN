const utility = require('../utils.js');

module.exports = function(jsonDoc) {

	return new Promise((resolve, reject) => {

		const htmlHeader = `
		<!DOCTYPE html>
			<html lang=\"nl\">
			<head>
				<meta charset=\"UTF-8\">
				<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
				<title>${jsonDoc.chapterMetadata.title}</title>
				<link rel="stylesheet" href="style.css">
			</head>
			<body>
		`;

		const htmlFooter = `
		 	</body>
			</html>
		`;

		const pageHeader = `
		<header>
		<div>Deel ${jsonDoc.chapterMetadata.part} hoofdstuk ${jsonDoc.chapterMetadata.chapter}</div>
		<h1>${jsonDoc.chapterMetadata.title}</h1>
		<div>Door <strong>${jsonDoc.chapterMetadata.author}</strong></div>

		</header>
		`;

		let htmlBlocks = '<main class="container">';

		jsonDoc.content.forEach(contentBlock => {
			htmlBlocks += '<'+contentBlock.type+'>'+contentBlock.htmlRaw+'</'+contentBlock.type+'>'
		});

		htmlBlocks += '</main>';

		let outputHTML = htmlHeader+pageHeader+htmlBlocks+htmlFooter


		utility.createFile('./output/html-clean/d'+jsonDoc.chapterMetadata.part+'h'+jsonDoc.chapterMetadata.chapter+'-'+utility.saveTitle(jsonDoc.chapterMetadata.title)+'.html', outputHTML)

		resolve(jsonDoc)

	});
	

}