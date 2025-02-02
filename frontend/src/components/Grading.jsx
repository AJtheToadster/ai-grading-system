import { useState, useEffect } from 'react';
import { getGrades, gradeEssays, uploadGrades } from '../services/api';

const GradingComponent = () => {
  const [grades, setGrades] = useState([]);  // Store grades fetched from the database
  const [loading, setLoading] = useState(false);  // Loading state for grading process
  const [uploadStatus, setUploadStatus] = useState(null);  // Upload status message
  const [fetchingGrades, setFetchingGrades] = useState(false);  // Loading state for fetching grades
  const [gradingMode, setGradingMode] = useState('full');  // Default grading mode
  const [lastUpdated, setLastUpdated] = useState(null);  // Timestamp of last grading

  // Fetch grades when the component mounts
  useEffect(() => {
    fetchGrades();
  }, []);

  // Automatically clear success messages after 3 seconds
  useEffect(() => {
    if (uploadStatus && uploadStatus.includes('successfully')) {
      const timer = setTimeout(() => setUploadStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadStatus]);

  // Function to fetch grades from the database
  const fetchGrades = async () => {
    setFetchingGrades(true);
    try {
      const response = await getGrades();
      console.log('Full Grades API Response:', response);  // Log the entire response object
  
      if (Array.isArray(response.data)) {
        setGrades(response.data);
      } else {
        console.warn('Unexpected data format:', response.data);
        setGrades([]);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      setGrades([]);
    } finally {
      setFetchingGrades(false);
    }
  };

  // Function to grade essays and upload grades to the database
  const handleGrading = async () => {
    setLoading(true);
    setUploadStatus(null);

    try {
      const response = await gradeEssays(gradingMode);  // Pass selected grading mode
      const gradedData = response.data;

      // Upload grades to the database
      const uploadResponse = await uploadGrades(gradedData);

      if (uploadResponse.status === 201) {
        setUploadStatus('Grades uploaded successfully!');
        fetchGrades();  // Refresh grades after successful upload
        setLastUpdated(new Date().toLocaleString());  // Set last updated timestamp
      } else {
        setUploadStatus('Failed to upload grades.');
      }

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error uploading grades.';
      setUploadStatus(`❌ ${errorMsg}`);
      console.error('Error grading or uploading essays:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Grading</h2>

      {/* Grading Mode Selector */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Grading Mode:</label>
        <select
          value={gradingMode}
          onChange={(e) => setGradingMode(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="full">Full Grade (No Curve)</option>
          <option value="flagged">Flagged Review</option>
        </select>
      </div>

      {/* Grading Button */}
      <button
        onClick={handleGrading}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 mt-2"
      >
        {loading ? 'Grading...' : 'Start Grading'}
      </button>

      {/* Display upload status */}
      {uploadStatus && (
        <div className={`mt-4 p-2 rounded ${uploadStatus.includes('successfully') ? 'bg-green-200' : 'bg-red-200'}`}>
          {uploadStatus}
        </div>
      )}

      {/* Display Last Updated Timestamp */}
      {lastUpdated && (
        <p className="mt-2 text-sm text-gray-500">
          Last graded on: {lastUpdated}
        </p>
      )}

      {/* Display Grades */}
      {fetchingGrades ? (
        <p className="mt-4 text-gray-500">Fetching grades...</p>
      ) : Array.isArray(grades) && grades.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Grades:</h3>
          <ul className="mt-2">
            {grades.map((grade) => (
              <li
                key={grade._id}
                className={`p-2 border-b ${grade.flagged ? 'bg-red-100' : ''}`}
              >
                <strong>Essay ID:</strong> {grade.essayId} <br />
                <strong>Score:</strong> {grade.score} <br />
                <strong>Feedback:</strong> {grade.feedback} <br />
                <strong>Flagged:</strong> {grade.flagged ? 'Yes' : 'No'}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-4 text-gray-500">No grades available.</div>
      )}
    </div>
  );
};

export default GradingComponent;