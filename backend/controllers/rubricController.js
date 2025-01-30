const Rubric = require("../models/rubricModel");

exports.uploadRubric = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const newRubric = new Rubric({
            filename: req.file.originalname,
            filepath: req.file.path
        });

        await newRubric.save();
        res.status(201).json({ message: "Rubric uploaded successfully", rubric: newRubric });
    } catch (error) {
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};

exports.getRubrics = async (req, res) => {
    try {
        const rubrics = await Rubric.find().sort({ uploadedAt: -1 });
        res.json(rubrics);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve rubrics" });
    }
};
