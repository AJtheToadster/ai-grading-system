import React from "react";
import EssayUpload from "./components/EssayUpload";
import RubricUpload from "./components/RubricUpload";

const App = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">AI Grading System</h1>

      {/* Essay Upload Section */}
      <EssayUpload />

      {/* Rubric Upload Section */}
      <RubricUpload />
    </div>
  );
};

export default App;
