import { useState, useEffect } from "react";
import axios from "axios";

export default function RubricUpload() {
  const [rubricFile, setRubricFile] = useState(null);
  const [rubrics, setRubrics] = useState([]);

  // Fetch uploaded rubrics
  useEffect(() => {
    axios.get("http://localhost:5000/rubrics")
      .then(response => setRubrics(response.data))
      .catch(error => console.error("Error fetching rubrics:", error));
  }, []);

  // Handle file selection
  const handleFileChange = (event) => {
    setRubricFile(event.target.files[0]);
  };

  // Upload rubric file
  const handleUpload = async () => {
    if (!rubricFile) {
      alert("Please select a rubric file.");
      return;
    }

    const formData = new FormData();
    formData.append("rubricFile", rubricFile);

    try {
      await axios.post("http://localhost:5000/upload-rubric", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Rubric uploaded successfully!");
      setRubricFile(null);
      window.location.reload(); // Refresh to show new rubrics
    } catch (error) {
      console.error("Error uploading rubric:", error);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Upload a Grading Rubric</h2>
      
      <input type="file" onChange={handleFileChange} className="mb-2 border p-2" />
      <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
        Upload
      </button>

      <h3 className="text-lg font-semibold mt-4">Uploaded Rubrics</h3>
      <ul className="list-disc pl-5">
        {rubrics.map((rubric) => (
          <li key={rubric._id}>
            <a href={`http://localhost:5000/${rubric.filepath}`} target="_blank" rel="noopener noreferrer">
              {rubric.filename}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
