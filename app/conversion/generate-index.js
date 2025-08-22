const { log } = require('console');
const utilFunc = require('../utils.js');
const fs = require('fs');


		let folderName = './output/json';
		let chaptersData = []

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
							if (file.charAt(0) == "d") {
								chaptersData.push(pageObject.chapterMetadata)

								if (isLastFile) {
									setTimeout(function(){ 
										utilFunc.createFile('./output/json/all_chapters.json', JSON.stringify(chaptersData))
									 }, 1000);
									
								}
							}

					  	});

				  })
				}
			  })

		
	
		
