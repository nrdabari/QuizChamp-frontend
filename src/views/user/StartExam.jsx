import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApiService } from "../../hooks/useApiService";
import { Play, Eye } from "lucide-react";

const StartExam = () => {
  const [exercises, setExercises] = useState([]);
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(""); // "exam" or "practice"
  const { user } = useAuth();
  const { userServ } = useApiService();

  const formik = useFormik({
    initialValues: {
      userId: user?.id || user?._id || "",
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
      const userid = values.userId || user?.id || user?._id;
      console.log(values.userId);
      console.log(user);

      if (mode === "exam") {
        try {
          const examPayload = { ...values, userid };

          const data = await userServ.startExam(examPayload);

          console.log("Start Exam Payload:", data);
          navigate(
            `/user/test/${values.exerciseId}?user=${userid}&time=${
              values.totalTime * 60
            }&submissionId=${data._id}&examTotalTime=${values.totalTime}`
          );
        } catch (error) {
          console.error("Start Exam Error: ", error);
        }
      } else {
        try {
          const data = await userServ.getFailedQuestionsForPractice(
            formik.values.exerciseId,
            userid
          );
          // Check if user has failed questions for this exercise

          if (data.questionIds && data.questionIds.length > 0) {
            // Navigate to practice page with exerciseId and userId
            navigate(
              `/user/practice/${formik.values.exerciseId}?userId=${userid}`
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
        const [exercisesData, submissionsData] = await Promise.all([
          userServ.getExercises(),
          userServ.getAllSubmissions(),
        ]);

        setExercises(exercisesData);
        setSubmissions(submissionsData);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-dark-purple-400"></div>
        <span className="ml-3 text-text-light-primary dark:text-text-dark-primary font-sans">
          Loading submissions...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <span className="text-text-light-primary dark:text-text-dark-primary font-sans">
          Loading user data...
        </span>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-6">
      {/* Start Exam Form - Compact */}
      <form
        onSubmit={formik.handleSubmit}
        className="w-full max-w-md mx-auto p-4 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md border border-gray-200 dark:border-dark-purple-700 space-y-3 transition-colors duration-250"
      >
        <h2 className="text-sm font-bold font-display text-center text-primary-700 dark:text-text-dark-primary">
          {mode === ""
            ? "Choose Action"
            : mode === "exam"
            ? "Start New Exam"
            : "Practice Failed Questions"}
        </h2>

        {/* Mode Selection - Compact */}
        {mode === "" && (
          <div className="space-y-3">
            <p className="text-center text-xs text-text-light-secondary dark:text-text-dark-secondary font-sans">
              What would you like to do?
            </p>

            <button
              type="button"
              onClick={() => setMode("exam")}
              className="w-full bg-primary-600 dark:bg-dark-purple-500 text-white py-2.5 rounded-md hover:bg-primary-700 dark:hover:bg-dark-purple-600 transition-colors font-medium font-sans shadow-sm text-sm"
            >
              📝 Start New Exam
            </button>

            <button
              type="button"
              onClick={() => setMode("practice")}
              className="w-full bg-orange-600 dark:bg-orange-700 text-white py-2.5 rounded-md hover:bg-orange-700 dark:hover:bg-orange-800 transition-colors font-medium font-sans shadow-sm text-sm"
            >
              🎯 Practice Failed Questions
            </button>
          </div>
        )}

        {/* Form Fields - Compact */}
        {mode !== "" && (
          <>
            {/* Exercise Dropdown */}
            <div>
              <label className="block text-xs font-medium text-text-light-primary dark:text-text-dark-primary mb-1.5 font-sans">
                Select Exercise
              </label>
              <select
                name="exerciseId"
                value={formik.values.exerciseId}
                onChange={formik.handleChange}
                className="w-full border border-gray-300 dark:border-dark-purple-600 p-1.5 rounded-md bg-white dark:bg-dark-bg-tertiary text-text-light-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-purple-400 focus:border-transparent transition-colors font-sans text-sm"
              >
                <option value="">-- Choose Exercise --</option>
                {exercises.map((ex) => (
                  <option key={ex._id} value={ex._id}>
                    {ex.source} - {ex.name}
                  </option>
                ))}
              </select>
              {formik.errors.exerciseId && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-sans">
                  {formik.errors.exerciseId}
                </p>
              )}
            </div>

            {/* Total Time Input - Only for exam mode */}
            {mode === "exam" && (
              <div>
                <label className="block text-xs font-medium text-text-light-primary dark:text-text-dark-primary mb-1.5 font-sans">
                  Total Time (minutes)
                </label>
                <input
                  type="number"
                  name="totalTime"
                  value={formik.values.totalTime}
                  onChange={formik.handleChange}
                  className="w-full border border-gray-300 dark:border-dark-purple-600 p-2.5 rounded-md bg-white dark:bg-dark-bg-tertiary text-text-light-primary dark:text-text-dark-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-purple-400 focus:border-transparent transition-colors font-sans text-sm"
                  placeholder="Enter exam duration"
                />
                {formik.errors.totalTime && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-sans">
                    {formik.errors.totalTime}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons - Compact */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500 dark:bg-gray-600 text-white py-2 rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors font-sans text-sm"
              >
                ← Back
              </button>

              <button
                type="submit"
                className={`flex-1 text-white py-2 rounded-md transition-colors font-sans text-sm ${
                  mode === "exam"
                    ? "bg-primary-600 dark:bg-dark-purple-500 hover:bg-primary-700 dark:hover:bg-dark-purple-600"
                    : "bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-800"
                }`}
              >
                {mode === "exam" ? "Start Test" : "Start Practice"}
              </button>
            </div>
          </>
        )}
      </form>

      {/* Submissions Table - Compact */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md border border-gray-200 dark:border-dark-purple-700 transition-colors duration-250">
        <div className="p-3 border-b border-gray-200 dark:border-dark-purple-700">
          <h2 className="text-sm font-bold font-display text-primary-700 dark:text-text-dark-primary">
            All Submissions
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-left">
            <thead className="bg-primary-100 dark:bg-dark-purple-900 text-primary-800 dark:text-text-dark-primary">
              <tr>
                <th className="p-2 font-semibold font-sans text-xs">#</th>
                <th className="p-2 font-semibold font-sans text-xs">User</th>
                <th className="p-2 font-semibold font-sans text-xs">
                  Exercise
                </th>
                <th className="p-2 font-semibold font-sans text-xs">Score</th>
                <th className="p-2 font-semibold font-sans text-xs">
                  Time (min)
                </th>
                <th className="p-2 font-semibold font-sans text-xs">
                  Submitted
                </th>
                <th className="p-2 font-semibold font-sans text-xs">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, idx) => (
                <tr
                  key={sub._id}
                  className="border-t border-gray-200 dark:border-dark-purple-700 hover:bg-primary-50 dark:hover:bg-dark-purple-700/20 transition-colors"
                >
                  <td className="p-2 text-text-light-primary dark:text-text-dark-primary font-sans text-xs">
                    {idx + 1}
                  </td>
                  <td className="p-2 text-text-light-primary dark:text-text-dark-primary font-sans text-xs">
                    <div className="truncate max-w-24">
                      {sub.userId?.name || "Unknown"}
                    </div>
                  </td>
                  <td className="p-2 text-text-light-primary dark:text-text-dark-primary font-sans text-xs">
                    <div className="truncate max-w-32">
                      {sub.exerciseId?.source} - {sub.exerciseId?.name}
                    </div>
                  </td>
                  <td className="p-2 text-text-light-primary dark:text-text-dark-primary font-sans text-xs">
                    <span className="font-medium">
                      {sub.score} / {sub.answers.length}
                    </span>
                  </td>
                  <td className="p-2 text-text-light-primary dark:text-text-dark-primary font-sans text-xs">
                    {Math.floor(sub.totalTimeTaken / 60)}
                  </td>
                  <td className="p-2 text-text-light-primary dark:text-text-dark-primary font-sans text-xs">
                    <div className="truncate max-w-24">
                      {sub?.endedAt
                        ? new Date(sub.endedAt).toLocaleDateString()
                        : "-"}
                    </div>
                  </td>
                  <td className="p-2">
                    {sub.status === "paused" ? (
                      <button
                        className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        onClick={() => handleResume(sub)}
                        title="Resume"
                      >
                        <Play size={14} />
                      </button>
                    ) : (
                      <button
                        className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        onClick={() => handleReport(sub)}
                        title="View Report"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {submissions.length === 0 && (
          <div className="p-4 text-center text-text-light-secondary dark:text-text-dark-secondary font-sans text-xs">
            No submissions found.
          </div>
        )}
      </div>
    </div>
  );
};

export default StartExam;
