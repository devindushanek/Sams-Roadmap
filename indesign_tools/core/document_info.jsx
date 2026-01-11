/**
 * Document Info Script
 * Extracts comprehensive information about the active InDesign document
 * Returns JSON-formatted data for parsing by automation tools
 */

#target indesign
#include "json_polyfill.jsx"

    (function () {
        var doc = app.activeDocument;
        var info = {
            name: doc.name,
            fullPath: doc.fullName ? doc.fullName.fsName : "Unsaved",
            pageCount: doc.pages.length,
            spreadCount: doc.spreads.length,
            modified: doc.modified,
            documentPreferences: {
                pageWidth: doc.documentPreferences.pageWidth,
                pageHeight: doc.documentPreferences.pageHeight,
                facingPages: doc.documentPreferences.facingPages,
                pagesPerDocument: doc.documentPreferences.pagesPerDocument
            },
            bleed: {
                top: doc.documentPreferences.documentBleedTopOffset,
                bottom: doc.documentPreferences.documentBleedBottomOffset,
                inside: doc.documentPreferences.documentBleedInsideOrLeftOffset,
                outside: doc.documentPreferences.documentBleedOutsideOrRightOffset
            },
            slug: {
                top: doc.documentPreferences.slugTopOffset,
                bottom: doc.documentPreferences.slugBottomOffset,
                inside: doc.documentPreferences.slugInsideOrLeftOffset,
                outside: doc.documentPreferences.slugRightOrOutsideOffset
            },
            layers: [],
            masterSpreads: [],
            styles: {
                paragraphStyles: [],
                characterStyles: []
            },
            fonts: [],
            colors: [],
            preflightErrors: []
        };

        // Layers
        for (var i = 0; i < doc.layers.length; i++) {
            var layer = doc.layers[i];
            info.layers.push({
                name: layer.name,
                visible: layer.visible,
                locked: layer.locked
            });
        }

        // Master Spreads
        for (var i = 0; i < doc.masterSpreads.length; i++) {
            var master = doc.masterSpreads[i];
            info.masterSpreads.push({
                name: master.name,
                baseName: master.baseName,
                pageCount: master.pages.length
            });
        }

        // Paragraph Styles
        for (var i = 0; i < doc.allParagraphStyles.length; i++) {
            var style = doc.allParagraphStyles[i];
            info.styles.paragraphStyles.push(style.name);
        }

        // Character Styles
        for (var i = 0; i < doc.allCharacterStyles.length; i++) {
            var style = doc.allCharacterStyles[i];
            info.styles.characterStyles.push(style.name);
        }

        // Fonts Used
        for (var i = 0; i < doc.fonts.length; i++) {
            var font = doc.fonts[i];
            info.fonts.push({
                name: font.name,
                fontFamily: font.fontFamily,
                status: font.status.toString()
            });
        }

        // Swatches/Colors
        for (var i = 0; i < doc.swatches.length; i++) {
            var swatch = doc.swatches[i];
            info.colors.push(swatch.name);
        }

        // Preflight Check
        try {
            var profile = app.preflightProfiles.itemByName("[Basic]");
            var process = app.preflightProcesses.add(doc, profile);
            process.waitForProcess();
            var results = process.processResults;

            if (results && results.length > 0) {
                info.preflightErrors = results;
            }
            process.remove();
        } catch (e) {
            info.preflightErrors = ["Preflight check failed: " + e.message];
        }

        // Output as JSON string
        var jsonOutput = JSON.stringify(info, null, 2);

        // Write to file for Agent to read
        var outputPath = "c:/Users/devin/Documents/Professional/DevLabs/AI Agent Workspace/indesign_tools/output/document_info.json";
        var outFile = new File(outputPath);
        outFile.encoding = "UTF-8";
        outFile.open("w");
        outFile.write(jsonOutput);
        outFile.close();

        alert("Analysis Complete!\nData saved to: " + outFile.fsName);
        return jsonOutput;
    })();
