const fs = require('fs');
const path = require('path');

class ImageComparator {
    constructor() {
        this.jsonDir = '/Users/basdoppen/Code/HuC/NMGN/output/json';
        this.imagesDir = '/Users/basdoppen/Code/HuC/NMGN/output/html-site/images';
        this.results = [];
    }

    // Extract image filenames from JSON content
    extractImagesFromJson(jsonContent) {
        const images = [];
        
        if (jsonContent.content && Array.isArray(jsonContent.content)) {
            jsonContent.content.forEach(item => {
                if (item.type === 'img' && item.imagedata && item.imagedata.filename) {
                    images.push(item.imagedata.filename);
                }
            });
        }
        
        return images;
    }

    // Get actual image files from folder
    getActualImages(chapterFolder) {
        const imageFolder = path.join(this.imagesDir, chapterFolder, `${chapterFolder}-170`);
        const images = [];
        
        if (fs.existsSync(imageFolder)) {
            const files = fs.readdirSync(imageFolder);
            files.forEach(file => {
                if (this.isImageFile(file)) {
                    images.push(file);
                }
            });
        }
        
        return images;
    }

    // Check if file is an image
    isImageFile(filename) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.JPG', '.JPEG', '.PNG'];
        return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext.toLowerCase()));
    }

    // Extract ID prefix from filename (everything before first underscore)
    extractIdPrefix(filename) {
        const match = filename.match(/^([^_]+)/);
        return match ? match[1] : null;
    }

    // Compare images between JSON and actual files
    compareChapter(chapterName) {
        const jsonFile = path.join(this.jsonDir, `${chapterName}.json`);
        
        if (!fs.existsSync(jsonFile)) {
            console.log(`JSON file not found: ${jsonFile}`);
            return;
        }

        try {
            const jsonContent = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
            const jsonImages = this.extractImagesFromJson(jsonContent);
            const actualImages = this.getActualImages(chapterName);
            
            console.log(`\n=== ${chapterName} ===`);
            console.log(`JSON images: ${jsonImages.length}`);
            console.log(`Actual images: ${actualImages.length}`);
            
            const comparison = {
                chapter: chapterName,
                jsonImages: jsonImages,
                actualImages: actualImages,
                matches: [],
                mismatches: [],
                missingInActual: [],
                missingInJson: []
            };

            // Find matches and mismatches
            jsonImages.forEach(jsonImg => {
                const jsonId = this.extractIdPrefix(jsonImg);
                let found = false;
                
                actualImages.forEach(actualImg => {
                    const actualId = this.extractIdPrefix(actualImg);
                    
                    if (jsonId && actualId && jsonId === actualId) {
                        if (jsonImg === actualImg) {
                            comparison.matches.push({
                                json: jsonImg,
                                actual: actualImg,
                                status: 'exact_match'
                            });
                        } else {
                            comparison.mismatches.push({
                                json: jsonImg,
                                actual: actualImg,
                                status: 'id_match_different_name'
                            });
                        }
                        found = true;
                    }
                });
                
                if (!found) {
                    comparison.missingInActual.push(jsonImg);
                }
            });

            // Find images in actual folder not mentioned in JSON
            actualImages.forEach(actualImg => {
                const actualId = this.extractIdPrefix(actualImg);
                let found = false;
                
                jsonImages.forEach(jsonImg => {
                    const jsonId = this.extractIdPrefix(jsonImg);
                    if (jsonId && actualId && jsonId === actualId) {
                        found = true;
                    }
                });
                
                if (!found) {
                    comparison.missingInJson.push(actualImg);
                }
            });

            this.results.push(comparison);
            
            // Log results for this chapter
            console.log(`Exact matches: ${comparison.matches.length}`);
            console.log(`ID matches (different names): ${comparison.mismatches.length}`);
            console.log(`Missing in actual folder: ${comparison.missingInActual.length}`);
            console.log(`Missing in JSON: ${comparison.missingInJson.length}`);
            
        } catch (error) {
            console.error(`Error processing ${chapterName}:`, error.message);
        }
    }

    // Process all chapters
    processAllChapters() {
        const jsonFiles = fs.readdirSync(this.jsonDir)
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''))
            .filter(file => file !== 'all_chapters'); // Skip the combined file

        console.log('Processing chapters:', jsonFiles);
        
        jsonFiles.forEach(chapter => {
            this.compareChapter(chapter);
        });
    }

    // Process single chapter for testing
    processSingleChapter(chapterName) {
        console.log(`Processing single chapter: ${chapterName}`);
        this.compareChapter(chapterName);
    }

    // Generate detailed report
    generateReport() {
        let report = 'IMAGE COMPARISON REPORT\n';
        report += '======================\n\n';
        report += `Generated: ${new Date().toLocaleString()}\n\n`;

        this.results.forEach(result => {
            report += `\nCHAPTER: ${result.chapter}\n`;
            report += `${'='.repeat(50)}\n\n`;
            
            report += `SUMMARY:\n`;
            report += `- JSON images: ${result.jsonImages.length}\n`;
            report += `- Actual images: ${result.actualImages.length}\n`;
            report += `- Exact matches: ${result.matches.length}\n`;
            report += `- ID matches (different names): ${result.mismatches.length}\n`;
            report += `- Missing in actual folder: ${result.missingInActual.length}\n`;
            report += `- Missing in JSON: ${result.missingInJson.length}\n\n`;

            if (result.matches.length > 0) {
                report += `EXACT MATCHES:\n`;
                result.matches.forEach(match => {
                    report += `  ✓ ${match.json}\n`;
                });
                report += '\n';
            }

            if (result.mismatches.length > 0) {
                report += `ID MATCHES (DIFFERENT NAMES):\n`;
                result.mismatches.forEach(mismatch => {
                    report += `  ~ JSON: ${mismatch.json}\n`;
                    report += `    Actual: ${mismatch.actual}\n`;
                });
                report += '\n';
            }

            if (result.missingInActual.length > 0) {
                report += `MISSING IN ACTUAL FOLDER:\n`;
                result.missingInActual.forEach(img => {
                    report += `  ✗ ${img}\n`;
                });
                report += '\n';
            }

            if (result.missingInJson.length > 0) {
                report += `MISSING IN JSON:\n`;
                result.missingInJson.forEach(img => {
                    report += `  ? ${img}\n`;
                });
                report += '\n';
            }

            report += '\n';
        });

        // Overall summary
        const totalJsonImages = this.results.reduce((sum, r) => sum + r.jsonImages.length, 0);
        const totalActualImages = this.results.reduce((sum, r) => sum + r.actualImages.length, 0);
        const totalMatches = this.results.reduce((sum, r) => sum + r.matches.length, 0);
        const totalMismatches = this.results.reduce((sum, r) => sum + r.mismatches.length, 0);
        const totalMissingInActual = this.results.reduce((sum, r) => sum + r.missingInActual.length, 0);
        const totalMissingInJson = this.results.reduce((sum, r) => sum + r.missingInJson.length, 0);

        report += `\nOVERALL SUMMARY\n`;
        report += `${'='.repeat(50)}\n`;
        report += `Total JSON images: ${totalJsonImages}\n`;
        report += `Total actual images: ${totalActualImages}\n`;
        report += `Total exact matches: ${totalMatches}\n`;
        report += `Total ID matches: ${totalMismatches}\n`;
        report += `Total missing in actual: ${totalMissingInActual}\n`;
        report += `Total missing in JSON: ${totalMissingInJson}\n`;

        return report;
    }

    // Generate mismatched images list
    generateMismatchedImagesList() {
        let mismatchedList = '';
        
        this.results.forEach(result => {
            if (result.mismatches.length > 0) {
                result.mismatches.forEach(mismatch => {
                    mismatchedList += `["${mismatch.json}", "${mismatch.actual}"],\n`;
                });
            }
        });
        
        return mismatchedList;
    }

    // Save report to file
    saveReport(filename = 'image-comparison-report.txt') {
        const report = this.generateReport();
        const outputPath = path.join('/Users/basdoppen/Code/HuC/NMGN/output', filename);
        
        fs.writeFileSync(outputPath, report, 'utf8');
        console.log(`\nReport saved to: ${outputPath}`);
    }

    // Save mismatched images to file
    saveMismatchedImages(filename = 'mismatched-images.txt') {
        const mismatchedList = this.generateMismatchedImagesList();
        const outputPath = path.join('/Users/basdoppen/Code/HuC/NMGN/output', filename);
        
        fs.writeFileSync(outputPath, mismatchedList, 'utf8');
        console.log(`\nMismatched images list saved to: ${outputPath}`);
    }
}

// Run the comparison
const comparator = new ImageComparator();
// Test with just one chapter first
comparator.processSingleChapter('d1h2');
comparator.saveReport();
comparator.saveMismatchedImages();
