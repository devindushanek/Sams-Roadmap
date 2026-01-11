/**
 * Fix Overset Text Script
 * Attempts to automatically resolve overset text issues through various methods
 * Uses conservative approaches first, then more aggressive fixes
 */

#target indesign
#include "json_polyfill.jsx"

    (function () {
        var doc = app.activeDocument;
        var results = {
            fixed: [],
            failed: [],
            summary: {
                totalOverset: 0,
                resolved: 0,
                remaining: 0
            }
        };

        // Configuration
        var config = {
            // How much to reduce tracking (in thousandths of an em)
            maxTrackingReduction: -20,

            // How much to reduce leading (percentage)
            leadingReductionPercent: 0.95,

            // Maximum frame expansion (in points)
            maxFrameExpansion: 36, // 0.5 inch

            // Try auto-sizing (InDesign CS5+)
            useAutoSize: true,

            // Methods to try, in order
            methods: ["tracking", "leading", "expandFrame", "autoSize"]
        };

        // Find all overset text frames
        var oversetFrames = [];

        for (var st = 0; st < doc.stories.length; st++) {
            var story = doc.stories[st];
            for (var tc = 0; tc < story.textContainers.length; tc++) {
                var container = story.textContainers[tc];
                if (container.overflows && container instanceof TextFrame) {
                    oversetFrames.push({
                        frame: container,
                        story: story,
                        originalBounds: container.geometricBounds.slice()
                    });
                }
            }
        }

        results.summary.totalOverset = oversetFrames.length;

        // Fix functions
        function tryReduceTracking(frame) {
            try {
                var story = frame.parentStory;
                var originalTracking = story.paragraphs[0].tracking;

                // Gradually reduce tracking
                for (var t = -5; t >= config.maxTrackingReduction; t -= 5) {
                    story.paragraphs.everyItem().tracking = t;
                    if (!frame.overflows) {
                        return {
                            success: true,
                            method: "tracking",
                            value: t
                        };
                    }
                }

                // Restore original if failed
                story.paragraphs.everyItem().tracking = originalTracking;
                return { success: false };
            } catch (e) {
                return { success: false, error: e.message };
            }
        }

        function tryReduceLeading(frame) {
            try {
                var story = frame.parentStory;
                var paragraphs = story.paragraphs;
                var originalLeadings = [];

                // Store original leadings
                for (var p = 0; p < paragraphs.length; p++) {
                    var para = paragraphs[p];
                    if (para.leading !== Leading.AUTO) {
                        originalLeadings.push({ index: p, value: para.leading });
                    }
                }

                // Reduce leading slightly
                for (var p = 0; p < paragraphs.length; p++) {
                    var para = paragraphs[p];
                    if (para.leading !== Leading.AUTO && typeof para.leading === "number") {
                        para.leading = para.leading * config.leadingReductionPercent;
                    }
                }

                if (!frame.overflows) {
                    return {
                        success: true,
                        method: "leading",
                        value: config.leadingReductionPercent
                    };
                }

                // Restore if failed
                for (var i = 0; i < originalLeadings.length; i++) {
                    paragraphs[originalLeadings[i].index].leading = originalLeadings[i].value;
                }

                return { success: false };
            } catch (e) {
                return { success: false, error: e.message };
            }
        }

        function tryExpandFrame(frame, originalBounds) {
            try {
                var bounds = frame.geometricBounds.slice();
                var maxExpand = config.maxFrameExpansion;

                // Try expanding bottom
                for (var expand = 6; expand <= maxExpand; expand += 6) {
                    bounds[2] = originalBounds[2] + expand;
                    frame.geometricBounds = bounds;

                    if (!frame.overflows) {
                        return {
                            success: true,
                            method: "expandFrame",
                            value: expand + "pt bottom"
                        };
                    }
                }

                // Restore original bounds if failed
                frame.geometricBounds = originalBounds;
                return { success: false };
            } catch (e) {
                frame.geometricBounds = originalBounds;
                return { success: false, error: e.message };
            }
        }

        function tryAutoSize(frame) {
            try {
                // Check if auto-size is available
                if (frame.textFramePreferences.hasOwnProperty("autoSizingType")) {
                    frame.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY;

                    if (!frame.overflows) {
                        return {
                            success: true,
                            method: "autoSize",
                            value: "HEIGHT_ONLY"
                        };
                    }

                    // Reset
                    frame.textFramePreferences.autoSizingType = AutoSizingTypeEnum.OFF;
                }
                return { success: false };
            } catch (e) {
                return { success: false, error: e.message };
            }
        }

        // Process each overset frame
        for (var i = 0; i < oversetFrames.length; i++) {
            var item = oversetFrames[i];
            var frame = item.frame;
            var fixed = false;
            var fixResult = null;

            // Get page info
            var pageNum = "Unknown";
            try {
                pageNum = frame.parentPage.name;
            } catch (e) { }

            // Try each method in order
            for (var m = 0; m < config.methods.length && !fixed; m++) {
                var method = config.methods[m];

                switch (method) {
                    case "tracking":
                        fixResult = tryReduceTracking(frame);
                        break;
                    case "leading":
                        fixResult = tryReduceLeading(frame);
                        break;
                    case "expandFrame":
                        fixResult = tryExpandFrame(frame, item.originalBounds);
                        break;
                    case "autoSize":
                        fixResult = tryAutoSize(frame);
                        break;
                }

                if (fixResult.success) {
                    fixed = true;
                    results.fixed.push({
                        page: pageNum,
                        frameId: frame.id,
                        method: fixResult.method,
                        value: fixResult.value
                    });
                    results.summary.resolved++;
                }
            }

            if (!fixed) {
                results.failed.push({
                    page: pageNum,
                    frameId: frame.id,
                    reason: "All automatic methods failed"
                });
                results.summary.remaining++;
            }
        }

        // Output as JSON string
        var jsonOutput = JSON.stringify(results, null, 2);

        // Write to file for Agent to read
        var outputPath = "c:/Users/devin/Documents/Professional/DevLabs/AI Agent Workspace/indesign_tools/output/fix_overset_report.json";
        var outFile = new File(outputPath);
        outFile.encoding = "UTF-8";
        outFile.open("w");
        outFile.write(jsonOutput);
        outFile.close();

        alert("Overset Text Fix Complete!\nData saved to: " + outFile.fsName);
        return jsonOutput;
    })();
