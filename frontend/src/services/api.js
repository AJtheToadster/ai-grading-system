import axios from "axios";

const API_URL = "http://localhost:5050/api";

export const uploadEssays = (formData) => axios.post(`${API_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
});

// 📝 Upload Rubric
export const uploadRubric = (formData) => {
    return axios.post(`${API_URL}/rubrics/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

// 📄 Fetch Uploaded Rubrics
export const fetchRubrics = () => {
    return axios.get(`${API_URL}/rubrics`);
};

export const fetchUploadedFiles = () => axios.get(`${API_URL}/files`);
