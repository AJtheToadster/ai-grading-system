import axios from "axios";

// Use environment variable to handle API URL
const API_URL = process.env.REACT_APP_BACKEND_URL || "https://ai-grading-system-backend-d26df6d81f7c.herokuapp.com/api";

// Upload essays
export const uploadEssay = (formData) => {
    return axios.post(`${API_URL}/essays/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

// Fetch uploaded essays
export const fetchUploadedEssays = () => {
    return axios.get(`${API_URL}/essays`);
};

// Retrieve essay file by ID
export const getEssayById = (id) => {
    return `${API_URL}/essays/${id}`;
};

// Upload rubric to MongoDB Atlas (GridFS)
export const uploadRubric = (formData) => {
    return axios.post(`${API_URL}/rubrics/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

// Fetch uploaded rubrics
export const fetchRubrics = () => {
    return axios.get(`${API_URL}/rubrics`);
};

// Retrieve rubric by ID
export const getRubricById = (id) => {
    return `${API_URL}/rubrics/${id}`;
};

// Grade essays based on grading mode
export const gradeEssays = (gradingMode) => {
    return axios.post(`${API_URL}/grade/`, { gradingMode });
};

// Check for AI-generated content
export const checkAIContent = () => {
    return axios.post(`${API_URL}/checkAIContent`);
};

// Upload grades to the database
export const uploadGrades = (gradedData) => {
    return axios.post(`${API_URL}/grade/upload`, gradedData);
};

// Get all grades from the database
export const getGrades = () => {
    return axios.get(`${API_URL}/grade/fetch`);
};

// Get grades by ID
export const getGradesById = (id) => {
    return axios.get(`${API_URL}/grade/${id}`);
};