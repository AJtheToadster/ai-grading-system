const express = require('express');
const { checkAIContent } = require('../services/aiDetectionService.js');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const results = await checkAIContent(req.body);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error checking ai content of essays' });
    }
});

module.exports = router;
