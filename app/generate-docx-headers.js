const utilFunc = require('./utils.js');
const sitedata = require('../content/sites.json');

sitedata.forEach(chapter => {
    let metadataStr = '---\n'

    metadataStr += 'title: '+ chapter.title.replaceAll(':±','|').replaceAll('±','|') + '\n'
    metadataStr += 'author: '+ chapter.author + '\n'
    metadataStr += 'part: '+ chapter.part + '\n'
    metadataStr += 'chapter: '+ chapter.chapter + '\n'
    metadataStr += 'summary: '+ chapter.summary + '\n'
    metadataStr += 'publication_date: '+ chapter.pub_date_txt + '\n'
    metadataStr += 'doi: '+ chapter.doi + '\n'
    metadataStr += 'doi_url: '+ chapter.doi_url + '\n'
    metadataStr += 'status: development\n'
    
    metadataStr += '---\n'

    utilFunc.createFile('./output/docx-headers/yaml-header-d'+chapter.part+'h'+chapter.chapter+'.txt', metadataStr)
});






