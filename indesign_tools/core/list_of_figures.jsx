/**
 * List of Figures Generator
 * Scans document for figure captions and generates formatted list
 * Supports various caption formats and numbering schemes
 */

#target indesign
#include "json_polyfill.jsx"

    (function () {
        var doc = app.activeDocument;
        var results = {
            figures: [],
            tables: [],
            listOfFiguresText: "",
            listOfTablesText: "",
            statistics: {
                totalFigures: 0,
                totalTables: 0,
                pagesWithFigures: []
            },
            errors: []
        };

        // Configuration
        var config = {
            // Patterns to match figure captions
            figurePatterns: [
                /^(?:Figure|Fig\.?)\s*(\d+(?:\.\d+)?)[:\.\s]+(.+)/i,
                /^(?:Illustration|Image)\s*(\d+(?:\.\d+)?)[:\.\s]+(.+)/i
            ],

            // Patterns to match table captions
            tablePatterns: [
                /^(?:Table)\s*(\d+(?:\.\d+)?)[:\.\s]+(.+)/i
            ],

            // Style names that typically contain captions
            captionStyles: [
                "Figure Caption",
                "Caption",
                "Image Caption",
                "Table Caption",
                "Illustration Caption"
            ],

            // Leader character
            leaderChar: ".",
            leaderWidth: 70,

            // Truncate long captions
            maxCaptionLength: 60
        };

        // Helper: Create leader
        function createLeader(textLength, pageLength) {
            var leaderLen = config.leaderWidth - textLength - pageLength;
            if (leaderLen < 3) leaderLen = 3;
            var leader = " ";
            for (var i = 0; i < leaderLen; i++) {
                leader += config.leaderChar;
            }
            return leader + " ";
        }

        // Helper: Truncate text
        function truncate(text, maxLen) {
            if (text.length <= maxLen) return text;
            return text.substring(0, maxLen - 3) + "...";
        }

        // Helper: Extract figure/table info from text
        function extractCaption(text, patterns) {
            for (var p = 0; p < patterns.length; p++) {
                var match = text.match(patterns[p]);
                if (match) {
                    return {
                        number: match[1],
                        caption: match[2].trim()
                    };
                }
            }
            return null;
        }

        // Build caption style lookup
        var captionStyleSet = {};
        for (var i = 0; i < config.captionStyles.length; i++) {
            captionStyleSet[config.captionStyles[i]] = true;
        }

        // Scan all pages
        var pagesWithFigures = {};

        for (var p = 0; p < doc.pages.length; p++) {
            var page = doc.pages[p];
            var pageName = page.name;
            var items = page.allPageItems;

            for (var i = 0; i < items.length; i++) {
                var item = items[i];

                if (item instanceof TextFrame) {
                    var content = item.contents;
                    var styleName = "";

                    try {
                        if (item.paragraphs.length > 0) {
                            styleName = item.paragraphs[0].appliedParagraphStyle.name;
                        }
                    } catch (e) { }

                    // Check for figures
                    var figInfo = extractCaption(content, config.figurePatterns);
                    if (figInfo) {
                        results.figures.push({
                            number: figInfo.number,
                            caption: figInfo.caption,
                            page: pageName,
                            pageIndex: p,
                            style: styleName
                        });
                        pagesWithFigures[pageName] = true;
                    }

                    // Check for tables
                    var tableInfo = extractCaption(content, config.tablePatterns);
                    if (tableInfo) {
                        results.tables.push({
                            number: tableInfo.number,
                            caption: tableInfo.caption,
                            page: pageName,
                            pageIndex: p,
                            style: styleName
                        });
                    }

                    // Also check by style name if content looks like a caption
                    if (captionStyleSet.hasOwnProperty(styleName) && !figInfo && !tableInfo) {
                        // Might be an unlabeled caption
                        var trimmedContent = content.trim();
                        if (trimmedContent.length > 0 && trimmedContent.length < 200) {
                            // Check if it starts with a number
                            var numMatch = trimmedContent.match(/^(\d+(?:\.\d+)?)[:\.\s]+(.+)/);
                            if (numMatch) {
                                results.figures.push({
                                    number: numMatch[1],
                                    caption: numMatch[2],
                                    page: pageName,
                                    pageIndex: p,
                                    style: styleName,
                                    inferred: true
                                });
                            }
                        }
                    }
                }
            }
        }

        // Sort by number (accounting for X.Y format)
        function sortByNumber(a, b) {
            var aParts = a.number.split(".");
            var bParts = b.number.split(".");

            for (var i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                var aVal = parseInt(aParts[i] || 0);
                var bVal = parseInt(bParts[i] || 0);
                if (aVal !== bVal) return aVal - bVal;
            }
            return 0;
        }

        results.figures.sort(sortByNumber);
        results.tables.sort(sortByNumber);

        // Generate List of Figures text
        var lofLines = [];
        lofLines.push("LIST OF FIGURES");
        lofLines.push("");

        for (var f = 0; f < results.figures.length; f++) {
            var fig = results.figures[f];
            var entry = "Figure " + fig.number + ": " + truncate(fig.caption, config.maxCaptionLength);
            var leader = createLeader(entry.length, fig.page.length);
            lofLines.push(entry + leader + fig.page);
        }

        results.listOfFiguresText = lofLines.join("\n");

        // Generate List of Tables text
        if (results.tables.length > 0) {
            var lotLines = [];
            lotLines.push("LIST OF TABLES");
            lotLines.push("");

            for (var t = 0; t < results.tables.length; t++) {
                var tbl = results.tables[t];
                var entry = "Table " + tbl.number + ": " + truncate(tbl.caption, config.maxCaptionLength);
                var leader = createLeader(entry.length, tbl.page.length);
                lotLines.push(entry + leader + tbl.page);
            }

            results.listOfTablesText = lotLines.join("\n");
        }

        // Statistics
        results.statistics.totalFigures = results.figures.length;
        results.statistics.totalTables = results.tables.length;
        for (var pg in pagesWithFigures) {
            if (pagesWithFigures.hasOwnProperty(pg)) {
                results.statistics.pagesWithFigures.push(pg);
            }
        }

        // Output as JSON string
        var jsonOutput = JSON.stringify(results, null, 2);

        // Write to file for Agent to read
        var outputPath = "c:/Users/devin/Documents/Professional/DevLabs/AI Agent Workspace/indesign_tools/output/lof_report.json";
        var outFile = new File(outputPath);
        outFile.encoding = "UTF-8";
        outFile.open("w");
        outFile.write(jsonOutput);
        outFile.close();

        alert("List of Figures Generation Complete!\nData saved to: " + outFile.fsName);
        return jsonOutput;
    })();
