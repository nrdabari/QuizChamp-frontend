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
    <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 md:p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
          <h1 className="text-lg md:text-xl font-bold text-purple-800">
            Exercise List
          </h1>
          <button
            onClick={() => navigate("/admin/activities")}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto text-sm"
          >
            <svg
              className="w-4 h-4"
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

        {/* Responsive grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {exercises.map((ex) => (
            <div
              key={ex._id}
              className={`${
                !ex.isActive
                  ? "bg-gray-200 border-gray-300 opacity-75"
                  : ex.questionCount === 0
                  ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300"
                  : "bg-white border-purple-200"
              } rounded-lg shadow-lg border p-3 md:p-4 space-y-2 relative transition-all hover:shadow-xl`}
            >
              {/* Edit Exercise Icon */}
              <button
                onClick={() => handleEditExercise(ex._id)}
                className={`absolute top-2 right-2 p-1.5 ${
                  !ex.isActive
                    ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                } rounded-full transition-colors`}
                title="Edit Exercise"
              >
                <svg
                  className="w-4 h-4"
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

              {/* Inactive Badge */}
              {!ex.isActive && (
                <div className="absolute top-2 left-2">
                  <span className="bg-gray-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Inactive
                  </span>
                </div>
              )}

              {/* Bulk Upload Badge */}
              {ex.isActive && ex.questionCount === 0 && (
                <div className="absolute top-2 left-2">
                  <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Ready for Upload
                  </span>
                </div>
              )}

              <h2
                className={`text-base md:text-lg font-bold pr-6 ${
                  !ex.isActive
                    ? "text-gray-600"
                    : ex.questionCount === 0
                    ? "text-blue-700"
                    : "text-purple-700"
                }`}
              >
                {ex?.subjectId?.name}
              </h2>

              <p
                className={`text-xs ${
                  !ex.isActive ? "text-gray-500" : "text-gray-600"
                }`}
              >
                Class {ex.class}
              </p>

              <div className="space-y-1.5">
                <p className={!ex.isActive ? "text-gray-600" : "text-gray-800"}>
                  <strong className="text-xs">Chapter: </strong>
                  {ex?.chapterId?.name ? (
                    <span className="text-xs">{ex?.chapterId?.name}</span>
                  ) : (
                    <span className="text-xs text-gray-400">-----</span>
                  )}
                </p>

                <p className={!ex.isActive ? "text-gray-600" : "text-gray-800"}>
                  <strong className="text-xs">Source: </strong>
                  <span className="text-xs">{ex.source}</span>
                  {!ex?.chapterId?.name && (
                    <span className="text-xs"> - {ex?.name}</span>
                  )}
                </p>
              </div>

              {ex.questionCount > 0 ? (
                <button
                  onClick={() => handleEditQuestion(ex._id)}
                  className={`w-full mt-3 font-semibold py-2 text-xs rounded-lg transition ${
                    !ex.isActive
                      ? "bg-gray-400 hover:bg-gray-500 text-gray-100"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                  disabled={!ex.isActive}
                >
                  Edit Questions ({ex.questionCount})
                </button>
              ) : (
                <button
                  onClick={() => handleUpload(ex._id)}
                  className={`w-full mt-3 font-semibold py-2 text-xs rounded-lg transition ${
                    !ex.isActive
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
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
