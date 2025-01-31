import React, { useState } from 'react';
import axios from 'axios';

const GradingComponent = () => {
  const [grades, setGrades] = useState([]);
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [gradingMode, setGradingMode] = useState('full');
  const [loading, setLoading] = useState(false);

  const handleGrading = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/grade', { mode: gradingMode });
      if (gradingMode === 'full') {
        setGrades(response.data.grades);
      } else {
        setFlaggedReviews(response.data.flagged);
      }
    } catch (error) {
      console.error('Error grading essays:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Grading</h2>
      <div className="mb-4">
        <label className="mr-2">Grading Mode:</label>
        <select value={gradingMode} onChange={(e) => setGradingMode(e.target.value)} className="p-2 border rounded">
          <option value="full">Full Grade (No Curve)</option>
          <option value="flagged">Flagged Review</option>
        </select>
      </div>
      <button onClick={handleGrading} disabled={loading} className="bg-blue-500 text-white px-4 py-2 mt-2">
        {loading ? 'Grading...' : 'Start Grading'}
      </button>
    </div>
  );
};

export default GradingComponent;
