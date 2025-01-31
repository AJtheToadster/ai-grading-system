const express = require('express');
const { gradeEssays } = require('../services/gradingService.js');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { mode } = req.body;
        const results = await gradeEssays(mode);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error grading essays' });
    }
});

module.exports = router;
