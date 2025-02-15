const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const detectAIContent = async (text) => {
    try {
        const response = await axios.post('https://zerogpt.p.rapidapi.com/api/v1/detectText', 
            {
                input_text: text
            }, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-rapidapi-host': 'zerogpt.p.rapidapi.com',
                    'x-rapidapi-key': process.env.ZEROGPT_API_KEY
                }
            }
        );
        console.log('AI detection response:', response.data.data.is_gpt_generated);

        return response.data.data.is_gpt_generated; // Confidence score in % (0-100)
    } catch (error) {
        console.error('AI detection failed:', error);
        return 0; // Default to 0 if detection fails
    }
};

module.exports = { detectAIContent };