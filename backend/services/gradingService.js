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

module.exports = { gradeEssays };