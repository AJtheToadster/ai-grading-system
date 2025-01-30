import React, { useState } from "react";
import { uploadEssays } from "../services/api";

const FileUpload = ({ refreshFiles }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(""); // State to store success/error message

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
            setMessage("✅ Upload successful!"); // Show success message
            refreshFiles();
            setFiles([]); // Clear selected files after upload
        } catch (error) {
            setMessage("❌ Upload failed. Please try again."); // Show error message
            console.error("Upload failed:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold">Upload Essays</h2>
            <input type="file" multiple onChange={handleFileChange} className="border p-2 mt-2" />
            <button 
                onClick={handleUpload} 
                disabled={uploading} 
                className="bg-blue-500 text-white px-4 py-2 mt-2"
            >
                {uploading ? "Uploading..." : "Upload Essays"}
            </button>
            
            {/* Display message below the button */}
            {message && <p className={`mt-2 ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
        </div>
    );
};

export default FileUpload;
