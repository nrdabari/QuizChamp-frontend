import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { Plus, Trash2 } from "lucide-react";
import { sourceOptions } from "../../helper/helpers";
import * as Yup from "yup";

export default function AddExercise() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const ExerciseSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    class: Yup.number()
      .required("Class is required")
      .min(1, "Class must be at least 1")
      .max(12, "Class must be at most 12"),
    subjectId: Yup.string().required("Subject is required"),
    chapter: Yup.string(),
    source: Yup.string().required("Source is required"),
    directions: Yup.array().of(
      Yup.object().shape({
        text: Yup.string().required("Direction text is required"),
        start: Yup.number().required("Start is required"),
        end: Yup.number().required("End is required"),
      })
    ),
    // headers: Yup.array().of(
    //   Yup.object().shape({
    //     text: Yup.string().required('Header text is required'),
    //     start: Yup.number().required('Start is required'),
    //     end: Yup.number().required('End is required'),
    //   })
    // ),
    sections: Yup.array().of(
      Yup.object().shape({
        text: Yup.string().required("Section text is required"),
        start: Yup.number().required("Start is required"),
        end: Yup.number().required("End is required"),
      })
    ),
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
        const payload = { ...values };

        // Remove empty string fields
        if (!payload.chapterId) delete payload.chapterId;
        if (!payload.subjectId) delete payload.subjectId;

        const res = await fetch("http://localhost:5000/api/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          alert("✅ Exercise saved successfully!");
          resetForm();
        } else {
          alert(`❌ Server error: ${data.message}`);
        }
      } catch (err) {
        console.error(err);
        alert("❌ Network error while saving exercise");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const inputStyles =
    "w-full px-4 py-2 border border-purple-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all";

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
              {...formik.getFieldProps(`${group}[${idx}].text`)}
              className={inputStyles}
            />
            <input
              type="number"
              placeholder="Start"
              {...formik.getFieldProps(`${group}[${idx}].start`)}
              className={inputStyles}
            />
            <input
              type="number"
              placeholder="End"
              {...formik.getFieldProps(`${group}[${idx}].end`)}
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

  useEffect(() => {
    fetch(`http://localhost:5000/api/subjects?classLevel=5`)
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch((err) => console.error("Error fetching subjects", err));

    formik.setFieldValue("subjectId", "");
    formik.setFieldValue("chapterId", "");
    setChapters([]);
  }, []);

  useEffect(() => {
    if (formik.values.subjectId) {
      fetch(
        `http://localhost:5000/api/chapters?subjectId=${formik.values.subjectId}&classLevel=5`
      )
        .then((res) => res.json())
        .then((data) => setChapters(data))
        .catch((err) => console.error("Error fetching chapters", err));
    }
  }, [formik.values.subjectId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Add Exercise</h1>
            <p className="text-purple-100 mt-1">
              Now includes directions, headers & sections
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="p-8 space-y-10">
            {/* Subject & Chapter */}
            <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
              <h2 className="text-2xl font-bold text-purple-800 mb-6">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label>Exercise Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    className="w-full border p-2"
                  />
                </div>
                <div>
                  <label>Subject</label>
                  <select
                    name="subjectId"
                    value={formik.values.subjectId}
                    onChange={formik.handleChange}
                    className="w-full border p-2"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.subjectId && formik.errors.subjectId && (
                    <div className="text-red-600">
                      {formik.errors.subjectId}
                    </div>
                  )}
                </div>

                {/* Chapter Dropdown */}
                <div>
                  <label>Chapter</label>
                  <select
                    name="chapterId"
                    value={formik.values.chapterId}
                    onChange={formik.handleChange}
                    className="w-full border p-2"
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.chapterId && formik.errors.chapterId && (
                    <div className="text-red-600">
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
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg"
                  >
                    <option value="">-- Select Source --</option>
                    {sourceOptions.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dynamic Groups */}
            {renderGroup("directions", "Direction")}
            {renderGroup("headers", "Header")}
            {renderGroup("sections", "Section")}

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                className="bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 font-semibold"
              >
                Submit Exercise
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
