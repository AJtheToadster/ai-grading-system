const mongoose = require('mongoose');

const EssaySchema = new mongoose.Schema({
    filename: String,
    professorId: mongoose.Schema.Types.ObjectId,
    studentId: mongoose.Schema.Types.ObjectId,
    text: String,  // Extracted text from the PDF
    aiGrade: Number,  // AI-generated grade (0-100)
    feedback: String, // AI feedback summary
    flagged: Boolean, // True if manual review is required
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Essay', EssaySchema);
