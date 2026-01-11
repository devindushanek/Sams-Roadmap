/**
 * Version Control Snapshot Script
 * Creates a timestamped backup of the current document
 * Usage: Run before any automated modification
 */

#target indesign
#include "json_polyfill.jsx"

    (function () {
        var doc = app.activeDocument;
        var result = {
            status: "FAIL",
            originalPath: "",
            backupPath: "",
            message: ""
        };

        try {
            // Get current document info
            var docName = doc.name;
            var docPath = doc.filePath;
            var fullName = doc.fullName;

            // Create backups directory if it doesn't exist
            var backupFolder = new Folder(docPath + "/_backups");
            if (!backupFolder.exists) {
                backupFolder.create();
            }

            // Generate timestamp: YYYY-MM-DD_HH-MM-SS
            var now = new Date();
            var timestamp = now.getFullYear() + "-" +
                ("0" + (now.getMonth() + 1)).slice(-2) + "-" +
                ("0" + now.getDate()).slice(-2) + "_" +
                ("0" + now.getHours()).slice(-2) + "-" +
                ("0" + now.getMinutes()).slice(-2) + "-" +
                ("0" + now.getSeconds()).slice(-2);

            // Construct backup filename
            // Example: Thesis_2026-01-08_14-30-00.indd
            var extensionIndex = docName.lastIndexOf(".");
            var baseName = (extensionIndex > 0) ? docName.substring(0, extensionIndex) : docName;
            var extension = (extensionIndex > 0) ? docName.substring(extensionIndex) : ".indd";

            var backupName = baseName + "_" + timestamp + extension;
            var backupFile = new File(backupFolder + "/" + backupName);

            // Save a copy
            doc.saveACopy(backupFile);

            result.status = "SUCCESS";
            result.originalPath = fullName.fsName;
            result.backupPath = backupFile.fsName;
            result.message = "Snapshot created: " + backupName;

        } catch (e) {
            result.message = "Error creating snapshot: " + e.message;
        }

        // Output as JSON string
        var jsonOutput = JSON.stringify(result, null, 2);

        // Write to file for Agent to read
        var outputPath = "c:/Users/devin/Documents/Professional/DevLabs/AI Agent Workspace/indesign_tools/output/version_control_log.json";
        var outFile = new File(outputPath);
        outFile.encoding = "UTF-8";
        outFile.open("a"); // Append mode for logs
        outFile.write(jsonOutput + "\n");
        outFile.close();

        if (result.status === "SUCCESS") {
            alert("Snapshot Created!\n" + result.message);
        } else {
            alert("Snapshot Failed!\n" + result.message);
        }

        return jsonOutput;
    })();
