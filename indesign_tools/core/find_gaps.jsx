/**
 * Find Gaps Script
 * Identifies empty frames, placeholder text, and layout gaps in the document
 * Essential for thesis finalization workflow
 */

#target indesign
#include "json_polyfill.jsx"

    (function () {
        var doc = app.activeDocument;
        var gaps = {
            emptyTextFrames: [],
            placeholderText: [],
            emptyGraphicFrames: [],
            oversetText: [],
            unplacedImages: [],
            summary: {
                totalIssues: 0,
                pagesWithIssues: []
            }
        };

        var pagesWithIssues = {};

        // Iterate through all pages
        for (var p = 0; p < doc.pages.length; p++) {
            var page = doc.pages[p];
            var pageItems = page.allPageItems;

            for (var i = 0; i < pageItems.length; i++) {
                var item = pageItems[i];

                // Check Text Frames
                if (item instanceof TextFrame) {
                    var content = item.contents;
                    var bounds = item.geometricBounds;
                    var location = {
                        page: page.name,
                        bounds: {
                            top: bounds[0],
                            left: bounds[1],
                            bottom: bounds[2],
                            right: bounds[3]
                        }
                    };

                    // Empty text frame
                    if (content === "" || content.replace(/\s/g, "") === "") {
                        gaps.emptyTextFrames.push({
                            id: item.id,
                            location: location,
                            label: item.label || "Unlabeled"
                        });
                        pagesWithIssues[page.name] = true;
                    }

                    // Placeholder text (lorem ipsum detection)
                    var lowerContent = content.toLowerCase();
                    if (lowerContent.indexOf("lorem ipsum") !== -1 ||
                        lowerContent.indexOf("[placeholder]") !== -1 ||
                        lowerContent.indexOf("[insert") !== -1 ||
                        lowerContent.indexOf("xxx") !== -1 ||
                        lowerContent.indexOf("tbd") !== -1) {
                        gaps.placeholderText.push({
                            id: item.id,
                            location: location,
                            preview: content.substring(0, 100) + (content.length > 100 ? "..." : ""),
                            label: item.label || "Unlabeled"
                        });
                        pagesWithIssues[page.name] = true;
                    }

                    // Overset text
                    if (item.overflows) {
                        var parentStory = item.parentStory;
                        var oversetChars = 0;
                        if (parentStory) {
                            // Calculate overset amount
                            var storyLength = parentStory.characters.length;
                            var visibleLength = 0;
                            for (var tf = 0; tf < parentStory.textContainers.length; tf++) {
                                var container = parentStory.textContainers[tf];
                                if (container.characters) {
                                    visibleLength += container.characters.length;
                                }
                            }
                            oversetChars = storyLength - visibleLength;
                        }
                        gaps.oversetText.push({
                            id: item.id,
                            location: location,
                            oversetCharacters: oversetChars,
                            label: item.label || "Unlabeled"
                        });
                        pagesWithIssues[page.name] = true;
                    }
                }

                // Check Graphic Frames
                if (item instanceof Rectangle || item instanceof Oval || item instanceof Polygon) {
                    try {
                        if (item.contentType === ContentType.GRAPHIC_TYPE) {
                            var graphics = item.allGraphics;
                            if (graphics.length === 0) {
                                var bounds = item.geometricBounds;
                                gaps.emptyGraphicFrames.push({
                                    id: item.id,
                                    location: {
                                        page: page.name,
                                        bounds: {
                                            top: bounds[0],
                                            left: bounds[1],
                                            bottom: bounds[2],
                                            right: bounds[3]
                                        }
                                    },
                                    label: item.label || "Unlabeled"
                                });
                                pagesWithIssues[page.name] = true;
                            }
                        }
                    } catch (e) {
                        // Item might not support contentType property
                    }
                }
            }
        }

        // Check for missing links
        for (var l = 0; l < doc.links.length; l++) {
            var link = doc.links[l];
            if (link.status === LinkStatus.LINK_MISSING) {
                gaps.unplacedImages.push({
                    name: link.name,
                    filePath: link.filePath,
                    status: "MISSING"
                });
            }
        }

        // Build summary
        for (var pg in pagesWithIssues) {
            if (pagesWithIssues.hasOwnProperty(pg)) {
                gaps.summary.pagesWithIssues.push(pg);
            }
        }
        gaps.summary.totalIssues =
            gaps.emptyTextFrames.length +
            gaps.placeholderText.length +
            gaps.emptyGraphicFrames.length +
            gaps.oversetText.length +
            gaps.unplacedImages.length;

        // Output as JSON string
        var jsonOutput = JSON.stringify(gaps, null, 2);

        // Write to file for Agent to read
        var outputPath = "c:/Users/devin/Documents/Professional/DevLabs/AI Agent Workspace/indesign_tools/output/gaps_report.json";
        var outFile = new File(outputPath);
        outFile.encoding = "UTF-8";
        outFile.open("w");
        outFile.write(jsonOutput);
        outFile.close();

        alert("Gap Analysis Complete!\nData saved to: " + outFile.fsName);
        return jsonOutput;
    })();
