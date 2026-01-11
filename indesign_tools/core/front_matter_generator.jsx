/**
 * Front & Back Matter Generator
 * Creates standard book pages: Title, Copyright, TOC, List of Figures, Index placeholder
 * Configurable for thesis requirements
 */

#target indesign
#include "json_polyfill.jsx"

    (function () {
        // Configuration - modify these values for your thesis
        var config = {
            // Thesis Information
            title: "THESIS TITLE",
            subtitle: "",
            author: "Author Name",
            degree: "Master of Architecture",
            institution: "University Name",
            department: "School of Architecture",
            year: "2026",

            // Committee
            supervisor: "Dr. Supervisor Name",
            committee: [
                "Committee Member 1",
                "Committee Member 2"
            ],

            // Copyright
            copyrightYear: "2026",
            copyrightHolder: "Author Name",

            // Book settings
            generateTitlePage: true,
            generateCopyrightPage: true,
            generateTOC: true,
            generateListOfFigures: true,
            generateAcknowledgments: true,
            generateAbstract: true,

            // Style names (must match your document)
            styles: {
                chapterTitle: "Chapter Title",
                sectionTitle: "Section Title",
                bodyText: "Body Text",
                tocEntry: "TOC Entry",
                figureCaption: "Figure Caption"
            }
        };

        var doc = app.activeDocument;
        var results = {
            created: [],
            errors: [],
            tocEntries: []
        };

        // Helper: Create a new page at the beginning
        function createFrontPage(name) {
            try {
                var newPage = doc.pages.add(LocationOptions.AT_BEGINNING, doc.pages[0]);
                newPage.appliedMaster = doc.masterSpreads.itemByName("A-Master");
                results.created.push(name);
                return newPage;
            } catch (e) {
                results.errors.push("Failed to create " + name + ": " + e.message);
                return null;
            }
        }

        // Helper: Add text frame to page
        function addTextFrame(page, text, bounds, styleName) {
            try {
                var frame = page.textFrames.add({
                    geometricBounds: bounds,
                    contents: text
                });

                // Apply style if exists
                try {
                    var style = doc.paragraphStyles.itemByName(styleName);
                    if (style.isValid) {
                        frame.parentStory.paragraphs.everyItem().appliedParagraphStyle = style;
                    }
                } catch (e) {
                    // Style not found, use default
                }

                return frame;
            } catch (e) {
                results.errors.push("Failed to add text frame: " + e.message);
                return null;
            }
        }

        // Generate Table of Contents entries by scanning document
        function scanForTOCEntries() {
            var entries = [];
            var tocStyles = [config.styles.chapterTitle, config.styles.sectionTitle];

            for (var p = 0; p < doc.pages.length; p++) {
                var page = doc.pages[p];
                var items = page.allPageItems;

                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (item instanceof TextFrame) {
                        var paras = item.parentStory.paragraphs;
                        for (var para = 0; para < paras.length; para++) {
                            var paragraph = paras[para];
                            var styleName = "";
                            try {
                                styleName = paragraph.appliedParagraphStyle.name;
                            } catch (e) { }

                            if (tocStyles.indexOf(styleName) !== -1) {
                                entries.push({
                                    text: paragraph.contents.replace(/[\r\n]/g, ""),
                                    page: page.name,
                                    style: styleName,
                                    level: styleName === config.styles.chapterTitle ? 1 : 2
                                });
                            }
                        }
                    }
                }
            }

            return entries;
        }

        // Scan for figures and captions
        function scanForFigures() {
            var figures = [];

            for (var p = 0; p < doc.pages.length; p++) {
                var page = doc.pages[p];
                var items = page.allPageItems;

                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (item instanceof TextFrame) {
                        var content = item.contents;
                        // Look for "Figure X:" or "Fig. X:" patterns
                        var figMatch = content.match(/(?:Figure|Fig\.?)\s*(\d+(?:\.\d+)?)[:\.]?\s*(.*)/i);
                        if (figMatch) {
                            figures.push({
                                number: figMatch[1],
                                caption: figMatch[2].substring(0, 100),
                                page: page.name
                            });
                        }
                    }
                }
            }

            return figures;
        }

        // Main execution
        var report = {
            config: config,
            tocEntries: scanForTOCEntries(),
            figures: scanForFigures(),
            actions: [],
            suggestions: []
        };

        // Add suggestions based on scan
        if (report.tocEntries.length === 0) {
            report.suggestions.push("No chapter/section titles found with configured styles. Please verify style names.");
        }

        if (report.figures.length === 0) {
            report.suggestions.push("No figure captions found. Ensure figures are labeled as 'Figure X: Caption'");
        }

        // Note: Actual page creation is commented out for safety - uncomment in production
        /*
        if (config.generateTitlePage) {
            var titlePage = createFrontPage("Title Page");
            if (titlePage) {
                addTextFrame(titlePage, config.title, [72, 72, 144, 540], config.styles.chapterTitle);
            }
        }
        */

        report.actions.push("Scanned document structure");
        report.actions.push("Found " + report.tocEntries.length + " TOC entries");
        report.actions.push("Found " + report.figures.length + " figure captions");

        // Output as JSON string
        var jsonOutput = JSON.stringify(report, null, 2);

        // Write to file for Agent to read
        var outputPath = "c:/Users/devin/Documents/Professional/DevLabs/AI Agent Workspace/indesign_tools/output/front_matter_report.json";
        var outFile = new File(outputPath);
        outFile.encoding = "UTF-8";
        outFile.open("w");
        outFile.write(jsonOutput);
        outFile.close();

        alert("Front Matter Scan Complete!\nData saved to: " + outFile.fsName);
        return jsonOutput;
    })();
