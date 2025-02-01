const { getGridFSEssayBucket } = require("../config/gridfs");
const pdfParse = require('pdf-parse');  // Import pdf-parse
const { Readable } = require("stream");

exports.uploadEssays = async (req, res) => {
    console.log("Received files:", req.files);

    try {
        if (!req.files || req.files.length === 0) {
            console.error("No files received!");
            return res.status(400).json({ message: "No files uploaded" });
        }

        const gridfsBucket = getGridFSEssayBucket();
        let uploadedFiles = [];

        // Process each file, extract text, and upload to GridFS
        for (let file of req.files) {
            const readableStream = new Readable();
            readableStream.push(file.buffer);
            readableStream.push(null);

            let extractedText = "No text extracted (PDF might be scanned or corrupted)";
            
            // Try to extract text from the PDF buffer
            try {
                const pdfData = await pdfParse(file.buffer);
                extractedText = pdfData.text.trim() || extractedText;  // Use extracted text if available
            } catch (parseError) {
                console.error(`Failed to parse PDF ${file.originalname}:`, parseError.message);
            }

            // Upload the original PDF along with extracted text in metadata
            const uploadStream = gridfsBucket.openUploadStream(file.originalname, {
                metadata: { 
                    contentType: file.mimetype,
                    extractedText  // Store extracted text in metadata
                }
            });

            readableStream.pipe(uploadStream)
                .on("finish", () => {
                    uploadedFiles.push({ filename: file.originalname, extractedText });
                })
                .on("error", (uploadError) => {
                    console.error(`Failed to upload ${file.originalname}:`, uploadError.message);
                });
        }

        res.status(201).json({ message: "Essays uploaded successfully", files: uploadedFiles });
    } catch (error) {
        console.error("Upload failed:", error.message);
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};

exports.getEssayById = async (req, res) => {
    try {
        const conn = require("mongoose").connection;
        const fileId = new mongoose.Types.ObjectId(req.params.id);  // Convert to ObjectId

        // Find the essay file by its ID
        const file = await conn.db.collection("essays.files").findOne({ _id: fileId });

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        // Return extracted text and filename instead of streaming the raw PDF
        res.json({
            _id: file._id,
            filename: file.filename,
            content: file.metadata?.extractedText || "No text extracted"
        });
        
    } catch (error) {
        console.error("Error retrieving essay:", error.message);
        res.status(500).json({ message: "Error retrieving file", error: error.message });
    }
};

// Function to get all essays with content
exports.getEssays = async (req, res) => {
    try {
        const conn = require("mongoose").connection;
        
        // Retrieve all files from GridFS
        const files = await conn.db.collection("essays.files").find().toArray();

        if (!files || files.length === 0) {
            return res.status(404).json({ message: "No files found" });
        }

        // Extract text from metadata
        const essaysWithText = files.map(file => ({
            _id: file._id,
            filename: file.filename,
            content: file.metadata?.extractedText || "No text extracted"  // Fetch extracted text from metadata
        }));

        res.json(essaysWithText);
    } catch (error) {
        console.error("Error retrieving essays with content:", error.message);
        res.status(500).json({ message: "Error retrieving essays", error: error.message });
    }
};