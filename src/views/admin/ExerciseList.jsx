import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApiService } from "../../hooks/useApiService";

export default function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [filters, setFilters] = useState({
    exerciseName: "",
    subject: "",
    source: "",
  });
  const navigate = useNavigate();
  const { admin, isAdmin } = useApiService();

  // Load filters from localStorage on component mount
  useEffect(() => {
    const savedFilters = localStorage.getItem("exerciseFilters");
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(parsedFilters);
      } catch (error) {
        console.error("Failed to parse saved filters:", error);
      }
    }
  }, []);

  // Save filters to localStorage whenever filters change
  useEffect(() => {
    localStorage.setItem("exerciseFilters", JSON.stringify(filters));
  }, [filters]);

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

  // Filter exercises based on current filters
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const exerciseNameMatch =
        !filters.exerciseName ||
        (ex.name &&
          ex.name.toLowerCase().includes(filters.exerciseName.toLowerCase())) ||
        (ex?.chapterId?.name &&
          ex.chapterId.name
            .toLowerCase()
            .includes(filters.exerciseName.toLowerCase()));

      const subjectMatch =
        !filters.subject ||
        (ex?.subjectId?.name &&
          ex.subjectId.name
            .toLowerCase()
            .includes(filters.subject.toLowerCase()));

      const sourceMatch =
        !filters.source ||
        (ex.source &&
          ex.source.toLowerCase().includes(filters.source.toLowerCase()));

      return exerciseNameMatch && subjectMatch && sourceMatch;
    });
  }, [exercises, filters]);

  // Get unique values for filter dropdowns
  const filterOptions = useMemo(() => {
    const subjects = [
      ...new Set(exercises.map((ex) => ex?.subjectId?.name).filter(Boolean)),
    ];
    const sources = [
      ...new Set(exercises.map((ex) => ex.source).filter(Boolean)),
    ];

    return { subjects, sources };
  }, [exercises]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      exerciseName: "",
      subject: "",
      source: "",
    });
  };

  const handleUpload = (id) => {
    navigate(`/admin/bulk-upload/${id}`);
  };

  const handleEditQuestion = (id) => {
    navigate(`/admin/edit-questions/${id}`);
  };

  const handleEditExercise = (id) => {
    navigate(`/admin/edit-exercise/${id}`);
  };

  const hasActiveFilters =
    filters.exerciseName || filters.subject || filters.source;

  return (
    <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 md:p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
          <h1 className="text-lg md:text-xl font-bold text-purple-800">
            Exercise List
            {filteredExercises.length !== exercises.length && (
              <span className="text-sm font-normal text-purple-600 ml-2">
                ({filteredExercises.length} of {exercises.length})
              </span>
            )}
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

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-purple-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <h2 className="text-md font-semibold text-purple-700 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-purple-600 hover:text-purple-800 underline flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Exercise Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exercise/Chapter Name
              </label>
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.exerciseName}
                onChange={(e) =>
                  handleFilterChange("exerciseName", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange("subject", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              >
                <option value="">All Subjects</option>
                {filterOptions.subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                value={filters.source}
                onChange={(e) => handleFilterChange("source", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              >
                <option value="">All Sources</option>
                {filterOptions.sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* No Results Message */}
        {filteredExercises.length === 0 && exercises.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-yellow-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              No exercises found
            </h3>
            <p className="text-yellow-700 mb-3">
              No exercises match your current filter criteria.
            </p>
            <button
              onClick={clearFilters}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Responsive grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredExercises.map((ex) => (
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
