/**
 * Citation Scanner Script
 * Scans document for citations, footnotes, and bibliography entries
 * Identifies formatting inconsistencies and missing references
 */

#target indesign
#include "json_polyfill.jsx"

    (function () {
        var doc = app.activeDocument;
        var results = {
            citations: [],
            footnotes: [],
            endnotes: [],
            bibliography: null,
            issues: [],
            statistics: {
                totalCitations: 0,
                totalFootnotes: 0,
                uniqueAuthors: [],
                citationStyles: []
            }
        };

        // Common citation patterns
        var patterns = {
            // APA: (Author, Year) or (Author, Year, p. X)
            apa: /\(([A-Z][a-zA-Z]+(?:\s+(?:&|and)\s+[A-Z][a-zA-Z]+)*),?\s*(\d{4})[a-z]?(?:,\s*p+\.\s*\d+(?:-\d+)?)?\)/g,

            // MLA: (Author Page)
            mla: /\(([A-Z][a-zA-Z]+(?:\s+(?:and|&)\s+[A-Z][a-zA-Z]+)*)\s+(\d+(?:-\d+)?)\)/g,

            // Chicago numeric: [1] or (1)
            chicagoNumeric: /[\[\(](\d+)[\]\)]/g,

            // Harvard: (Author Year)
            harvard: /\(([A-Z][a-zA-Z]+(?:\s+(?:&|and)\s+[A-Z][a-zA-Z]+)*)\s+(\d{4})[a-z]?\)/g,

            // Et al patterns
            etAl: /et\s+al\.?/gi
        };

        // Scan all text frames for citations
        var allStories = doc.stories;
        for (var s = 0; s < allStories.length; s++) {
            var story = allStories[s];
            var text = story.contents;

            // Find APA-style citations
            var apaMatches = text.match(patterns.apa);
            if (apaMatches) {
                for (var i = 0; i < apaMatches.length; i++) {
                    results.citations.push({
                        text: apaMatches[i],
                        style: "APA",
                        storyIndex: s
                    });

                    // Extract author
                    var authorMatch = apaMatches[i].match(/\(([A-Z][a-zA-Z]+)/);
                    if (authorMatch && results.statistics.uniqueAuthors.indexOf(authorMatch[1]) === -1) {
                        results.statistics.uniqueAuthors.push(authorMatch[1]);
                    }
                }
                if (results.statistics.citationStyles.indexOf("APA") === -1) {
                    results.statistics.citationStyles.push("APA");
                }
            }

            // Find Chicago numeric citations
            var chicagoMatches = text.match(patterns.chicagoNumeric);
            if (chicagoMatches) {
                for (var j = 0; j < chicagoMatches.length; j++) {
                    // Distinguish from page numbers by context
                    results.citations.push({
                        text: chicagoMatches[j],
                        style: "Chicago/Numeric",
                        storyIndex: s
                    });
                }
                if (results.statistics.citationStyles.indexOf("Chicago/Numeric") === -1) {
                    results.statistics.citationStyles.push("Chicago/Numeric");
                }
            }
        }

        // Collect footnotes by iterating through stories
        for (var s = 0; s < doc.stories.length; s++) {
            var story = doc.stories[s];
            try {
                for (var f = 0; f < story.footnotes.length; f++) {
                    var footnote = story.footnotes[f];
                    results.footnotes.push({
                        index: results.footnotes.length + 1,
                        text: footnote.contents.substring(0, 200) + (footnote.contents.length > 200 ? "..." : ""),
                        storyLocation: s
                    });
                }
            } catch (e) {
                // Story might not support footnotes or other error
            }
        }

        // Collect endnotes if available (InDesign CC 2018+)
        try {
            if (doc.endnotes) {
                for (var e = 0; e < doc.endnotes.length; e++) {
                    var endnote = doc.endnotes[e];
                    results.endnotes.push({
                        index: e + 1,
                        text: endnote.contents.substring(0, 200)
                    });
                }
            }
        } catch (err) {
            // Endnotes not supported in this version
        }

        // Look for bibliography/references section
        for (var p = 0; p < doc.pages.length; p++) {
            var pageItems = doc.pages[p].allPageItems;
            for (var pi = 0; pi < pageItems.length; pi++) {
                var item = pageItems[pi];
                if (item instanceof TextFrame) {
                    var content = item.contents.toLowerCase();
                    if (content.indexOf("bibliography") !== -1 ||
                        content.indexOf("references") !== -1 ||
                        content.indexOf("works cited") !== -1 ||
                        content.indexOf("sources") !== -1) {
                        results.bibliography = {
                            page: doc.pages[p].name,
                            preview: item.contents.substring(0, 500),
                            frameId: item.id
                        };
                        break;
                    }
                }
            }
            if (results.bibliography) break;
        }

        // Check for citation style inconsistencies
        if (results.statistics.citationStyles.length > 1) {
            results.issues.push({
                type: "STYLE_INCONSISTENCY",
                message: "Multiple citation styles detected: " + results.statistics.citationStyles.join(", "),
                severity: "HIGH"
            });
        }

        // Check for orphaned citations (mentioned but not in bibliography)
        // This is a simplified check - full implementation would require parsing bibliography
        if (!results.bibliography && results.citations.length > 0) {
            results.issues.push({
                type: "MISSING_BIBLIOGRAPHY",
                message: "Citations found but no bibliography/references section detected",
                severity: "HIGH"
            });
        }

        results.statistics.totalCitations = results.citations.length;
        results.statistics.totalFootnotes = results.footnotes.length;

        // Output as JSON string
        var jsonOutput = JSON.stringify(results, null, 2);

        // Write to file for Agent to read
        var outputPath = "c:/Users/devin/Documents/Professional/DevLabs/AI Agent Workspace/indesign_tools/output/citation_report.json";
        var outFile = new File(outputPath);
        outFile.encoding = "UTF-8";
        outFile.open("w");
        outFile.write(jsonOutput);
        outFile.close();

        alert("Citation Scan Complete!\nData saved to: " + outFile.fsName);
        return jsonOutput;
    })();
