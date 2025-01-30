const mongoose = require('mongoose');

const RubricSchema = new mongoose.Schema({
    professorId: mongoose.Schema.Types.ObjectId,
    title: String,
    criteria: [
        { category: String, weight: Number }  // Example: { "Clarity", 30 }
    ]
});

module.exports = mongoose.model('Rubric', RubricSchema);
