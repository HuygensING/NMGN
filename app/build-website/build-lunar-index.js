const fs = require('fs-extra');
const path = require('path');
const { saveTitle } = require('../utils.js');

// Load Dutch stopwords
const dutchStopwords = JSON.parse(fs.readFileSync(path.join(__dirname, 'dutch_stopwords.json'), 'utf8'));

// Function to remove HTML tags
function removeHtmlTags(text) {
    return text.replace(/<[^>]*>/g, '');
}

// Function to remove stopwords
function removeStopwords(text) {
    const words = text.toLowerCase().split(/\s+/);
    const filteredWords = words.filter(word => {
        // Remove punctuation and check if word is not a stopword
        const cleanWord = word.replace(/[^\w\s]/g, '');
        return cleanWord.length > 0 && !dutchStopwords.includes(cleanWord);
    });
    return filteredWords.join(' ');
}

// Function to minify JSON (remove unnecessary whitespace)
function minifyJson(obj) {
    return JSON.stringify(obj);
}

// Function to process JSON files and build lunr index
async function buildLunrIndex() {
    const jsonDir = path.join(__dirname, '../../output/json');
    const outputFile = path.join(__dirname, '../../output/html-site/js/lunr_index.js');
    const outputFileMin = path.join(__dirname, '../../output/html-site/js/lunr_index.min.js');
    
    const documents = [];
    
    try {
        // Read all files in the json directory
        const files = await fs.readdir(jsonDir);
        
        // Filter files starting with 'd' (excluding all_chapters.json)
        const dFiles = files.filter(file => file.startsWith('d') && file.endsWith('.json') && file !== 'all_chapters.json');
        
        console.log(`Found ${dFiles.length} files to process:`, dFiles);
        
        for (const file of dFiles) {
            try {
                const filePath = path.join(jsonDir, file);
                const fileContent = await fs.readFile(filePath, 'utf8');
                const jsonData = JSON.parse(fileContent);
                
                // Extract chapter metadata
                const { chapterMetadata } = jsonData;
                
                // Process content array
                if (jsonData.content && Array.isArray(jsonData.content)) {
                    for (const item of jsonData.content) {
                        if (item.type === 'p' && item.htmlRaw && item.id) {
                            // Remove HTML tags
                            let cleanText = removeHtmlTags(item.htmlRaw);
                            
                            // Remove stopwords
                            cleanText = removeStopwords(cleanText);
                            
                            // Create document entry
                            const document = {
                                name: saveTitle('d' + chapterMetadata.part + 'h' + chapterMetadata.chapter + '-' + chapterMetadata.title + '.html/#' + item.id) + '%' + chapterMetadata.title + '%' + chapterMetadata.part + '%' + chapterMetadata.chapter,

                                // {
                                //     href: saveTitle('d' + chapterMetadata.part + 'h' + chapterMetadata.chapter + '-' + chapterMetadata.title + '.html/#' + item.id),
                                //     title: chapterMetadata.title,
                                //     part: chapterMetadata.part,
                                //     chapter: chapterMetadata.chapter
                                // },
                                text: cleanText
                            };
                            
                            documents.push(document);
                        }
                    }
                }
                
                console.log(`Processed ${file}: ${jsonData.content ? jsonData.content.filter(item => item.type === 'p').length : 0} paragraphs`);
                
            } catch (error) {
                console.error(`Error processing file ${file}:`, error.message);
            }
        }
        
        // Create the regular lunr index file content
        const lunrIndexContent = `var documents = ${JSON.stringify(documents, null, 2)};`;
        
        // Create the minified lunr index file content
        const lunrIndexContentMin = `var documents = ${minifyJson(documents)};`;
        
        // Write both output files
        await fs.writeFile(outputFile, lunrIndexContent, 'utf8');
        await fs.writeFile(outputFileMin, lunrIndexContentMin, 'utf8');
        
        console.log(`\nLunr index created successfully!`);
        console.log(`Total documents: ${documents.length}`);
        console.log(`Regular output file: ${outputFile}`);
        console.log(`Minified output file: ${outputFileMin}`);
        
        // Show file sizes
        const regularStats = await fs.stat(outputFile);
        const minStats = await fs.stat(outputFileMin);
        console.log(`Regular file size: ${(regularStats.size / 1024).toFixed(2)} KB`);
        console.log(`Minified file size: ${(minStats.size / 1024).toFixed(2)} KB`);
        console.log(`Size reduction: ${((1 - minStats.size / regularStats.size) * 100).toFixed(1)}%`);
        
        // Show some sample documents
        if (documents.length > 0) {
            console.log('\nSample documents:');
            documents.slice(0, 3).forEach((doc, index) => {
                console.log(`${index + 1}. ${doc.name}: "${doc.text.substring(0, 100)}..."`);
            });
        }
        
    } catch (error) {
        console.error('Error building lunr index:', error);
    }
}

// Run the function
buildLunrIndex();
