const axios = require("axios");
const mongoose = require("mongoose");
const { detectAIContent } = require("./aiDetectionService.js");
const { Readable } = require("stream");

// AI Grading Logic
const gradeEssays = async (mode) => {
  try {
    // Fetch essays with extracted text
    const essaysResponse = await axios.get('http://localhost:5050/api/essays');
    const essays = essaysResponse.data;

    // Fetch the grading rubric
    const rubricResponse = await axios.get("http://localhost:5050/api/rubrics/");
    const rubric = rubricResponse.data;

    if (!essays.length || !rubric) {
      throw new Error("Essays or rubric not found");
    }

    const gradedEssays = [];

    // Iterate over each essay and grade using OpenAI API
    for (const essay of essays) {
      const prompt = `Grade this essay based on the following rubric:\n\n${rubric}\n\nEssay:\n${essay.content}`;

      try {
        // Call OpenAI API to grade the essay
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
          },
          {
            headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
          }
        );

        const score = response.data.choices[0].message.content.trim();

        // Check for AI-generated content confidence
        const aiConfidence = await detectAIContent(essay.content);

        // Depending on the mode, push the graded essay with or without flags
        if (mode === "full") {
          gradedEssays.push({ essayId: essay._id, score });
        } else {
          gradedEssays.push({
            essayId: essay._id,
            score,
            flagged: aiConfidence > 80,
            aiConfidence,
          });
        }
      } catch (error) {
        console.error(`Error grading essay ${essay._id}:`, error.message);
        gradedEssays.push({ essayId: essay._id, error: "Grading failed" });
      }
    }

    console.log("Final Graded Essays:", gradedEssays);
    return gradedEssays;

  } catch (error) {
    console.error("Error retrieving essays or grading:", error.message);
    throw error;
  }
};

// Upload Grades Function (Store as Text)
const uploadGrades = async (req, res) => {
    try {
        const conn = mongoose.connection;
        const gradesCollection = conn.db.collection("grades");

        const grades = req.body;  // Expecting an array of grade objects from the frontend

        if (!Array.isArray(grades) || grades.length === 0) {
            return res.status(400).json({ message: "No grades provided for upload" });
        }

        // Insert grades into MongoDB
        await gradesCollection.insertMany(grades);

        res.status(201).json({ message: "Grades uploaded successfully", grades });
    } catch (error) {
        console.error("Error uploading grades:", error.message);
        res.status(500).json({ message: "Error uploading grades", error: error.message });
    }
};

const getGrades = async (req, res) => {
    try {
        const conn = mongoose.connection;
        const grades = await conn.db.collection("grades").find().toArray();

        if (!grades || grades.length === 0) {
            return res.status(404).json({ message: "No grades found" });
        }

        res.json(grades);
    } catch (error) {
        console.error("Error retrieving grades:", error.message);
        res.status(500).json({ message: "Error retrieving grades", error: error.message });
    }
};

const getGradeById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid grade ID" });
        }

        const conn = mongoose.connection;
        const gradeId = new mongoose.Types.ObjectId(req.params.id);

        const grade = await conn.db.collection("grades").findOne({ _id: gradeId });

        if (!grade) {
            return res.status(404).json({ message: "Grade not found" });
        }

        res.json(grade);
    } catch (error) {
        console.error("Error retrieving grade:", error.message);
        res.status(500).json({ message: "Error retrieving grade", error: error.message });
    }
};
module.exports = { gradeEssays, uploadGrades, getGrades, getGradeById };