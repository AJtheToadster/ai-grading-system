const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    role: { type: String, enum: ['professor', 'student'] },
    password: String // Hashed for security
});

module.exports = mongoose.model('User', UserSchema);
