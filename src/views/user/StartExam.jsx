import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const StartExam = () => {
  const [exercises, setExercises] = useState([]);
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(""); // "exam" or "practice"
  const { user } = useAuth();

  const formik = useFormik({
    initialValues: {
      userId: user._id,
      exerciseId: "",
      totalTime: "",
    },
    validate: (values) => {
      const errors = {};
      // if (!values.userId) errors.userId = "User is required";
      if (!values.exerciseId) errors.exerciseId = "Exercise is required";

      if (mode === "exam") {
        if (!values.totalTime) errors.totalTime = "Total time is required";
        else if (isNaN(values.totalTime) || Number(values.totalTime) <= 0)
          errors.totalTime = "Enter valid time in minutes";
      }
      return errors;
    },
    onSubmit: async (values) => {
      if (mode === "exam") {
        const res = await fetch(`http://localhost:5000/api/submissions/start`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Start Exam Payload:", data);
          navigate(
            `/user/test/${values.exerciseId}?user=${values.userId}&time=${
              values.totalTime * 60
            }&submissionId=${data._id}`
          );
        } else {
          alert("❌ Failed to save");
        }
      } else {
        try {
          // Check if user has failed questions for this exercise
          const response = await fetch(
            `http://localhost:5000/api/practices/exercises/${formik.values.exerciseId}/failed-questions?userId=${formik.values.userId}`
          );
          const data = await response.json();

          if (data.questionIds && data.questionIds.length > 0) {
            // Navigate to practice page with exerciseId and userId
            navigate(
              `/user/practice/${formik.values.exerciseId}?userId=${formik.values.userId}`
            );
          } else {
            alert(
              "🎉 Great! You have no failed questions to practice for this exercise."
            );
          }
        } catch (error) {
          console.error("Error checking failed questions:", error);
          alert("❌ Failed to check practice questions");
        }
      }
    },
  });

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        fetch("http://localhost:5000/api/exercises")
          .then((res) => res.json())
          .then(setExercises);

        const res = await fetch("http://localhost:5000/api/submissions");
        const data = await res.json();
        setSubmissions(data);
      } catch (err) {
        console.error("❌ Failed to fetch submissions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const handleResume = (submission) => {
    const exerciseId = submission.exerciseId?._id;
    const userId = submission.userId?._id;
    const totalTimeInSeconds = (submission.totalTime ?? 60) * 60;
    const timeLeft = submission.timeLeft ?? totalTimeInSeconds;

    navigate(
      `/user/test/${exerciseId}?user=${userId}&time=${timeLeft}&submissionId=${submission._id}&examTotalTime=${submission.totalTime}`
    );
  };

  const handleReport = (submission) => {
    navigate(`/user/report/${submission._id}`);
  };

  const resetForm = () => {
    setMode("");
    formik.resetForm();
  };

  if (loading) return <p className="p-4">Loading submissions...</p>;

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow space-y-4"
      >
        <h2 className="text-xl font-bold mb-4 text-center text-purple-700">
          {mode === ""
            ? "Choose Action"
            : mode === "exam"
            ? "Start New Exam"
            : "Practice Failed Questions"}
        </h2>

        {/* Mode Selection */}
        {mode === "" && (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">
              What would you like to do?
            </p>

            <button
              type="button"
              onClick={() => setMode("exam")}
              className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 transition font-medium"
            >
              📝 Start New Exam
            </button>

            <button
              type="button"
              onClick={() => setMode("practice")}
              className="w-full bg-orange-600 text-white py-3 rounded hover:bg-orange-700 transition font-medium"
            >
              🎯 Practice Failed Questions
            </button>
          </div>
        )}

        {/* Form Fields - Show when mode is selected */}
        {mode !== "" && (
          <>
            {/* Exercise Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Exercise
              </label>
              <select
                name="exerciseId"
                value={formik.values.exerciseId}
                onChange={formik.handleChange}
                className="w-full border border-gray-300 p-2 rounded"
              >
                <option value="">-- Choose Exercise --</option>
                {exercises.map((ex) => (
                  <option key={ex._id} value={ex._id}>
                    {ex.source} - {ex.name}
                  </option>
                ))}
              </select>
              {formik.errors.exerciseId && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.exerciseId}
                </p>
              )}
            </div>

            {/* Total Time Input - Only for exam mode */}
            {mode === "exam" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Time (minutes)
                </label>
                <input
                  type="number"
                  name="totalTime"
                  value={formik.values.totalTime}
                  onChange={formik.handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                  placeholder="Enter exam duration"
                />
                {formik.errors.totalTime && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.totalTime}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
              >
                ← Back
              </button>

              <button
                type="submit"
                className={`flex-1 text-white py-2 rounded transition ${
                  mode === "exam"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {mode === "exam" ? "Start Test" : "Start Practice"}
              </button>
            </div>
          </>
        )}
      </form>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">
          All Submissions
        </h2>
        <div className="overflow-x-auto rounded-lg shadow border">
          <table className="min-w-full table-auto bg-white text-left">
            <thead className="bg-purple-100 text-purple-800">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">User</th>
                <th className="p-3">Exercise</th>
                <th className="p-3">Score</th>
                <th className="p-3">Time Taken (min)</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, idx) => (
                <tr key={sub._id} className="border-t hover:bg-purple-50">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">{sub.userId?.name || "Unknown"}</td>
                  <td className="p-3">
                    {sub.exerciseId?.source} - {sub.exerciseId?.name}
                  </td>
                  <td className="p-3">
                    {sub.score} / {sub.answers.length}
                  </td>
                  <td className="p-3">{Math.floor(sub.totalTimeTaken / 60)}</td>
                  <td className="p-3">
                    {sub?.endedAt
                      ? new Date(sub.endedAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="p-3">
                    {sub.status === "paused" ? (
                      <button
                        className="px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-900 transition"
                        onClick={() => handleResume(sub)}
                      >
                        Resume
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        onClick={() => handleReport(sub)}
                      >
                        View Report
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default StartExam;
