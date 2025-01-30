import React, { useState, useEffect } from "react";
import { uploadEssays, fetchUploadedFiles } from "../services/api";

const FileUpload = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState([]);

    // Fetch uploaded essays on component mount
    useEffect(() => {
        fetchUploadedFilesList();
    }, []);

    const handleFileChange = (event) => {
        setFiles(event.target.files);
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setMessage("⚠️ Please select files to upload.");
            return;
        }

        setUploading(true);
        setMessage("");

        const formData = new FormData();
        Array.from(files).forEach(file => formData.append("pdfs", file));

        try {
            await uploadEssays(formData);
            setMessage("✅ Upload successful!");
            setFiles([]); // Clear selected files
            fetchUploadedFilesList(); // Refresh uploaded files list
        } catch (error) {
            setMessage("❌ Upload failed. Please try again.");
            console.error("Upload failed:", error);
        } finally {
            setUploading(false);
        }
    };

    // Fetch uploaded essays
    const fetchUploadedFilesList = async () => {
        try {
            const response = await fetchUploadedFiles();
            setUploadedFiles(response.data);
        } catch (error) {
            console.error("Error fetching uploaded files:", error);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold">Upload Essays</h2>

            <input 
                type="file" 
                multiple 
                accept="application/pdf" 
                onChange={handleFileChange} 
                className="border p-2 mt-2"
            />
            <button 
                onClick={handleUpload} 
                disabled={uploading} 
                className="bg-blue-500 text-white px-4 py-2 mt-2"
            >
                {uploading ? "Uploading..." : "Upload Essays"}
            </button>

            {/* Display success/error message */}
            {message && <p className={`mt-2 ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                {message}
            </p>}

            {/* List of uploaded essays */}
            <h3 className="mt-4 text-lg font-semibold">Uploaded Essays</h3>
            <ul>
                {uploadedFiles.map(file => (
                    <li key={file._id} className="mt-2">
                        <a 
                            href={`http://localhost:5050/files/${file.filename}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                        >
                            {file.filename}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FileUpload;
