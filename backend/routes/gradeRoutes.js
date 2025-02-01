const express = require('express');
const { gradeEssays, uploadGrades, getGrades, getGradeById } = require('../services/gradingService.js');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { mode } = req.body.gradingMode;
        const results = await gradeEssays(mode);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error grading essays' });
    }
});

// Route to upload grades (expecting grades in request body)
router.post('/upload', uploadGrades);

// Route to get all grades
router.get('/fetch', getGrades);

// Route to get a specific grade by ID
router.get('/:id', getGradeById);

module.exports = router;
