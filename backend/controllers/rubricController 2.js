const Rubric = require("../models/rubricModel");
const multer = require("multer");
const path = require("path");

// Multer configuration for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./backend/uploads");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage }).single("rubricFile");

exports.uploadRubric = (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(500).json({ error: "File upload failed" });
        
        const rubric = new Rubric({
            filename: req.file.originalname,
            filepath: req.file.path
        });
        
        await rubric.save();
        res.status(201).json({ message: "Rubric uploaded successfully", rubric });
    });
};

exports.getRubrics = async (req, res) => {
    try {
        const rubrics = await Rubric.find().sort({ uploadedAt: -1 });
        res.json(rubrics);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve rubrics" });
    }
};
