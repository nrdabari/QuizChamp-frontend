import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { Plus, Trash2 } from "lucide-react";
import { sourceOptions } from "../../helper/helpers";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";

export default function AddExercise() {
  const { id } = useParams(); // Get exercise ID from URL (undefined for add mode)
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Determine if we're in edit mode
  const isEditMode = !!id;

  const ExerciseSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    class: Yup.number()
      .required("Class is required")
      .min(1, "Class must be at least 1")
      .max(12, "Class must be at most 12"),
    subjectId: Yup.string().required("Subject is required"),
    chapter: Yup.string(),
    source: Yup.string().required("Source is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      class: 5,
      subject: "",
      chapter: "",
      subjectId: "",
      chapterId: "",
      source: "",
      directions: [{ text: "", start: "", end: "" }],
      headers: [{ text: "", start: "", end: "" }],
      sections: [{ text: "", start: "", end: "" }],
    },
    validationSchema: ExerciseSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        console.log(values);

        const payload = { ...values };

        // Remove empty fields
        if (!payload.chapterId) delete payload.chapterId;
        if (!payload.subjectId) delete payload.subjectId;

        const url = "http://localhost:5000/api/exercises/exercise"; // Single endpoint
        const res = await fetch(url, {
          method: "POST", // Always POST
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok) {
          const message = values._id
            ? "✅ Exercise updated successfully!"
            : "✅ Exercise created successfully!";
          alert(message);

          if (values._id) {
            navigate("/admin/exercises"); // Navigate back to list
          } else {
            resetForm(); // New entry
          }
        } else {
          alert(`❌ Server error: ${data.message}`);
        }
      } catch (err) {
        console.error(err);
        const errorMessage = values._id
          ? "❌ Network error while updating exercise"
          : "❌ Network error while creating exercise";
        alert(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const inputStyles =
    "w-full px-4 py-2 border border-purple-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all";

  // Load exercise data for editing (only in edit mode)
  useEffect(() => {
    // Always reset form first
    formik.resetForm();

    if (!isEditMode) return;

    const fetchExercise = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/exercises/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch exercise");
        }
        const exerciseData = await res.json();

        // Set form values with existing data
        formik.setValues({
          _id: exerciseData._id,
          name: exerciseData.name || "",
          class: exerciseData.class || 5,
          subject: exerciseData.subject || "",
          chapter: exerciseData.chapter || "",
          subjectId:
            exerciseData.subjectId?._id || exerciseData.subjectId || "",
          chapterId:
            exerciseData.chapterId?._id || exerciseData.chapterId || "",
          source: exerciseData.source || "",
          directions:
            exerciseData.directions?.length > 0
              ? exerciseData.directions
              : [{ text: "", start: "", end: "" }],
          headers:
            exerciseData.headers?.length > 0
              ? exerciseData.headers
              : [{ text: "", start: "", end: "" }],
          sections:
            exerciseData.sections?.length > 0
              ? exerciseData.sections
              : [{ text: "", start: "", end: "" }],
        });
      } catch (err) {
        console.error("Error fetching exercise:", err);
        setError("Failed to load exercise data");
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [id, isEditMode]);

  // Load subjects
  useEffect(() => {
    fetch(`http://localhost:5000/api/subjects?classLevel=5`)
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch((err) => console.error("Error fetching subjects", err));
  }, []);

  // Load chapters when subject changes
  useEffect(() => {
    if (formik.values.subjectId) {
      fetch(
        `http://localhost:5000/api/chapters?subjectId=${formik.values.subjectId}&classLevel=5`
      )
        .then((res) => res.json())
        .then((data) => setChapters(data))
        .catch((err) => console.error("Error fetching chapters", err));
    } else {
      setChapters([]);
    }
  }, [formik.values.subjectId]);

  // ── Helpers
  const addItem = (group) => {
    const newItem = { text: "", start: "", end: "" };
    formik.setFieldValue(group, [...formik.values[group], newItem]);
  };

  const removeItem = (group, index) => {
    const updated = [...formik.values[group]];
    updated.splice(index, 1);
    formik.setFieldValue(group, updated);
  };

  const renderGroup = (group, label) => (
    <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200 mb-6">
      <h3 className="text-xl font-bold text-purple-800 mb-4">{label}</h3>
      {formik.values[group].map((_, idx) => (
        <div
          key={idx}
          className="bg-white p-4 rounded-lg mb-4 border border-purple-200"
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold text-purple-700">
              {label} {idx + 1}
            </h4>
            {formik.values[group].length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(group, idx)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Text"
              value={formik.values[group][idx]?.text || ""}
              onChange={(e) =>
                formik.setFieldValue(`${group}[${idx}].text`, e.target.value)
              }
              className={inputStyles}
            />
            <input
              type="number"
              placeholder="Start"
              value={formik.values[group][idx]?.start || ""}
              onChange={(e) =>
                formik.setFieldValue(`${group}[${idx}].start`, e.target.value)
              }
              className={inputStyles}
            />
            <input
              type="number"
              placeholder="End"
              value={formik.values[group][idx]?.end || ""}
              onChange={(e) =>
                formik.setFieldValue(`${group}[${idx}].end`, e.target.value)
              }
              className={inputStyles}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => addItem(group)}
        className="mt-2 flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
      >
        <Plus size={18} /> Add {label}
      </button>
    </div>
  );

  // Loading state (only for edit mode)
  if (isEditMode && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-purple-700 mt-4 text-lg">Loading exercise...</p>
        </div>
      </div>
    );
  }

  // Error state (only for edit mode)
  if (isEditMode && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => navigate("/admin/exercises")}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Back to Exercises
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {isEditMode ? "Edit Exercise" : "Add Exercise"}
                </h1>
                <p className="text-purple-100 mt-1">
                  {isEditMode
                    ? "Update exercise details, directions, headers & sections"
                    : "Create new exercise with directions, headers & sections"}
                </p>
              </div>
              {isEditMode && (
                <button
                  onClick={() => navigate("/admin/exercises")}
                  className="bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Back to List
                </button>
              )}
            </div>
          </div>

          <form onSubmit={formik.handleSubmit} className="p-8 space-y-10">
            {/* Subject & Chapter */}
            <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-purple-800 mb-6">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium mb-1 text-purple-700">
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    className={inputStyles}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="text-red-600 text-sm mt-1">
                      {formik.errors.name}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block font-medium mb-1 text-purple-700">
                    Subject
                  </label>
                  <select
                    name="subjectId"
                    value={formik.values.subjectId}
                    onChange={formik.handleChange}
                    className={inputStyles}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.subjectId && formik.errors.subjectId && (
                    <div className="text-red-600 text-sm mt-1">
                      {formik.errors.subjectId}
                    </div>
                  )}
                </div>

                {/* Chapter Dropdown */}
                <div>
                  <label className="block font-medium mb-1 text-purple-700">
                    Chapter
                  </label>
                  <select
                    name="chapterId"
                    value={formik.values.chapterId}
                    onChange={formik.handleChange}
                    className={inputStyles}
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.chapterId && formik.errors.chapterId && (
                    <div className="text-red-600 text-sm mt-1">
                      {formik.errors.chapterId}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block font-medium mb-1 text-purple-700">
                    Source
                  </label>
                  <select
                    name="source"
                    value={formik.values.source}
                    onChange={formik.handleChange}
                    className={inputStyles}
                  >
                    <option value="">-- Select Source --</option>
                    {sourceOptions.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                  {formik.touched.source && formik.errors.source && (
                    <div className="text-red-600 text-sm mt-1">
                      {formik.errors.source}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Groups */}
            {renderGroup("directions", "Direction")}
            {renderGroup("headers", "Header")}
            {renderGroup("sections", "Section")}

            {/* Submit */}
            <div className="flex justify-center gap-4">
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => navigate("/admin/exercises")}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 font-semibold disabled:opacity-50"
              >
                {formik.isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Saving..."
                  : isEditMode
                  ? "Update Exercise"
                  : "Submit Exercise"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
