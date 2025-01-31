const { getGridFSBucket } = require("../config/gridfs");
const { Readable } = require("stream");

exports.uploadEssays = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const gridfsBucket = getGridFSBucket();
        const readableStream = new Readable();
        readableStream.push(req.file.buffer);
        readableStream.push(null);

        const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
            metadata: { contentType: req.file.mimetype }
        });

        readableStream.pipe(uploadStream)
            .on("error", (error) => res.status(500).json({ message: "Upload failed", error: error.message }))
            .on("finish", () => res.status(201).json({ message: "Essay uploaded successfully" }));
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

