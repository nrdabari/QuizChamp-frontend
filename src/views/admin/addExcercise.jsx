import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { Editor } from "@tinymce/tinymce-react";
import {
  Camera,
  Eye,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Upload,
} from "lucide-react";
import { sourceOptions } from "../../helper/helpers";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { useApiService } from "../../hooks/useApiService";

export default function AddExercise() {
  const { id } = useParams(); // Get exercise ID from URL (undefined for add mode)
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [error, setError] = useState(null);
  const [useRichEditor, setUseRichEditor] = useState({
    directions: false,
    headers: false,
    sections: false,
  });
  const { admin, loading } = useApiService();

  const handleImageUpload = async (file, idx) => {
    if (!file) return;
    try {
      await handleDirectionImageUpload(file, idx);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const removeImage = async (idx) => {
    const updatedDirections = [...formik.values["directions"]];

    updatedDirections[idx].imagePath = "";
    formik.setFieldValue("directions", updatedDirections);
    try {
      await admin.removeDirectionImage(id, idx);

      // Update form state
      const updatedDirections = [...formik.values["directions"]];
      updatedDirections[idx].imagePath = "";
      formik.setFieldValue("directions", updatedDirections);

      alert("✅ Image removed successfully");
    } catch (error) {
      console.error("Error removing image:", error);
      alert("❌ Network error while removing image");
    }
  };

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
      isActive: true,
    },
    validationSchema: ExerciseSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        console.log(values);

        const payload = { ...values };

        // Remove empty fields
        if (!payload.chapterId) delete payload.chapterId;
        if (!payload.subjectId) delete payload.subjectId;

        await admin.createOrUpdateExercise(payload, resetForm);
        const message = values._id
          ? "✅ Exercise updated successfully!"
          : "✅ Exercise created successfully!";
        alert(message);
        if (values._id) {
          navigate("/admin/exercises"); // Navigate back to list
        } else {
          resetForm(); // New entry
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
        const exerciseData = await admin.getExercise(id);

        // Helper function to detect if content contains HTML tags
        const containsHTML = (str) => {
          if (!str) return false;
          return /<[^>]*>/g.test(str);
        };

        // Check if any content contains HTML and auto-enable rich editor
        const directions =
          exerciseData.directions?.length > 0
            ? exerciseData.directions
            : [{ text: "", start: "", end: "", imagePath: "" }];

        const headers =
          exerciseData.headers?.length > 0
            ? exerciseData.headers
            : [{ text: "", start: "", end: "" }];

        const sections =
          exerciseData.sections?.length > 0
            ? exerciseData.sections
            : [{ text: "", start: "", end: "" }];

        // Auto-enable rich editor if content contains HTML
        const hasHTMLDirections = directions.some((item) =>
          containsHTML(item.text)
        );
        const hasHTMLHeaders = headers.some((item) => containsHTML(item.text));
        const hasHTMLSections = sections.some((item) =>
          containsHTML(item.text)
        );

        setUseRichEditor({
          directions: hasHTMLDirections,
          headers: hasHTMLHeaders,
          sections: hasHTMLSections,
        });

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
          directions,
          headers,
          sections,
          isActive: exerciseData.isActive ?? true,
        });
      } catch (err) {
        console.error("Error fetching exercise:", err);
        setError("Failed to load exercise data");
      }
    };

    fetchExercise();
  }, [id, isEditMode]);

  // Load subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await admin.getSubjects(5);
        setSubjects(data);
      } catch (err) {
        console.error("Error fetching subjects", err);
      }
    };

    fetchSubjects();
  }, []);

  // Load chapters when subject changes
  useEffect(() => {
    const fetchChapters = async () => {
      if (formik.values.subjectId) {
        try {
          const data = await admin.getChapters(formik.values.subjectId, 5);
          setChapters(data);
        } catch (err) {
          console.error("Error fetching chapters", err);
        }
      } else {
        setChapters([]);
      }
    };

    fetchChapters();
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

  const handleDirectionImageUpload = async (file, index) => {
    if (!id || !file) return;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("directionIndex", index);

    try {
      const data = await admin.uploadDirectionImage(id, formData);

      const updatedDirections = [...formik.values.directions];
      console.log(data.imagePath);

      updatedDirections[index].imagePath = data.imagePath;
      formik.setFieldValue("directions", updatedDirections);
      alert("✅ Image uploaded successfully");
    } catch (err) {
      console.error("Image upload error:", err);
      alert("❌ Network error during upload");
    }
  };

  const toggleRichEditor = (group) => {
    setUseRichEditor((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const renderTextInput = (group, idx, placeholder) => {
    const fieldPath = `${group}[${idx}].text`;
    const currentValue = formik.values[group][idx]?.text || "";

    return (
      <div className="col-span-full">
        <label className="block text-sm font-medium text-purple-700 mb-2">
          {placeholder}
        </label>
        {useRichEditor[group] ? (
          <Editor
            key={`${group}-${idx}-${isEditMode}`} // Force re-render in edit mode
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            initialValue={currentValue} // Use initialValue instead of value for edit mode
            value={currentValue}
            onEditorChange={(content) =>
              formik.setFieldValue(fieldPath, content)
            }
            init={{
              height: 200,
              menubar: false,
              plugins: "autolink codesample image link media table lists code",
              toolbar:
                "blocks fontfamily fontsize | bold italic underline | align numlist bullist | forecolor backcolor | image | table | code",
              block_formats:
                "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3",
              license_key: "gpl",
              setup: (editor) => {
                // Ensure content is loaded after editor initialization
                editor.on("init", () => {
                  if (currentValue && currentValue !== editor.getContent()) {
                    editor.setContent(currentValue);
                  }
                });
              },
            }}
          />
        ) : (
          <textarea
            placeholder={placeholder}
            value={currentValue}
            onChange={(e) => formik.setFieldValue(fieldPath, e.target.value)}
            className={inputStyles}
            rows="4"
          />
        )}
      </div>
    );
  };

  console.log(formik.values);

  const renderGroup = (group, label) => (
    <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-purple-800">{label}</h3>
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`toggleEditor-${group}`}
            checked={useRichEditor[group]}
            onChange={() => toggleRichEditor(group)}
            className="mr-2 h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
          />
          <label
            htmlFor={`toggleEditor-${group}`}
            className="text-purple-800 font-medium text-sm"
          >
            Use Rich Text Editor
          </label>
        </div>
      </div>

      {formik.values[group].map((item, idx) => (
        <div
          key={`${group}-${idx}-${item._id || "new"}`}
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
            {renderTextInput(group, idx, "Text")}
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

          {group === "directions" && isEditMode && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-purple-700">
                  Direction Image
                </label>
                {formik.values[group][idx]?.imagePath && (
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 text-sm"
                    title="Remove image"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0], idx)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id={`image-upload-${idx}`}
                />
                <label
                  htmlFor={`image-upload-${idx}`}
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-purple-400" />
                    <p className="mb-2 text-sm text-purple-600">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-purple-500">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                </label>
              </div>
              {formik.values[group][idx]?.imagePath && (
                <div className="space-y-3">
                  <div className="relative group">
                    <img
                      src={`${formik.values[group][idx]?.imagePath}`}
                      alt={`Direction ${idx + 1}`}
                      className="w-full max-w-md h-48 object-cover rounded-lg shadow-sm border border-gray-200"
                    />

                    {/* Success Badge */}
                    <div className="absolute top-2 right-2">
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Camera size={12} />
                        Uploaded
                      </div>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between text-sm text-green-700">
                      <span className="flex items-center gap-2">
                        <Camera size={14} />
                        Image uploaded successfully
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center space-x-3 mt-3">
                    <button
                      type="button"
                      onClick={() =>
                        formik.setFieldValue(
                          "isActive",
                          !formik.values.isActive
                        )
                      }
                      className={`flex items-center space-x-2 ${
                        formik.values.isActive
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formik.values.isActive ? (
                        <ToggleRight size={24} />
                      ) : (
                        <ToggleLeft size={24} />
                      )}
                      <span className="text-gray-900 font-medium">
                        {formik.values.isActive ? "Active" : "Inactive"}
                      </span>
                    </button>
                  </div>
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
