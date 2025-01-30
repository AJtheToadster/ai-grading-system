import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileUpload = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);

    useEffect(() => {
        fetchUploadedFiles();
    }, []);

    const handleFileChange = (event) => {
        setFiles(event.target.files);
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setMessage('Please select files to upload.');
            return;
        }

        setUploading(true);
        setMessage('');

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('pdfs', files[i]);
        }

        try {
            const response = await axios.post('http://localhost:5050/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage('Upload successful!');
            fetchUploadedFiles();
            console.log(response.data);
        } catch (error) {
            setMessage('Upload failed. Please try again.');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleProcess = async () => {
        setProcessing(true);
        setMessage('');
        try {
            const response = await axios.post('http://localhost:5050/process');
            setMessage('Processing completed!');
            console.log(response.data);
        } catch (error) {
            setMessage('Processing failed. Please try again.');
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    const fetchUploadedFiles = async () => {
        try {
            const response = await axios.get('http://localhost:5050/files');
            setUploadedFiles(response.data);
        } catch (error) {
            console.error('Error fetching uploaded files:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold">AI Grading System</h1>
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
                className="bg-blue-500 text-white px-4 py-2 mt-2 mr-2"
            >
                {uploading ? 'Uploading...' : 'Upload Essays'}
            </button>
            <button 
                onClick={handleProcess} 
                disabled={processing} 
                className="bg-green-500 text-white px-4 py-2 mt-2"
            >
                {processing ? 'Processing...' : 'Process Essays'}
            </button>
            {message && <p className="mt-2 text-red-500">{message}</p>}

            <h2 className="text-xl font-bold mt-4">Uploaded Essays</h2>
            <ul>
                {uploadedFiles.map(file => (
                    <li key={file._id} className="mt-2">
                        <a href={`http://localhost:5050/files/${file.filename}`} target="_blank" rel="noopener noreferrer">
                            {file.filename}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FileUpload;
