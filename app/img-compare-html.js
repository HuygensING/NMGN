const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

class HtmlImageComparator {
    constructor() {
        const rootDir = process.cwd();
        this.htmlDir = path.join(rootDir, 'output', 'html-site');
        this.imagesRoot = path.join(this.htmlDir, 'images');
        this.results = [];
    }

    /**
     * Get chapter code (e.g. "d1h2") from an HTML filename.
     * Matches patterns like "d1h2-het-land-....html".
     */
    getChapterCodeFromFilename(filename) {
        const match = filename.match(/^(d\d+h\d+)/i);
        return match ? match[1] : null;
    }

    /**
     * List all chapter HTML files in the html-site directory.
     * Skips index/search and only keeps files starting with a chapter code.
     */
    listChapterHtmlFiles() {
        const entries = fs.readdirSync(this.htmlDir);
        return entries.filter((name) => {
            if (!name.endsWith('.html')) return false;
            if (!this.getChapterCodeFromFilename(name)) return false;
            return true;
        });
    }

    /**
     * Extract all image src values that live inside the <main> element.
     */
    extractImagesFromHtml(htmlContent) {
        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;
        const main = document.querySelector('main');
        if (!main) return [];

        const imgs = Array.from(main.querySelectorAll('img'));
        return imgs
            .map((img) => img.getAttribute('src'))
            .filter(Boolean);
    }

    /**
     * Find the "*-170" folder for a given chapter under images/{chapterCode}/.
     * Prefer an exact "{chapterCode}-170" match when multiple candidates exist.
     */
    get170Folder(chapterCode) {
        const chapterFolder = path.join(this.imagesRoot, chapterCode);

        if (!fs.existsSync(chapterFolder) || !fs.statSync(chapterFolder).isDirectory()) {
            return null;
        }

        const childDirs = fs
            .readdirSync(chapterFolder)
            .map((name) => path.join(chapterFolder, name))
            .filter((fullPath) => {
                try {
                    return fs.statSync(fullPath).isDirectory();
                } catch {
                    return false;
                }
            });

        const candidates = childDirs.filter((dirPath) =>
            /-170$/i.test(path.basename(dirPath))
        );

        if (candidates.length === 0) {
            return null;
        }

        const exact = candidates.find(
            (dirPath) => path.basename(dirPath).toLowerCase() === `${chapterCode.toLowerCase()}-170`
        );

        return exact || candidates[0];
    }

    /**
     * Get all image files from the "*-170" folder for a chapter.
     */
    getActualImages(chapterCode) {
        const folder = this.get170Folder(chapterCode);
        if (!folder) {
            return { folder: null, images: [] };
        }

        const files = fs.readdirSync(folder);
        const images = files.filter((file) => this.isImageFile(file));

        return { folder, images };
    }

    /**
     * Basic image-extension check.
     */
    isImageFile(filename) {
        const imageExtensions = [
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.bmp',
            '.tiff',
            '.webp',
            '.JPG',
            '.JPEG',
            '.PNG',
        ];
        const lower = filename.toLowerCase();
        return imageExtensions.some((ext) => lower.endsWith(ext.toLowerCase()));
    }

    /**
     * Compare the images referenced in a single HTML file's <main> with
     * the images present in its "*-170" folder.
     */
    compareSingleHtml(fileName) {
        const chapterCode = this.getChapterCodeFromFilename(fileName);
        if (!chapterCode) {
            return;
        }

        const htmlPath = path.join(this.htmlDir, fileName);

        let htmlContent;
        try {
            htmlContent = fs.readFileSync(htmlPath, 'utf8');
        } catch (error) {
            console.error(`Failed to read HTML file: ${htmlPath}`, error.message);
            return;
        }

        const allMainSrcs = this.extractImagesFromHtml(htmlContent);

        // We only compare images that live in the chapter-specific "*-170" folder,
        // e.g. "images/d1h2/d1h2-170/foo.jpg" or "/images/d1h2/d1h2-170/foo.jpg".
        const used170Srcs = allMainSrcs.filter((src) => {
            const normalized = src.replace(/^\.?\//, '').toLowerCase();
            return (
                normalized.startsWith(`images/${chapterCode.toLowerCase()}/`) &&
                normalized.includes('-170/')
            );
        });
        const used170Filenames = used170Srcs.map((src) => path.basename(src));

        const usedImageSet = new Set(used170Filenames);

        const { folder, images: folderImages } = this.getActualImages(chapterCode);
        const folderImageSet = new Set(folderImages);

        const matches = [];
        const missingInFolder = [];

        usedImageSet.forEach((name) => {
            if (folderImageSet.has(name)) {
                matches.push(name);
            } else {
                missingInFolder.push(name);
            }
        });

        const unusedInHtml = [];
        folderImageSet.forEach((name) => {
            if (!usedImageSet.has(name)) {
                unusedInHtml.push(name);
            }
        });

        const result = {
            chapterCode,
            htmlFile: fileName,
            totalImagesInMain: allMainSrcs.length,
            htmlImageCount: used170Filenames.length,
            folderPath: folder,
            folderImageCount: folderImages.length,
            matches,
            missingInFolder,
            unusedInHtml,
            has170Folder: !!folder,
        };

        this.results.push(result);

        console.log(
            `Processed ${fileName} (${chapterCode}) - main: ${result.htmlImageCount}, ` +
                `folder: ${result.folderImageCount}, matches: ${result.matches.length}, ` +
                `missing in folder: ${result.missingInFolder.length}, ` +
                `unused in HTML: ${result.unusedInHtml.length}`
        );
    }

    /**
     * Process all chapter HTML files.
     */
    processAllHtml() {
        const files = this.listChapterHtmlFiles();
        console.log('Found chapter HTML files:', files);
        files.forEach((file) => this.compareSingleHtml(file));
    }

    /**
     * Generate a minimal text report:
     * only the HTML file name and the images
     * that are missing in the corresponding *-170 folder.
     */
    generateReport() {
        let report = 'HTML IMAGE COMPARISON REPORT (missing images only)\n';
        report += '===================================================\n\n';

        this.results.forEach((result) => {
            // Only show files that actually have missing images
            if (!result.has170Folder || result.missingInFolder.length === 0) {
                return;
            }

            report += `${result.htmlFile}\n`;
            report += 'Missing in folder:\n';
            result.missingInFolder.forEach((name) => {
                report += `  ${name}\n`;
            });
            report += '\n';
        });

        return report;
    }

    /**
     * Save the report to the output folder.
     */
    saveReport(filename = 'image-comparison-report-html.txt') {
        const report = this.generateReport();
        const outputPath = path.join(process.cwd(), 'output', filename);
        fs.writeFileSync(outputPath, report, 'utf8');
        console.log(`\nReport saved to: ${outputPath}`);
    }
}

// Run the comparison over all chapter HTML files.
const comparator = new HtmlImageComparator();
comparator.processAllHtml();
comparator.saveReport();

