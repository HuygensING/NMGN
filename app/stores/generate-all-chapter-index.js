const utilFunc = require('../utils.js');
const fs = require('fs');

module.exports = function([jsonDoc, isLast]) {

	return new Promise((resolve, reject) => {

	
		let folderName = './output/json';
		let chaptersData = []

		if (isLast) {
			setTimeout(() => {
			//console.log('files:');
			fs.readdir(folderName, (err, files) => {
				if (err)
				  console.log(err);
				else {
				  files.forEach((file, index) => {
					let isLastFile = false
					if (index == files.length-1) {
						isLastFile = true
					}
					fs.readFile(folderName+'/'+file, 'utf8', (err, data) => {
						if (err) {
						  console.error(err);
						  return;
						}
						pageObject = JSON.parse(data)
						chaptersData.push(pageObject.chapterMetadata)

						
						
						
						
						
						if (isLastFile) {
							utilFunc.createFile('./output/json/index.json', JSON.stringify(chaptersData))
						}
						
					  });
				  })
				}
			  })
			}, 200);
		}
	
		
		
		
		//utilFunc.createFile('./output/json/d'+out.chapterMetadata.part+'h'+out.chapterMetadata.chapter+'.json', JSON.stringify(out))


		resolve([jsonDoc, isLast])

	})


}