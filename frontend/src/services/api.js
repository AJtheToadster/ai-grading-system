import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const uploadPDFs = async (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('pdfs', file));
    return axios.post(`${API_URL}/upload`, formData);
};
