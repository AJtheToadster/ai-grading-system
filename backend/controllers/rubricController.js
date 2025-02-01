const { getGridFSRubricBucket } = require("../config/gridfs");
const { Readable } = require("stream");
const pdfParse = require('pdf-parse');
const mongoose = require("mongoose");

// exports.uploadRubric = async (req, res) => {
//     try {
//         if (!req.file) return res.status(400).json({ message: "No file uploaded" });

//         const gridfsBucket = getGridFSRubricBucket();
//         const conn = mongoose.connection;

//         // Find the existing rubric
//         const existingRubric = await conn.db.collection("rubrics.files").findOne();

//         // If a rubric exists, delete it
//         if (existingRubric) {
//             try {
//                 await gridfsBucket.delete(new mongoose.Types.ObjectId(existingRubric._id));
//                 console.log(`🗑️ Deleted old rubric: ${existingRubric.filename}`);
//             } catch (deleteError) {
//                 console.error("Error deleting existing rubric:", deleteError);
//                 return res.status(500).json({ message: "Error deleting old rubric", error: deleteError.message });
//             }
//         }

//         // Upload new rubric
//         const readableStream = new Readable();
//         readableStream.push(req.file.buffer);
//         readableStream.push(null);

//         const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
//             metadata: { contentType: req.file.mimetype }
//         });

//         readableStream.pipe(uploadStream)
//             .on("error", (error) => res.status(500).json({ message: "Upload failed", error: error.message }))
//             .on("finish", () => res.status(201).json({ message: "Rubric uploaded successfully" }));

//     } catch (error) {
//         res.status(500).json({ message: "Upload failed", error: error.message });
//     }
// };

exports.uploadRubric = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const gridfsBucket = getGridFSRubricBucket();
        const conn = mongoose.connection;

        // Find and delete existing rubric
        const existingRubric = await conn.db.collection("rubrics.files").findOne();
        if (existingRubric) {
            try {
                await gridfsBucket.delete(new mongoose.Types.ObjectId(existingRubric._id));
                console.log(`🗑️ Deleted old rubric: ${existingRubric.filename}`);
            } catch (deleteError) {
                console.error("Error deleting existing rubric:", deleteError);
                return res.status(500).json({ message: "Error deleting old rubric", error: deleteError.message });
            }
        }

        // Extract text from the new rubric PDF
        let extractedText = "No text extracted (PDF might be scanned or corrupted)";
        try {
            const pdfData = await pdfParse(req.file.buffer);
            extractedText = pdfData.text.trim() || extractedText;
        } catch (parseError) {
            console.error(`Failed to parse PDF ${req.file.originalname}:`, parseError.message);
        }

        // Upload new rubric with extracted text in metadata
        const readableStream = new Readable();
        readableStream.push(req.file.buffer);
        readableStream.push(null);

        const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
            metadata: { 
                contentType: req.file.mimetype,
                extractedText  // Store extracted text in metadata
            }
        });

        readableStream.pipe(uploadStream)
            .on("error", (error) => res.status(500).json({ message: "Upload failed", error: error.message }))
            .on("finish", () => res.status(201).json({ 
                message: "Rubric uploaded successfully",
                extractedText: extractedText.substring(0, 100) + "..."  // Return first 100 chars for confirmation
            }));

    } catch (error) {
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};

exports.getRubrics = async (req, res) => {
    try {
        const conn = mongoose.connection;

        // Retrieve the single rubric (since only one is allowed)
        const rubric = await conn.db.collection("rubrics.files").findOne();

        if (!rubric) {
            return res.status(404).json({ message: "No rubric found" });
        }

        // Return the rubric's filename and extracted text
        res.json({
            _id: rubric._id,
            filename: rubric.filename,
            content: rubric.metadata?.extractedText || "No text extracted"
        });

    } catch (error) {
        console.error("Error retrieving rubric:", error.message);
        res.status(500).json({ message: "Error retrieving rubric", error: error.message });
    }
};

exports.getRubricById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid rubric ID" });
        }

        const conn = mongoose.connection;
        const fileId = new mongoose.Types.ObjectId(req.params.id);

        // Find rubric by ID
        const rubric = await conn.db.collection("rubrics.files").findOne({ _id: fileId });

        if (!rubric) {
            return res.status(404).json({ message: "Rubric not found" });
        }

        // Return the rubric's filename and extracted text
        res.json({
            _id: rubric._id,
            filename: rubric.filename,
            content: rubric.metadata?.extractedText || "No text extracted"
        });

    } catch (error) {
        console.error("Error retrieving rubric by ID:", error.message);
        res.status(500).json({ message: "Error retrieving rubric", error: error.message });
    }
};

