import axios from "axios";

const API_URL = "http://localhost:5050/api";

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
export const gradeEssays = ( {mode: gradingMode} ) => {
    return axios.post(`${API_URL}/grade/`, gradingMode);
}

// Grade essays based on grading mode
export const checkAIContent = () => {
    return axios.post(`${API_URL}/checkAIContent`);
}