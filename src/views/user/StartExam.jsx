import React, { useEffect, useState, useMemo } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApiService } from "../../hooks/useApiService";
import {
  Play,
  Eye,
  ChevronDown,
  BookOpen,
  Clock,
  Users,
  FileText,
  Check,
} from "lucide-react";

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
      selectedSubjects: [], // Array of subject IDs
      selectedSources: [], // Array of sources
      exerciseId: "",
      totalTime: "",
    },
    validate: (values) => {
      const errors = {};
      if (!values.selectedSubjects || values.selectedSubjects.length === 0) {
        errors.selectedSubjects = "At least one subject is required";
      }
      if (!values.selectedSources || values.selectedSources.length === 0) {
        errors.selectedSources = "At least one source is required";
      }
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
          const examPayload = {
            ...values,
            userid,
            exerciseId: values.exerciseId,
          };

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

          if (data.questionIds && data.questionIds.length > 0) {
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

  // Get unique subjects
  const subjects = useMemo(() => {
    const uniqueSubjects = [
      ...new Set(exercises.map((ex) => ex.subjectId?.name).filter(Boolean)),
    ];
    return uniqueSubjects.map((name) => {
      const exercise = exercises.find((ex) => ex.subjectId?.name === name);
      return {
        id: exercise.subjectId._id,
        name: name,
      };
    });
  }, [exercises]);

  // Get sources based on selected subjects
  const availableSources = useMemo(() => {
    if (
      !formik.values.selectedSubjects ||
      formik.values.selectedSubjects.length === 0
    )
      return [];

    const subjectExercises = exercises.filter((ex) =>
      formik.values.selectedSubjects.includes(ex.subjectId?._id)
    );
    return [
      ...new Set(subjectExercises.map((ex) => ex.source).filter(Boolean)),
    ];
  }, [exercises, formik.values.selectedSubjects]);

  // Get exercises based on selected subjects and sources
  const availableExercises = useMemo(() => {
    if (
      !formik.values.selectedSubjects?.length ||
      !formik.values.selectedSources?.length
    )
      return [];

    return exercises.filter(
      (ex) =>
        formik.values.selectedSubjects.includes(ex.subjectId?._id) &&
        formik.values.selectedSources.includes(ex.source)
    );
  }, [
    exercises,
    formik.values.selectedSubjects,
    formik.values.selectedSources,
  ]);

  // Reset dependent fields when parent changes
  useEffect(() => {
    if (formik.values.selectedSubjects?.length > 0) {
      // Reset sources that are no longer available
      const availableSourcesList = [
        ...new Set(
          exercises
            .filter((ex) =>
              formik.values.selectedSubjects.includes(ex.subjectId?._id)
            )
            .map((ex) => ex.source)
            .filter(Boolean)
        ),
      ];

      const validSources = formik.values.selectedSources.filter((source) =>
        availableSourcesList.includes(source)
      );

      if (validSources.length !== formik.values.selectedSources.length) {
        formik.setFieldValue("selectedSources", validSources);
      }
      formik.setFieldValue("exerciseId", "");
    }
  }, [formik.values.selectedSubjects]);

  useEffect(() => {
    if (formik.values.selectedSources?.length > 0) {
      formik.setFieldValue("exerciseId", "");
    }
  }, [formik.values.selectedSources]);

  const handleSubjectChange = (subjectId) => {
    const currentSubjects = formik.values.selectedSubjects || [];
    const newSubjects = currentSubjects.includes(subjectId)
      ? currentSubjects.filter((id) => id !== subjectId)
      : [...currentSubjects, subjectId];

    formik.setFieldValue("selectedSubjects", newSubjects);
  };

  const handleSourceChange = (source) => {
    const currentSources = formik.values.selectedSources || [];
    const newSources = currentSources.includes(source)
      ? currentSources.filter((s) => s !== source)
      : [...currentSources, source];

    formik.setFieldValue("selectedSources", newSources);
  };

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

  const isFormValid =
    formik.values.selectedSubjects?.length > 0 &&
    formik.values.selectedSources?.length > 0 &&
    formik.values.exerciseId &&
    (mode !== "exam" || formik.values.totalTime);

  return (
    <div className="p-3 space-y-6">
      {/* Start Exam Form */}
      <form
        onSubmit={formik.handleSubmit}
        className="w-full max-w-4xl mx-auto p-5 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md border border-gray-200 dark:border-dark-purple-700 space-y-5 transition-colors duration-250"
      >
        <h2 className="text-lg font-bold font-display text-center text-primary-700 dark:text-text-dark-primary">
          {mode === ""
            ? "Choose Action"
            : mode === "exam"
            ? "Start New Exam"
            : "Practice Failed Questions"}
        </h2>

        {/* Mode Selection */}
        {mode === "" && (
          <div className="space-y-4">
            <p className="text-center text-sm text-text-light-secondary dark:text-text-dark-secondary font-sans">
              What would you like to do?
            </p>

            <button
              type="button"
              onClick={() => setMode("exam")}
              className="w-full bg-primary-600 dark:bg-dark-purple-500 text-white py-3 rounded-md hover:bg-primary-700 dark:hover:bg-dark-purple-600 transition-colors font-medium font-sans shadow-sm text-sm flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              📝 Start New Exam
            </button>

            <button
              type="button"
              onClick={() => setMode("practice")}
              className="w-full bg-orange-600 dark:bg-orange-700 text-white py-3 rounded-md hover:bg-orange-700 dark:hover:bg-orange-800 transition-colors font-medium font-sans shadow-sm text-sm flex items-center justify-center gap-2"
            >
              <BookOpen size={18} />
              🎯 Practice Failed Questions
            </button>
          </div>
        )}

        {/* Form Fields */}
        {mode !== "" && (
          <>
            {/* Step 1: Subject Selection with Checkboxes */}
            <div>
              <label className="block text-sm font-semibold text-text-light-primary dark:text-text-dark-primary mb-3 font-sans flex items-center gap-2">
                <span className="bg-primary-600 dark:bg-dark-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  1
                </span>
                Select Subjects ({formik.values.selectedSubjects?.length || 0}{" "}
                selected)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-gray-200 dark:border-dark-purple-600 rounded-lg bg-gray-50 dark:bg-dark-bg-tertiary">
                {subjects.map((subject) => (
                  <label
                    key={subject.id}
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-white dark:hover:bg-dark-bg-secondary cursor-pointer transition-colors border border-transparent hover:border-primary-200 dark:hover:border-dark-purple-500"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={
                          formik.values.selectedSubjects?.includes(
                            subject.id
                          ) || false
                        }
                        onChange={() => handleSubjectChange(subject.id)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          formik.values.selectedSubjects?.includes(subject.id)
                            ? "bg-primary-600 dark:bg-dark-purple-500 border-primary-600 dark:border-dark-purple-500"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg-secondary"
                        }`}
                      >
                        {formik.values.selectedSubjects?.includes(
                          subject.id
                        ) && <Check size={12} className="text-white" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users
                        size={16}
                        className="text-primary-600 dark:text-dark-purple-400"
                      />
                      <span className="text-sm font-medium text-text-light-primary dark:text-text-dark-primary">
                        {subject.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {formik.errors.selectedSubjects && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-2 font-sans">
                  {formik.errors.selectedSubjects}
                </p>
              )}
            </div>

            {/* Step 2: Source Selection with Checkboxes */}
            <div>
              <label className="block text-sm font-semibold text-text-light-primary dark:text-text-dark-primary mb-3 font-sans flex items-center gap-2">
                <span
                  className={`${
                    formik.values.selectedSubjects?.length > 0
                      ? "bg-primary-600 dark:bg-dark-purple-500 text-white"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-500"
                  } rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors`}
                >
                  2
                </span>
                Select Sources ({formik.values.selectedSources?.length || 0}{" "}
                selected)
              </label>

              <div
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border border-gray-200 dark:border-dark-purple-600 rounded-lg transition-colors ${
                  formik.values.selectedSubjects?.length > 0
                    ? "bg-gray-50 dark:bg-dark-bg-tertiary"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                {formik.values.selectedSubjects?.length === 0 ? (
                  <div className="col-span-full text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                    Please select at least one subject first
                  </div>
                ) : availableSources.length === 0 ? (
                  <div className="col-span-full text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                    No sources available for selected subjects
                  </div>
                ) : (
                  availableSources.map((source) => (
                    <label
                      key={source}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-white dark:hover:bg-dark-bg-secondary cursor-pointer transition-colors border border-transparent hover:border-primary-200 dark:hover:border-dark-purple-500"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={
                            formik.values.selectedSources?.includes(source) ||
                            false
                          }
                          onChange={() => handleSourceChange(source)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            formik.values.selectedSources?.includes(source)
                              ? "bg-primary-600 dark:bg-dark-purple-500 border-primary-600 dark:border-dark-purple-500"
                              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg-secondary"
                          }`}
                        >
                          {formik.values.selectedSources?.includes(source) && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen
                          size={16}
                          className="text-primary-600 dark:text-dark-purple-400"
                        />
                        <span className="text-sm font-medium text-text-light-primary dark:text-text-dark-primary">
                          {source}
                        </span>
                      </div>
                    </label>
                  ))
                )}
              </div>

              {formik.errors.selectedSources && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-2 font-sans">
                  {formik.errors.selectedSources}
                </p>
              )}
            </div>

            {/* Step 3: Exercise Selection */}
            <div>
              <label className="block text-sm font-semibold text-text-light-primary dark:text-text-dark-primary mb-3 font-sans flex items-center gap-2">
                <span
                  className={`${
                    formik.values.selectedSources?.length > 0
                      ? "bg-primary-600 dark:bg-dark-purple-500 text-white"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-500"
                  } rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors`}
                >
                  3
                </span>
                Select Exercise
              </label>
              <div className="relative">
                <FileText
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <select
                  name="exerciseId"
                  value={formik.values.exerciseId}
                  onChange={formik.handleChange}
                  disabled={!formik.values.selectedSources?.length}
                  className={`w-full pl-10 pr-10 py-3 border ${
                    formik.errors.exerciseId
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300 dark:border-dark-purple-600"
                  } rounded-md bg-white dark:bg-dark-bg-tertiary text-text-light-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-purple-400 focus:border-transparent transition-colors font-sans text-sm appearance-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500`}
                >
                  <option value="">
                    {!formik.values.selectedSources?.length
                      ? "-- Select Sources First --"
                      : "-- Choose Exercise --"}
                  </option>
                  {availableExercises.map((exercise) => (
                    <option key={exercise._id} value={exercise._id}>
                      {exercise.name ||
                        exercise.chapterId?.name ||
                        "Unnamed Exercise"}
                      {exercise.questionCount &&
                        ` (${exercise.questionCount} questions)`}
                      {` - ${exercise.subjectId?.name} - ${exercise.source}`}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              {formik.errors.exerciseId && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-sans">
                  {formik.errors.exerciseId}
                </p>
              )}
            </div>

            {/* Step 4: Total Time Input - Only for exam mode */}
            {mode === "exam" && (
              <div>
                <label className="block text-sm font-semibold text-text-light-primary dark:text-text-dark-primary mb-3 font-sans flex items-center gap-2">
                  <span
                    className={`${
                      formik.values.exerciseId
                        ? "bg-primary-600 dark:bg-dark-purple-500 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-500"
                    } rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors`}
                  >
                    4
                  </span>
                  Set Time Duration
                </label>
                <div className="relative">
                  <Clock
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="number"
                    name="totalTime"
                    value={formik.values.totalTime}
                    onChange={formik.handleChange}
                    disabled={!formik.values.exerciseId}
                    className={`w-full pl-10 pr-3 py-3 border ${
                      formik.errors.totalTime
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-dark-purple-600"
                    } rounded-md bg-white dark:bg-dark-bg-tertiary text-text-light-primary dark:text-text-dark-primary placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-purple-400 focus:border-transparent transition-colors font-sans text-sm disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500`}
                    placeholder="Enter exam duration in minutes"
                  />
                </div>
                {formik.errors.totalTime && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-sans">
                    {formik.errors.totalTime}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500 dark:bg-gray-600 text-white py-3 rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors font-sans text-sm font-medium"
              >
                ← Back
              </button>

              <button
                type="submit"
                disabled={!isFormValid}
                className={`flex-2 text-white py-3 px-6 rounded-md transition-colors font-sans text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                  mode === "exam"
                    ? "bg-primary-600 dark:bg-dark-purple-500 hover:bg-primary-700 dark:hover:bg-dark-purple-600 disabled:bg-primary-400"
                    : "bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-800 disabled:bg-orange-400"
                }`}
              >
                {mode === "exam" ? "🚀 Start Test" : "🎯 Start Practice"}
              </button>
            </div>

            {/* Selection Summary */}
            {(formik.values.selectedSubjects?.length > 0 ||
              formik.values.selectedSources?.length > 0 ||
              formik.values.exerciseId) && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-dark-purple-900/20 rounded-md border border-gray-200 dark:border-dark-purple-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Selection Summary:
                </h3>
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  {formik.values.selectedSubjects?.length > 0 && (
                    <div>
                      📚{" "}
                      <strong>
                        Subjects ({formik.values.selectedSubjects.length}):
                      </strong>{" "}
                      {formik.values.selectedSubjects
                        .map((id) => subjects.find((s) => s.id === id)?.name)
                        .join(", ")}
                    </div>
                  )}
                  {formik.values.selectedSources?.length > 0 && (
                    <div>
                      📖{" "}
                      <strong>
                        Sources ({formik.values.selectedSources.length}):
                      </strong>{" "}
                      {formik.values.selectedSources.join(", ")}
                    </div>
                  )}
                  {formik.values.exerciseId && (
                    <div>
                      ✏️ <strong>Exercise:</strong>{" "}
                      {availableExercises.find(
                        (e) => e._id === formik.values.exerciseId
                      )?.name ||
                        availableExercises.find(
                          (e) => e._id === formik.values.exerciseId
                        )?.chapterId?.name}
                    </div>
                  )}
                  {mode === "exam" && formik.values.totalTime && (
                    <div>
                      ⏱️ <strong>Duration:</strong> {formik.values.totalTime}{" "}
                      minutes
                    </div>
                  )}
                </div>
              </div>
            )}
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
