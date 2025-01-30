import React, { useState } from 'react';
import { uploadPDFs } from '../services/api';

const FileUpload = () => {
    const [files, setFiles] = useState([]);

    const handleUpload = async () => {
        try {
            const response = await uploadPDFs(files);
            console.log(response.data);
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    return (
        <div>
            <input type="file" multiple onChange={e => setFiles([...e.target.files])} />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

export default FileUpload;
