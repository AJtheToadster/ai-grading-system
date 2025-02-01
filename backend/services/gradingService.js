const axios = require('axios');
const mongoose = require('mongoose');
const { detectAIContent } = require('./aiDetectionService.js');
const { Readable } = require('stream');
const { getEssays } = require('../controllers/fileController.js');
const { getRubrics } = require('../controllers/rubricController.js');

const axios = require('axios');

const gradeEssays = async (mode) => {
    // Debug: Check if environment variables are loaded
    console.log('Checking environment variables...');
    console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
    console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length);
    
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', 
            {
                model: 'gpt-4',
                messages: [{ role: 'user', content: 'test' }]
            },
            {
                headers: { 
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('OpenAI API test successful');
    } catch (error) {
        console.error('OpenAI API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
        });
        throw error;
    }
}
// Convert stream to string (helper function)
const streamToString = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        stream.on('error', reject);
    });
};

// AI Grading Logic
const gradeEssays = async (mode) => {
    const essays = await getEssays();
    console.log("these are the essays");
    console.log(essays);
    const rubric = await getRubrics();

    if (!essays.length || !rubric) throw new Error('Essays or rubric not found');

    const gradedEssays = [];

    for (const essay of essays) {
        const prompt = `Grade this essay based on the following rubric:\n\n${rubric}\n\nEssay:\n${essay.content}`;

        try {
            // Call OpenAI API for grading
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
            }, {
                headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
            });

            const score = response.data.choices[0].message.content.trim();
            const aiConfidence = await detectAIContent(essay.content);

            if (mode === 'full') {
                gradedEssays.push({ essayId: essay._id, score });
            } else {
                gradedEssays.push({ 
                    essayId: essay._id, 
                    score, 
                    flagged: aiConfidence > 80 ? true : false,
                    aiConfidence
                });
            }
        } catch (error) {
            console.error(`Error grading essay ${essay._id}:`, error);
            gradedEssays.push({ essayId: essay._id, error: 'Grading failed' });
        }
    }

    return gradedEssays;
};

module.exports = { gradeEssays };