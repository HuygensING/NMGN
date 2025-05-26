const utilFunc = require('../utils.js');
const fs = require('fs');

module.exports = function([out, isLast]) {
	//utilFunc.createFile('./output/json/d'+out.chapterMetadata.part+'h'+out.chapterMetadata.chapter+'.json', JSON.stringify(out))

	if (isLast) {
		console.log('last');
		console.log(out.chapterMetadata.title);

			let folderName = './output/json'
		
			fs.readdir(folderName, (err, files) => {
				if (err)
				  console.log(err);
				else {
				  files.forEach(file => {
					console.log(file);
				  })
				}
			  })
		
	} 
}