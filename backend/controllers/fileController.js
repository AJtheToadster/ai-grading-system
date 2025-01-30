const { getGridFSBucket } = require("../config/gridfs");
const { Readable } = require("stream");

exports.uploadEssays = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const gridfsBucket = getGridFSBucket();
        const uploadPromises = req.files.map((file) => {
            return new Promise((resolve, reject) => {
                const readableStream = new Readable();
                readableStream.push(file.buffer);
                readableStream.push(null);

                const uploadStream = gridfsBucket.openUploadStream(file.originalname);
                readableStream.pipe(uploadStream)
                    .on("error", reject)
                    .on("finish", resolve);
            });
        });

        await Promise.all(uploadPromises);
        res.json({ message: "Essays uploaded successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error uploading files", error: error.message });
    }
};

exports.getFiles = async (req, res) => {
    try {
        const conn = require("mongoose").connection;
        const files = await conn.db.collection("uploads.files").find().toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ message: "No files found" });
        }
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving files", error: error.message });
    }
};

exports.getFileByName = async (req, res) => {
    try {
        const conn = require("mongoose").connection;
        const file = await conn.db.collection("uploads.files").findOne({ filename: req.params.filename });

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        const readstream = getGridFSBucket().openDownloadStream(file._id);
        readstream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving file", error: error.message });
    }
};
