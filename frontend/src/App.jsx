import React, { useState, useEffect } from "react";
import FileUpload from "./components/FileUpload";
import RubricUpload from "./components/RubricUpload";
import { fetchUploadedFiles } from "./services/api";

const App = () => {
    const [uploadedFiles, setUploadedFiles] = useState([]);

    useEffect(() => {
        fetchUploadedFiles().then(response => setUploadedFiles(response.data));
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold">AI Grading System</h1>

            {/* Essay Upload Component */}
            <FileUpload refreshFiles={() => fetchUploadedFiles().then(response => setUploadedFiles(response.data))} />

            {/* Rubric Upload Component */}
            <RubricUpload />
            
        </div>
    );
};

export default App;
