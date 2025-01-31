import React, { useState, useEffect } from "react";
import { uploadRubric, fetchRubrics, getRubricById } from "../services/api";

const RubricUpload = () => {
    const [rubricFile, setRubricFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [currentRubric, setCurrentRubric] = useState(null);

    useEffect(() => {
        fetchCurrentRubric();
    }, []);

    const fetchCurrentRubric = async () => {
        try {
            const response = await fetchRubrics();
            if (response.data.length > 0) {
                setCurrentRubric(response.data[0]); // Keep only the latest rubric
            }
        } catch (error) {
            console.error("Failed to fetch rubric:", error);
        }
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) return;

        if (currentRubric) {
            const confirmReplace = window.confirm(
                "You already have a rubric uploaded. Would you like to replace it?"
            );
            if (!confirmReplace) return;
        }

        setRubricFile(selectedFile);
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
            fetchCurrentRubric(); // Refresh displayed rubric
        } catch (error) {
            setMessage("❌ Rubric upload failed. Please try again.");
            console.error("Upload error:", error);
        } finally {
            setUploading(false);
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

            {message && (
                <p className={`mt-2 ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                    {message}
                </p>
            )}

            {currentRubric && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold">Current Rubric</h3>
                    <a
                        href={getRubricById(currentRubric._id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                    >
                        {currentRubric.filename}
                    </a>
                </div>
            )}
        </div>
    );
};

export default RubricUpload;
