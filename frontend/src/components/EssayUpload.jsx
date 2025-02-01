import { useState, useEffect } from "react";
import { uploadEssay, fetchUploadedEssays } from "../services/api";  // Removed getEssayById from import

const EssayUpload = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [uploadedEssays, setUploadedEssays] = useState([]);
    const [loadingEssays, setLoadingEssays] = useState(false);  // For loading indicator when fetching essays

    useEffect(() => {
        fetchUploadedEssaysList();
    }, []);

    // Validate and handle file selection
    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        const validFiles = [];
        let invalidFileFound = false;

        selectedFiles.forEach(file => {
            if (file.type !== 'application/pdf') {
                invalidFileFound = true;
            } else if (file.size > 10 * 1024 * 1024) {  // Limit file size to 10MB
                setMessage(`⚠️ File "${file.name}" exceeds the 10MB size limit.`);
                invalidFileFound = true;
            } else {
                validFiles.push(file);
            }
        });

        if (invalidFileFound) {
            setMessage("⚠️ Some files were not accepted. Please upload only PDFs under 10MB.");
        } else {
            setMessage("");
        }

        setFiles(validFiles);
    };

    // Handle essay uploads
    const handleUpload = async () => {
        if (files.length === 0) {
            setMessage("⚠️ Please select files to upload.");
            return;
        }

        setUploading(true);
        setMessage("");

        const formData = new FormData();
        files.forEach(file => {
            formData.append("essayFile", file);
        });

        try {
            await uploadEssay(formData);
            setMessage("✅ Upload successful!");
            setFiles([]);  // Clear selected files
            fetchUploadedEssaysList();  // Refresh the uploaded essays list
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Upload failed. Please try again.";
            setMessage(`❌ ${errorMsg}`);
            console.error("Upload failed:", error);
        } finally {
            setUploading(false);
        }
    };

    // Fetch the list of uploaded essays from the server
    const fetchUploadedEssaysList = async () => {
        setLoadingEssays(true);
        try {
            const response = await fetchUploadedEssays();
            setUploadedEssays(response.data);
        } catch (error) {
            console.error("Error fetching uploaded essays:", error);
            setMessage("❌ Failed to fetch uploaded essays.");
        } finally {
            setLoadingEssays(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold">Upload Essays</h2>

            {/* File input */}
            <input 
                type="file" 
                multiple 
                accept="application/pdf" 
                onChange={handleFileChange} 
                className="border p-2 mt-2"
            />

            {/* List selected files */}
            {files.length > 0 && (
                <div className="mt-2">
                    <h4 className="font-semibold">Files to Upload:</h4>
                    <ul className="list-disc ml-5">
                        {files.map((file, index) => (
                            <li key={index}>{file.name}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Upload button */}
            <button 
                onClick={handleUpload} 
                disabled={uploading} 
                className="bg-blue-500 text-white px-4 py-2 mt-2"
            >
                {uploading ? "Uploading..." : "Upload Essays"}
            </button>

            {/* Display success or error messages */}
            {message && (
                <p className={`mt-2 ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                    {message}
                </p>
            )}

            {/* Display uploaded essays */}
            <h3 className="mt-4 text-lg font-semibold">Uploaded Essays</h3>
            {loadingEssays ? (
                <p>Loading essays...</p>
            ) : (
                <ul>
                    {uploadedEssays.length > 0 ? (
                        uploadedEssays.map(file => (
                            <li key={file._id} className="mt-2">
                                <a 
                                    href={`http://localhost:5050/api/essays/${file._id}`}  // Manually construct URL
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-blue-500 underline"
                                >
                                    {file.filename}
                                </a>
                            </li>
                        ))
                    ) : (
                        <p>No essays uploaded yet.</p>
                    )}
                </ul>
            )}
        </div>
    );
};

export default EssayUpload;