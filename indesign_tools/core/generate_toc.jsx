/**
 * Table of Contents Generator
 * Creates a formatted TOC based on paragraph styles in the document
 * Supports multiple levels and custom formatting
 */

#target indesign
#include "json_polyfill.jsx"

    (function () {
        var doc = app.activeDocument;
        var results = {
            entries: [],
            generated: false,
            tocText: "",
            config: {},
            errors: []
        };

        // Configuration - customize these for your thesis
        var config = {
            // Paragraph styles to include in TOC (in order of hierarchy)
            tocStyles: [
                { styleName: "Chapter Title", level: 1, prefix: "" },
                { styleName: "Section Title", level: 2, prefix: "    " },
                { styleName: "Subsection Title", level: 3, prefix: "        " },
                { styleName: "Heading 1", level: 1, prefix: "" },
                { styleName: "Heading 2", level: 2, prefix: "    " },
                { styleName: "Heading 3", level: 3, prefix: "        " }
            ],

            // Leader style between title and page number
            leaderCharacter: ".",
            leaderSpacing: 80, // Approximate character count for leader

            // Page number formatting
            includePageNumbers: true,
            pageNumberPosition: "right", // "right" or "left"

            // Output settings
            outputAsText: true, // If true, generates text; if false, creates InDesign TOC

            // Front matter pages to skip
            skipPages: ["i", "ii", "iii", "iv", "v"]
        };

        results.config = config;

        // Helper: Create leader string
        function createLeader(titleLength, pageNumLength) {
            var totalWidth = config.leaderSpacing;
            var leaderLength = totalWidth - titleLength - pageNumLength;
            if (leaderLength < 3) leaderLength = 3;

            var leader = " ";
            for (var i = 0; i < leaderLength; i++) {
                leader += config.leaderCharacter;
            }
            leader += " ";
            return leader;
        }

        // Build style name lookup
        var styleNameMap = {};
        for (var i = 0; i < config.tocStyles.length; i++) {
            styleNameMap[config.tocStyles[i].styleName] = config.tocStyles[i];
        }

        // Scan document for TOC entries
        var entries = [];

        for (var p = 0; p < doc.pages.length; p++) {
            var page = doc.pages[p];
            var pageName = page.name;

            // Skip front matter pages
            if (config.skipPages.indexOf(pageName.toLowerCase()) !== -1) {
                continue;
            }

            var items = page.allPageItems;

            for (var i = 0; i < items.length; i++) {
                var item = items[i];

                if (item instanceof TextFrame) {
                    try {
                        var paragraphs = item.paragraphs;

                        for (var para = 0; para < paragraphs.length; para++) {
                            var paragraph = paragraphs[para];
                            var styleName = "";

                            try {
                                styleName = paragraph.appliedParagraphStyle.name;
                            } catch (e) {
                                continue;
                            }

                            if (styleNameMap.hasOwnProperty(styleName)) {
                                var tocConfig = styleNameMap[styleName];
                                var text = paragraph.contents.replace(/[\r\n\t]/g, "").trim();

                                if (text.length > 0) {
                                    entries.push({
                                        text: text,
                                        page: pageName,
                                        level: tocConfig.level,
                                        prefix: tocConfig.prefix,
                                        styleName: styleName,
                                        pageIndex: p
                                    });
                                }
                            }
                        }
                    } catch (e) {
                        results.errors.push("Error processing text frame: " + e.message);
                    }
                }
            }
        }

        // Sort entries by page order
        entries.sort(function (a, b) {
            return a.pageIndex - b.pageIndex;
        });

        // Remove duplicates (same text on same page)
        var uniqueEntries = [];
        var seen = {};
        for (var e = 0; e < entries.length; e++) {
            var key = entries[e].text + "|" + entries[e].page;
            if (!seen.hasOwnProperty(key)) {
                seen[key] = true;
                uniqueEntries.push(entries[e]);
            }
        }

        results.entries = uniqueEntries;

        // Generate TOC text
        var tocLines = [];
        tocLines.push("TABLE OF CONTENTS");
        tocLines.push("");

        for (var t = 0; t < uniqueEntries.length; t++) {
            var entry = uniqueEntries[t];
            var line = entry.prefix + entry.text;

            if (config.includePageNumbers) {
                var leader = createLeader(line.length, entry.page.length);
                line += leader + entry.page;
            }

            tocLines.push(line);
        }

        results.tocText = tocLines.join("\n");
        results.generated = true;

        // If using InDesign's built-in TOC feature
        if (!config.outputAsText) {
            try {
                // Check if TOC style exists
                var tocStyle = null;
                try {
                    tocStyle = doc.tocStyles.itemByName("Thesis TOC");
                } catch (e) {
                    // Create TOC style
                    tocStyle = doc.tocStyles.add({ name: "Thesis TOC" });
                }

                results.nativeTocAvailable = true;
            } catch (e) {
                results.errors.push("Could not create native TOC: " + e.message);
            }
        }

        // Output as JSON string
        var jsonOutput = JSON.stringify(results, null, 2);

        // Write to file for Agent to read
        var outputPath = "c:/Users/devin/Documents/Professional/DevLabs/AI Agent Workspace/indesign_tools/output/toc_report.json";
        var outFile = new File(outputPath);
        outFile.encoding = "UTF-8";
        outFile.open("w");
        outFile.write(jsonOutput);
        outFile.close();

        alert("TOC Generation Complete!\nData saved to: " + outFile.fsName);
        return jsonOutput;
    })();
