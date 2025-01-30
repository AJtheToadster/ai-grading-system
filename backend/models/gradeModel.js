const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
    essayId: mongoose.Schema.Types.ObjectId,
    professorId: mongoose.Schema.Types.ObjectId,
    finalGrade: Number,  // Adjusted grade after manual review
    comments: String,
    confirmedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Grade', GradeSchema);
