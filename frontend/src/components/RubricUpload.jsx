import { useState, useEffect } from "react";
import { uploadRubric, fetchRubrics } from "../services/api";  // Removed getRubricById as href doesn't need function

const RubricUpload = () => {
    const [rubricFile, setRubricFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [currentRubric, setCurrentRubric] = useState(null);

    useEffect(() => {
        fetchCurrentRubric();
    }, []);

    // Fetch the current rubric from the server
    const fetchCurrentRubric = async () => {
        try {
            const response = await fetchRubrics();

            // Handle cases where API returns a single object or array
            const rubricData = Array.isArray(response.data) ? response.data[0] : response.data;

            if (rubricData) {
                setCurrentRubric(rubricData);
            } else {
                setCurrentRubric(null);
            }
        } catch (error) {
            console.error("Failed to fetch rubric:", error);
            setMessage("❌ Failed to fetch current rubric.");
        }
    };

    // Handle file selection with validation
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/json', 'text/csv'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setMessage("⚠️ Unsupported file type. Please upload a PDF, DOCX, JSON, or CSV.");
            return;
        }

        // Validate file size (max 5MB)
        const maxSizeMB = 5;
        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
            setMessage(`⚠️ File size exceeds ${maxSizeMB}MB limit.`);
            return;
        }

        if (currentRubric) {
            const confirmReplace = window.confirm(
                "You already have a rubric uploaded. Would you like to replace it?"
            );
            if (!confirmReplace) return;
        }

        setRubricFile(selectedFile);
        setMessage("");  // Clear any previous messages
    };

    // Handle rubric upload to the server
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
            const response = await uploadRubric(formData);
            setMessage("✅ Rubric uploaded successfully!");
            setRubricFile(null);
            fetchCurrentRubric();  // Refresh displayed rubric
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Rubric upload failed. Please try again.";
            setMessage(`❌ ${errorMsg}`);
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

            {/* Display success or error messages */}
            {message && (
                <p className={`mt-2 ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                    {message}
                </p>
            )}

            {/* Display current rubric if available */}
            {currentRubric && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold">Current Rubric</h3>
                    <a
                        href={`http://localhost:5050/api/rubrics/${currentRubric._id}`}  // Corrected URL construction
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