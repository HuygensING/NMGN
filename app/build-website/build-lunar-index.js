const fs = require('fs-extra');
const path = require('path');
const { formatTitle, getChapterHtmlFilename, stripHtml } = require('../utils.js');

const INDEXABLE_TYPES = new Set(['p', 'h2', 'h3', 'h4', 'table', 'blockquote']);

async function buildLunrIndex() {
    const jsonDir = path.join(__dirname, '../../output/json');
    const outputFile = path.join(__dirname, '../../output/html-site/js/lunr_index.js');
    const outputFileMin = path.join(__dirname, '../../output/html-site/js/lunr_index.min.js');

    const chapters = [];
    const chapterIndexByKey = new Map();
    const documents = [];
    const typeCounts = {};

    try {
        const files = await fs.readdir(jsonDir);
        const dFiles = files
            .filter((file) => file.startsWith('d') && file.endsWith('.json') && file !== 'all_chapters.json')
            .sort();

        console.log(`Found ${dFiles.length} files to process:`, dFiles);

        for (const file of dFiles) {
            try {
                const jsonData = JSON.parse(await fs.readFile(path.join(jsonDir, file), 'utf8'));
                const { chapterMetadata } = jsonData;
                if (!chapterMetadata || !Array.isArray(jsonData.content)) {
                    console.log(`Skipped ${file}: missing metadata or content`);
                    continue;
                }

                const href = getChapterHtmlFilename(chapterMetadata);
                const title = formatTitle(chapterMetadata.title);
                const chapterKey = href;
                let chapterIdx = chapterIndexByKey.get(chapterKey);

                if (chapterIdx === undefined) {
                    chapterIdx = chapters.length;
                    chapterIndexByKey.set(chapterKey, chapterIdx);
                    chapters.push({
                        h: href,
                        t: title,
                        p: String(chapterMetadata.part ?? ''),
                        c: String(chapterMetadata.chapter ?? ''),
                    });
                }

                let added = 0;
                for (const item of jsonData.content) {
                    if (!INDEXABLE_TYPES.has(item.type) || !item.htmlRaw || !item.id) continue;

                    const text = stripHtml(item.htmlRaw);
                    if (!text) continue;

                    documents.push({
                        name: chapterIdx + '#' + item.id,
                        text,
                    });
                    typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
                    added += 1;
                }

                console.log(`Processed ${file}: ${added} blocks`);
            } catch (error) {
                console.error(`Error processing file ${file}:`, error.message);
            }
        }

        const payload = `var chapters = ${JSON.stringify(chapters)};\nvar documents = ${JSON.stringify(documents)};`;
        const payloadPretty =
            `var chapters = ${JSON.stringify(chapters, null, 2)};\n` +
            `var documents = ${JSON.stringify(documents, null, 2)};`;

        await fs.writeFile(outputFile, payloadPretty, 'utf8');
        await fs.writeFile(outputFileMin, payload, 'utf8');

        console.log(`\nLunr index created successfully!`);
        console.log(`Chapters: ${chapters.length}`);
        console.log(`Total documents: ${documents.length}`);
        console.log(`By type:`, typeCounts);
        console.log(`Regular output file: ${outputFile}`);
        console.log(`Minified output file: ${outputFileMin}`);

        const regularStats = await fs.stat(outputFile);
        const minStats = await fs.stat(outputFileMin);
        console.log(`Regular file size: ${(regularStats.size / 1024).toFixed(2)} KB`);
        console.log(`Minified file size: ${(minStats.size / 1024).toFixed(2)} KB`);

        if (documents.length > 0) {
            console.log('\nSample documents:');
            documents.slice(0, 3).forEach((doc, index) => {
                const chapter = chapters[parseInt(doc.name.split('#')[0], 10)];
                console.log(`${index + 1}. ${chapter.h}/#${doc.name.split('#')[1]} (${chapter.t}): "${doc.text.substring(0, 100)}..."`);
            });
        }
    } catch (error) {
        console.error('Error building lunr index:', error);
        process.exitCode = 1;
    }
}

buildLunrIndex();
