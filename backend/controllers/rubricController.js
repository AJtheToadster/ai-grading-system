const { getGridFSBucket } = require("../config/gridfs");
const { Readable } = require("stream");
const mongoose = require("mongoose");

exports.uploadRubric = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const gridfsBucket = getGridFSBucket();
        const conn = mongoose.connection;

        // Find the existing rubric
        const existingRubric = await conn.db.collection("rubrics.files").findOne();

        // If a rubric exists, delete it
        if (existingRubric) {
            try {
                await gridfsBucket.delete(new mongoose.Types.ObjectId(existingRubric._id));
                console.log(`🗑️ Deleted old rubric: ${existingRubric.filename}`);
            } catch (deleteError) {
                console.error("Error deleting existing rubric:", deleteError);
                return res.status(500).json({ message: "Error deleting old rubric", error: deleteError.message });
            }
        }

        // Upload new rubric
        const readableStream = new Readable();
        readableStream.push(req.file.buffer);
        readableStream.push(null);

        const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
            metadata: { contentType: req.file.mimetype }
        });

        readableStream.pipe(uploadStream)
            .on("error", (error) => res.status(500).json({ message: "Upload failed", error: error.message }))
            .on("finish", () => res.status(201).json({ message: "Rubric uploaded successfully" }));

    } catch (error) {
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};


exports.getRubrics = async (req, res) => {
    try {
        const conn = mongoose.connection;
        const files = await conn.db.collection("rubrics.files").find().toArray();

        if (!files || files.length === 0) return res.status(404).json({ message: "No rubrics found" });

        res.json(files);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving rubrics", error: error.message });
    }
};

exports.getRubricById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid rubric ID" });
        }

        const gridfsBucket = getGridFSBucket();
        const fileId = new mongoose.Types.ObjectId(req.params.id);

        const readstream = gridfsBucket.openDownloadStream(fileId);
        readstream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving file", error: error.message });
    }
};

