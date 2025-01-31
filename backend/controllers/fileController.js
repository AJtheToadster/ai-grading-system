const { getGridFSBucket } = require("../config/gridfs");
const { Readable } = require("stream");

exports.uploadEssays = async (req, res) => {
    console.log("Received files:", req.files); // ✅ Debugging

    try {
        if (!req.files || req.files.length === 0) {
            console.error("No files received!");
            return res.status(400).json({ message: "No files uploaded" });
        }

        const gridfsBucket = getGridFSBucket();
        let uploadedFiles = [];

        // Process each file and upload to GridFS
        for (let file of req.files) {
            const readableStream = new Readable();
            readableStream.push(file.buffer);
            readableStream.push(null);

            const uploadStream = gridfsBucket.openUploadStream(file.originalname, {
                metadata: { contentType: file.mimetype }
            });

            readableStream.pipe(uploadStream)
                .on("finish", () => {
                    uploadedFiles.push({ filename: file.originalname });
                });
        }

        res.status(201).json({ message: "Essays uploaded successfully", files: uploadedFiles });
    } catch (error) {
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};




exports.getEssays = async (req, res) => {
    try {
        const conn = require("mongoose").connection;
        const files = await conn.db.collection("essays.files").find().toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ message: "No files found" });
        }
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving files", error: error.message });
    }
};

exports.getEssayById = async (req, res) => {
    try {
        const conn = require("mongoose").connection;
        const fileId = new mongoose.Types.ObjectId(req.params.id); // ✅ Convert to ObjectId

        const file = await conn.db.collection("essays.files").findOne({ _id: fileId }); // ✅ Find by `_id`

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        const readstream = getGridFSBucket().openDownloadStream(fileId);
        readstream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving file", error: error.message });
    }
};

