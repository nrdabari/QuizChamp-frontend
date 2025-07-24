import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";

const StartExam = () => {
  const [users, setUsers] = useState([]);
  const [exercises, setExercises] = useState([]);
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const formik = useFormik({
    initialValues: {
      userId: "",
      exerciseId: "",
      totalTime: "",
    },
    validate: (values) => {
      const errors = {};
      if (!values.userId) errors.userId = "User is required";
      if (!values.exerciseId) errors.exerciseId = "Exercise is required";
      if (!values.totalTime) errors.totalTime = "Total time is required";
      else if (isNaN(values.totalTime) || Number(values.totalTime) <= 0)
        errors.totalTime = "Enter valid time in minutes";
      return errors;
    },
    onSubmit: async (values) => {
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

      // Example: navigate(`/exam/${values.exerciseId}?user=${values.userId}&time=${values.totalTime}`);
    },
  });

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        fetch("http://localhost:5000/api/users")
          .then((res) => res.json())
          .then(setUsers);

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

  if (loading) return <p className="p-4">Loading submissions...</p>;

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow space-y-4"
      >
        <h2 className="text-xl font-bold mb-4 text-center text-purple-700">
          Start New Exam
        </h2>

        {/* User Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select User
          </label>
          <select
            name="userId"
            value={formik.values.userId}
            onChange={formik.handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="">-- Choose User --</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {formik.errors.userId && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.userId}</p>
          )}
        </div>

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
                {ex.subject} - {ex.source} - {ex.chapter}
              </option>
            ))}
          </select>
          {formik.errors.exerciseId && (
            <p className="text-red-500 text-sm mt-1">
              {formik.errors.exerciseId}
            </p>
          )}
        </div>

        {/* Total Time Input */}
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

        {/* Start Button */}
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
        >
          Start Test
        </button>
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
                <th className="p-3">Action</th> {/* Add action column */}
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, idx) => (
                <tr key={sub._id} className="border-t hover:bg-purple-50">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3">{sub.userId?.name || "Unknown"}</td>
                  <td className="p-3">
                    {sub.exerciseId?.subject} - {sub.exerciseId?.chapter}
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
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        onClick={() => handleResume(sub)}
                      >
                        Resume
                      </button>
                    ) : (
                      "-"
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
