import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ExerciseList() {
  const [exercises, setExercises] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const classLevel = 5; // or from formik / dropdown

    fetch(`http://localhost:5000/api/exercises?classLevel=${classLevel}`)
      .then((res) => res.json())
      .then((data) => setExercises(data))
      .catch((err) => console.error("❌ Failed to fetch exercises:", err));
  }, []);

  const handleUpload = (id) => {
    navigate(`/admin/bulk-upload/${id}`);
  };

  const handleEditQuestion = (id) => {
    navigate(`/admin/edit-questions/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-800 mb-6">
          Exercise List
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((ex) => (
            <div
              key={ex._id}
              className="bg-white rounded-xl shadow-lg border border-purple-200 p-5 space-y-3"
            >
              <div>
                <h2 className="text-xl font-bold text-purple-700">
                  {ex?.subjectId?.name}
                </h2>
                <p className="text-sm text-gray-600">Class {ex.class}</p>
              </div>
              <div className="text-gray-700">
                <p>
                  <strong>Chapter:</strong> {ex?.chapterId?.name || <em>—</em>}
                </p>
                <p>
                  <strong>Source:</strong> {ex.source}
                </p>
              </div>
              {ex.questionCount > 0 ? (
                <button
                  onClick={() => handleEditQuestion(ex._id)}
                  className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  Edit Questions
                </button>
              ) : (
                <button
                  onClick={() => handleUpload(ex._id)}
                  className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  📤 Bulk Upload
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
