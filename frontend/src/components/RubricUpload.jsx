import React, { useState, useEffect } from "react";
import { uploadRubric, fetchRubrics } from "../services/api";

const RubricUpload = () => {
    const [rubricFile, setRubricFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [rubrics, setRubrics] = useState([]);

    useEffect(() => {
        fetchRubricList();
    }, []);

    const handleFileChange = (event) => {
        setRubricFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!rubricFile) {
            setMessage("⚠️ Please select a rubric file.");
            return;
        }

        setUploading(true);
        setMessage("");

        const formData = new FormData();
        formData.append("rubricFile", rubricFile);

        try {
            await uploadRubric(formData);
            setMessage("✅ Rubric uploaded successfully!");
            setRubricFile(null);
            fetchRubricList(); // Refresh list after upload
        } catch (error) {
            setMessage("❌ Rubric upload failed. Please try again.");
            console.error("Upload error:", error);
        } finally {
            setUploading(false);
        }
    };

    const fetchRubricList = async () => {
        try {
            const response = await fetchRubrics();
            setRubrics(response.data);
        } catch (error) {
            console.error("Failed to fetch rubrics:", error);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold">Upload Grading Rubric</h2>
            
            <input 
                type="file" 
                accept=".pdf,.docx,.json,.csv" 
                onChange={handleFileChange} 
                className="border p-2 mt-2"
            />
            <button 
                onClick={handleUpload} 
                disabled={uploading} 
                className="bg-purple-500 text-white px-4 py-2 mt-2"
            >
                {uploading ? "Uploading..." : "Upload Rubric"}
            </button>

            {/* Display success/error message */}
            {message && <p className={`mt-2 ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                {message}
            </p>}

            {/* List of uploaded rubrics */}
            <h3 className="mt-4 text-lg font-semibold">Uploaded Rubrics</h3>
            <ul>
                {rubrics.map(rubric => (
                    <li key={rubric._id} className="mt-2">
                        <a 
                            href={`http://localhost:5050/${rubric.filepath}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                        >
                            {rubric.filename}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RubricUpload;
