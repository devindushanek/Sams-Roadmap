/**
 * Print Preflight Script
 * Comprehensive print-readiness check for thesis book production
 * Verifies bleed, fonts, images, colors, and common print issues
 */

#target indesign
#include "json_polyfill.jsx"

    (function () {
        var doc = app.activeDocument;
        var report = {
            documentName: doc.name,
            timestamp: new Date().toString(),
            status: "PASS",
            checks: {
                bleed: { status: "PASS", details: {} },
                fonts: { status: "PASS", issues: [] },
                images: { status: "PASS", issues: [] },
                colors: { status: "PASS", issues: [] },
                textIssues: { status: "PASS", issues: [] },
                pageSetup: { status: "PASS", details: {} }
            },
            summary: {
                errors: 0,
                warnings: 0,
                info: 0
            }
        };

        // Required bleed for professional printing (in points, 9pt = 0.125")
        var MINIMUM_BLEED = 9;

        // Check Bleed Settings
        var bleed = {
            top: doc.documentPreferences.documentBleedTopOffset,
            bottom: doc.documentPreferences.documentBleedBottomOffset,
            inside: doc.documentPreferences.documentBleedInsideOrLeftOffset,
            outside: doc.documentPreferences.documentBleedOutsideOrRightOffset
        };

        report.checks.bleed.details = bleed;

        if (bleed.top < MINIMUM_BLEED || bleed.bottom < MINIMUM_BLEED ||
            bleed.inside < MINIMUM_BLEED || bleed.outside < MINIMUM_BLEED) {
            report.checks.bleed.status = "WARNING";
            report.checks.bleed.message = "Bleed less than 0.125\" (9pt). Standard print bleed is 0.125\" - 0.25\"";
            report.summary.warnings++;
        }

        // Check Fonts
        for (var f = 0; f < doc.fonts.length; f++) {
            var font = doc.fonts[f];
            if (font.status === FontStatus.NOT_AVAILABLE) {
                report.checks.fonts.issues.push({
                    font: font.name,
                    family: font.fontFamily,
                    status: "MISSING",
                    severity: "ERROR"
                });
                report.checks.fonts.status = "FAIL";
                report.summary.errors++;
            } else if (font.status === FontStatus.SUBSTITUTED) {
                report.checks.fonts.issues.push({
                    font: font.name,
                    family: font.fontFamily,
                    status: "SUBSTITUTED",
                    severity: "WARNING"
                });
                if (report.checks.fonts.status === "PASS") {
                    report.checks.fonts.status = "WARNING";
                }
                report.summary.warnings++;
            }
        }

        // Check Images/Links
        for (var l = 0; l < doc.links.length; l++) {
            var link = doc.links[l];

            if (link.status === LinkStatus.LINK_MISSING) {
                report.checks.images.issues.push({
                    name: link.name,
                    status: "MISSING",
                    severity: "ERROR"
                });
                report.checks.images.status = "FAIL";
                report.summary.errors++;
            } else if (link.status === LinkStatus.LINK_OUT_OF_DATE) {
                report.checks.images.issues.push({
                    name: link.name,
                    status: "OUT_OF_DATE",
                    severity: "WARNING"
                });
                if (report.checks.images.status === "PASS") {
                    report.checks.images.status = "WARNING";
                }
                report.summary.warnings++;
            }

            // Check image resolution
            try {
                var graphic = link.parent;
                if (graphic && graphic.effectivePpi) {
                    var ppi = graphic.effectivePpi;
                    var minPpi = Math.min(ppi[0], ppi[1]);
                    if (minPpi < 150) {
                        report.checks.images.issues.push({
                            name: link.name,
                            status: "LOW_RESOLUTION",
                            ppi: minPpi,
                            severity: "ERROR",
                            message: "Image resolution below 150 PPI (current: " + Math.round(minPpi) + " PPI)"
                        });
                        report.checks.images.status = "FAIL";
                        report.summary.errors++;
                    } else if (minPpi < 300) {
                        report.checks.images.issues.push({
                            name: link.name,
                            status: "MEDIUM_RESOLUTION",
                            ppi: minPpi,
                            severity: "WARNING",
                            message: "Image resolution below 300 PPI (current: " + Math.round(minPpi) + " PPI)"
                        });
                        if (report.checks.images.status === "PASS") {
                            report.checks.images.status = "WARNING";
                        }
                        report.summary.warnings++;
                    }
                }
            } catch (e) {
                // Skip resolution check for this item
            }
        }

        // Check for RGB colors (should be CMYK for print)
        for (var s = 0; s < doc.swatches.length; s++) {
            var swatch = doc.swatches[s];
            try {
                if (swatch.constructor.name === "Color" && swatch.space === ColorSpace.RGB) {
                    report.checks.colors.issues.push({
                        name: swatch.name,
                        status: "RGB_COLOR",
                        severity: "WARNING",
                        message: "RGB color found. Convert to CMYK for print."
                    });
                    if (report.checks.colors.status === "PASS") {
                        report.checks.colors.status = "WARNING";
                    }
                    report.summary.warnings++;
                }
            } catch (e) {
                // Skip this swatch
            }
        }

        // Check for overset text
        for (var st = 0; st < doc.stories.length; st++) {
            var story = doc.stories[st];
            for (var tc = 0; tc < story.textContainers.length; tc++) {
                var container = story.textContainers[tc];
                if (container.overflows) {
                    // Find the page
                    var pageNum = "Unknown";
                    try {
                        pageNum = container.parentPage.name;
                    } catch (e) { }

                    report.checks.textIssues.issues.push({
                        type: "OVERSET_TEXT",
                        page: pageNum,
                        severity: "ERROR",
                        message: "Text frame has overset (hidden) text"
                    });
                    report.checks.textIssues.status = "FAIL";
                    report.summary.errors++;
                }
            }
        }

        // Page setup check
        report.checks.pageSetup.details = {
            pageWidth: doc.documentPreferences.pageWidth,
            pageHeight: doc.documentPreferences.pageHeight,
            pageCount: doc.pages.length,
            facingPages: doc.documentPreferences.facingPages,
            intent: doc.documentPreferences.intent.toString()
        };

        // Overall status
        if (report.summary.errors > 0) {
            report.status = "FAIL";
        } else if (report.summary.warnings > 0) {
            report.status = "WARNING";
        }

        // Output as JSON string
        var jsonOutput = JSON.stringify(report, null, 2);

        // Write to file for Agent to read
        var outputPath = "c:/Users/devin/Documents/Professional/DevLabs/AI Agent Workspace/indesign_tools/output/preflight_report.json";
        var outFile = new File(outputPath);
        outFile.encoding = "UTF-8";
        outFile.open("w");
        outFile.write(jsonOutput);
        outFile.close();

        alert("Preflight Check Complete!\nData saved to: " + outFile.fsName);
        return jsonOutput;
    })();
