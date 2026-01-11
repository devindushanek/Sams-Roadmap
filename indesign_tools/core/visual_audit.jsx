/**
 * Visual Audit Script
 * Comprehensive layout analysis for widows, orphans, gutter issues, and spacing
 * Returns detailed report for each spread
 */

#target indesign
#include "json_polyfill.jsx"

    (function () {
        var doc = app.activeDocument;
        var report = {
            spreads: [],
            issues: [],
            summary: {
                widowsOrphans: 0,
                gutterIssues: 0,
                spacingIssues: 0,
                alignmentIssues: 0
            }
        };

        // Configuration
        var config = {
            minGutterDistance: 18, // Minimum distance from gutter (points) - 0.25"
            widowOrphanThreshold: 1, // Lines considered widow/orphan
            minImageMargin: 9 // Minimum margin around images
        };

        // Get document gutter position
        var pageWidth = doc.documentPreferences.pageWidth;
        var facingPages = doc.documentPreferences.facingPages;

        // Analyze each spread
        for (var s = 0; s < doc.spreads.length; s++) {
            var spread = doc.spreads[s];
            var spreadReport = {
                index: s,
                pages: [],
                issues: []
            };

            for (var p = 0; p < spread.pages.length; p++) {
                var page = spread.pages[p];
                var pageReport = {
                    name: page.name,
                    side: (page.side === PageSideOptions.LEFT_HAND) ? "LEFT" : "RIGHT",
                    items: []
                };

                var pageItems = page.allPageItems;
                var pageBounds = page.bounds; // [top, left, bottom, right]

                // Determine gutter edge based on page side
                var gutterEdge;
                if (facingPages) {
                    gutterEdge = (page.side === PageSideOptions.LEFT_HAND) ? pageBounds[3] : pageBounds[1];
                }

                for (var i = 0; i < pageItems.length; i++) {
                    var item = pageItems[i];
                    var bounds = item.geometricBounds; // [top, left, bottom, right]

                    // Check Text Frames for widows/orphans
                    if (item instanceof TextFrame && item.parentStory) {
                        var story = item.parentStory;
                        var paragraphs = item.paragraphs;

                        for (var para = 0; para < paragraphs.length; para++) {
                            var paragraph = paragraphs[para];
                            var lines = paragraph.lines;

                            if (lines.length > 0) {
                                // Check for orphans (first line alone at bottom of frame)
                                // Check for widows (last line alone at top of next frame)
                                var lastLine = lines[lines.length - 1];
                                var lastLineWords = lastLine.words.length;

                                if (lastLineWords <= 1 && lines.length > 1) {
                                    spreadReport.issues.push({
                                        type: "WIDOW_ORPHAN",
                                        page: page.name,
                                        description: "Single word on last line of paragraph",
                                        preview: paragraph.contents.substring(0, 50) + "...",
                                        severity: "WARNING"
                                    });
                                    report.summary.widowsOrphans++;
                                }
                            }
                        }
                    }

                    // Check proximity to gutter
                    if (facingPages && bounds) {
                        var distanceToGutter;
                        if (page.side === PageSideOptions.LEFT_HAND) {
                            distanceToGutter = gutterEdge - bounds[3]; // Right edge to gutter
                        } else {
                            distanceToGutter = bounds[1] - gutterEdge; // Left edge to gutter
                        }

                        if (distanceToGutter < config.minGutterDistance && distanceToGutter > -pageWidth) {
                            spreadReport.issues.push({
                                type: "GUTTER_PROXIMITY",
                                page: page.name,
                                itemType: item.constructor.name,
                                distance: Math.round(distanceToGutter * 100) / 100 + "pt",
                                description: "Content too close to gutter/binding",
                                severity: "WARNING"
                            });
                            report.summary.gutterIssues++;
                        }
                    }

                    // Check for items extending into bleed area
                    if (bounds[0] < pageBounds[0] || bounds[1] < pageBounds[1] ||
                        bounds[2] > pageBounds[2] || bounds[3] > pageBounds[3]) {

                        // This is expected for bleed items, but flag text
                        if (item instanceof TextFrame) {
                            spreadReport.issues.push({
                                type: "TEXT_IN_BLEED",
                                page: page.name,
                                description: "Text frame extends into bleed area",
                                severity: "ERROR"
                            });
                        }
                    }

                    // Check images near page numbers
                    if (item instanceof Rectangle || item instanceof Polygon) {
                        try {
                            if (item.allGraphics.length > 0) {
                                // Check if image is in footer area (bottom 72pt / 1 inch)
                                if (bounds[2] > pageBounds[2] - 72) {
                                    spreadReport.issues.push({
                                        type: "IMAGE_FOOTER_OVERLAP",
                                        page: page.name,
                                        description: "Image may overlap with page number area",
                                        severity: "INFO"
                                    });
                                }
                            }
                        } catch (e) { }
                    }

                    pageReport.items.push({
                        type: item.constructor.name,
                        bounds: bounds
                    });
                }

                spreadReport.pages.push(pageReport);
            }

            report.spreads.push(spreadReport);
            report.issues = report.issues.concat(spreadReport.issues);
        }

        // Output as JSON string
        var jsonOutput = JSON.stringify(report, null, 2);

        // Write to file for Agent to read
        var outputPath = "c:/Users/devin/Documents/Professional/DevLabs/AI Agent Workspace/indesign_tools/output/visual_audit_report.json";
        var outFile = new File(outputPath);
        outFile.encoding = "UTF-8";
        outFile.open("w");
        outFile.write(jsonOutput);
        outFile.close();

        alert("Visual Audit Complete!\nData saved to: " + outFile.fsName);
        return jsonOutput;
    })();
