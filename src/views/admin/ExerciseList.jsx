import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApiService } from "../../hooks/useApiService";

export default function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const navigate = useNavigate();
  const { admin, isAdmin } = useApiService();
  useEffect(() => {
    const fetchExercises = async () => {
      if (!isAdmin) return;

      const classLevel = 5; // or from formik / dropdown
      // setIsLoading(true);
      // setError(null);

      try {
        const data = await admin.getExercises(classLevel);
        setExercises(data);
      } catch (error) {
        console.error("❌ Failed to fetch exercises:", error);
        // setError(
        //   error.response?.data?.message ||
        //     error.message ||
        //     "Failed to fetch exercises"
        // );
      } finally {
        // setIsLoading(false);
      }
    };

    fetchExercises();
  }, [admin, isAdmin]);

  const handleUpload = (id) => {
    navigate(`/admin/bulk-upload/${id}`);
  };

  const handleEditQuestion = (id) => {
    navigate(`/admin/edit-questions/${id}`);
  };

  const handleEditExercise = (id) => {
    navigate(`/admin/edit-exercise/${id}`);
  };

  return (
    <div className=" bg-gradient-to-br from-purple-100 to-purple-200 p-6">
      <div className="">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-800">Exercise List</h1>
          <button
            onClick={() => navigate("/admin/activities")}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Exercise
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {exercises.map((ex) => (
            <div
              key={ex._id}
              className="bg-white rounded-xl shadow-lg border border-purple-200 p-5 space-y-3 relative"
            >
              {/* Edit Exercise Icon */}
              <button
                onClick={() => handleEditExercise(ex._id)}
                className="absolute top-3 right-3 p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                title="Edit Exercise"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>

              <h2 className="text-xl font-bold text-purple-700 pr-8">
                {ex?.subjectId?.name}
              </h2>
              <p className="text-sm text-gray-600">Class {ex.class}</p>
              <p>
                <strong>Chapter: </strong>
                {ex?.chapterId?.name ? (
                  <span className="ml-2">{ex?.chapterId?.name}</span>
                ) : (
                  " -----"
                )}{" "}
              </p>
              <p>
                <strong>Source: </strong> {ex.source}
                {!ex?.chapterId?.name && <span> - {ex?.name}</span>}
              </p>

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
