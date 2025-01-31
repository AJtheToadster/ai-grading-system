const axios = require('axios');
const mongoose = require('mongoose');
const { detectAIContent } = require('./aiDetectionService.js');
const { Readable } = require('stream');


const conn = mongoose.connection;

// Function to get essay content from GridFS
const getEssaysFromDB = async () => {
    const files = await conn.db.collection('essays.files').find().toArray();
    const essays = [];

    for (const file of files) {
        const stream = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'essays' }).openDownloadStream(file._id);
        const content = await streamToString(stream);
        essays.push({ _id: file._id, content });
    }

    return essays;
};

// Function to get rubric content from GridFS
const getRubricFromDB = async () => {
    const file = await conn.db.collection('rubric.files').findOne();
    if (!file) return null;

    const stream = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'rubric' }).openDownloadStream(file._id);
    return await streamToString(stream);
};

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
export const gradeEssays = async (mode) => {
    const essays = await getEssaysFromDB();
    const rubric = await getRubricFromDB();

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
