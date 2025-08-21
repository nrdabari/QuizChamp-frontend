import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import { Edit, Save, Trash2, Upload, X, Search } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { useApiService } from "../../hooks/useApiService";

const EditQuestionList = () => {
  const { exerciseId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [exerciseData, setExerciseData] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  const [imagePreviews, setImagePreviews] = useState({});
  const [imageFiles, setImageFiles] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editingQuestions, setEditingQuestions] = useState(new Set());

  const startBulkEdit = () => setEditMode(true);
  const exitBulkEdit = () => setEditMode(false);

  const toggleIndividualEdit = (questionId) => {
    setEditingQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };
  const navigate = useNavigate();
  const { admin, isAdmin } = useApiService();

  // Filter formik
  const filterFormik = useFormik({
    initialValues: {
      questionId: "",
    },
    onSubmit: (values) => {
      if (!values.questionId.trim()) {
        setFilteredQuestions(questions);
      } else {
        const filtered = questions.filter(
          (q) => q.id.toString() === values.questionId.trim()
        );
        setFilteredQuestions(filtered);
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!exerciseId || !isAdmin) return;

      try {
        // Fetch both in parallel for better performance
        const [questionsResult, exerciseResult] = await Promise.all([
          admin.getQuestionsForEdit(exerciseId),
          admin.getExercise(exerciseId),
        ]);

        setQuestions(questionsResult);
        setExerciseData(exerciseResult);
        setFilteredQuestions(questionsResult); // Initialize filtered questions
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        // setError(error.message || "Failed to fetch data");
      } finally {
        // setIsLoading(false);
      }
    };

    fetchData();
  }, [exerciseId, admin, isAdmin]);

  // Update filtered questions when questions change
  useEffect(() => {
    if (!filterFormik.values.questionId.trim()) {
      setFilteredQuestions(questions);
    } else {
      const filtered = questions.filter(
        (q) => q.id.toString() === filterFormik.values.questionId.trim()
      );
      setFilteredQuestions(filtered);
    }
  }, [questions, filterFormik.values.questionId]);

  const uploadImage = async (questionId, file) => {
    if (!isAdmin) {
      alert("❌ Unauthorized access");
      return;
    }

    if (!file) {
      alert("❌ Please select a file");
      return;
    }

    try {
      await admin.uploadQuestionImage(questionId, file);

      alert("✅ Image uploaded successfully");
    } catch (error) {
      console.error("❌ Upload error:", error);
      alert(
        `❌ Upload failed: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const removeImage = async (questionId) => {
    if (!isAdmin) {
      alert("❌ Unauthorized access");
      return;
    }

    try {
      const result = await admin.removeQuestionImage(questionId);

      alert("🗑️ Image deleted successfully");

      // Update local state
      setImagePreviews((prev) => ({ ...prev, [questionId]: null }));
      setImageFiles((prev) => ({ ...prev, [questionId]: null }));
      setQuestions((prev) =>
        prev.map((q) => (q._id === questionId ? { ...q, imagePath: null } : q))
      );

      console.log("Image removed:", result);
    } catch (error) {
      console.error("❌ Error removing image:", error);
      alert(
        `❌ Failed to delete image: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const QuestionEditor = ({ question }) => {
    const [useRichEditor, setUseRichEditor] = useState(
      () => /<\/?[a-z][\s\S]*>/i.test(question.question) || false
    );
    const [useGrid, setUseGrid] = useState(
      question.optionType === "grid" || false
    );

    const [gridOptions, setGridOptions] = useState(() =>
      question.optionType === "grid" &&
      Array.isArray(question.gridOptions) &&
      question.gridOptions.length > 0
        ? question.gridOptions
        : [
            ["", "(i)", "(ii)", "(iii)", "(iv)"],
            ["(A)", "", "", "", ""],
            ["(B)", "", "", "", ""],
            ["(C)", "", "", "", ""],
            ["(D)", "", "", "", ""],
          ]
    );

    const handleGridChange = (value, rowIndex, colIndex) => {
      const updated = [...gridOptions];
      updated[rowIndex][colIndex] = value;
      setGridOptions(updated);
    };

    const formik = useFormik({
      initialValues: {
        question: question.question,
        option1: question.options[0],
        option2: question.options[1],
        option3: question.options[2],
        option4: question.options[3],
        optionType: question.optionType || "normal",
        gridOptions:
          question.optionType === "grid" &&
          Array.isArray(question.gridOptions) &&
          question.gridOptions.length > 0
            ? question.gridOptions
            : [
                ["", "(i)", "(ii)", "(iii)", "(iv)"],
                ["(A)", "", "", "", ""],
                ["(B)", "", "", "", ""],
                ["(C)", "", "", "", ""],
                ["(D)", "", "", "", ""],
              ],
        subQuestion: question.subQuestion || "",
        correctAnswer: question.correctAnswer,
      },
      onSubmit: async (values) => {
        if (!isAdmin) {
          alert("❌ Unauthorized access");
          return;
        }
        let options = [];
        let gridOptionsToSend = [];
        let optionTypeToSend = useGrid ? "grid" : "normal";

        if (useGrid) {
          // Send gridOptions and leave options as empty array
          gridOptionsToSend = gridOptions;
        } else {
          // Collect normal options
          options = [
            values.option1,
            values.option2,
            values.option3,
            values.option4,
          ];

          // If all options are empty strings, send options as []
          const allEmpty = options.every((opt) => opt.trim() === "");
          if (allEmpty) options = [];
        }
        const questionData = {
          question: values.question,
          options,
          gridOptions: gridOptionsToSend,
          correctAnswer: values.correctAnswer,
          optionType: optionTypeToSend,
          subQuestion: values.subQuestion,
        };
        try {
          const updated = await admin.updateQuestion(
            question._id,
            questionData
          );

          // ✅ Update the questions state with the new updated data
          setQuestions((prev) =>
            prev.map((q) => (q._id === updated._id ? updated : q))
          );

          alert("✅ Question saved successfully");
          console.log("Question updated:", updated);
        } catch (error) {
          console.error("❌ Failed to save question:", error);
          alert(
            `❌ Failed to save: ${
              error.response?.data?.message || error.message
            }`
          );
        }
      },
    });
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setImageFiles((prev) => ({ ...prev, [question._id]: file }));
      setImagePreviews((prev) => ({
        ...prev,
        [question._id]: URL.createObjectURL(file),
      }));
    };

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-purple-200">
        <h3 className="text-xl font-semibold text-purple-800 mb-6">
          Edit Question {question.id}
        </h3>
        <form
          onSubmit={formik.handleSubmit}
          className="p-4 mb-6 bg-white border rounded space-y-6"
        >
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => toggleIndividualEdit(question._id)}
              className="flex items-center px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel Edit
            </button>
          </div>
          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id={`toggleEditor-${question._id}`}
                checked={useRichEditor}
                onChange={() => setUseRichEditor((prev) => !prev)}
                className="mr-2"
              />
              <label
                htmlFor={`toggleEditor-${question._id}`}
                className="text-purple-800 font-medium"
              >
                Use Rich Text Editor
              </label>
            </div>
            <label className="block text-sm font-medium text-purple-700 mb-2">
              Question
            </label>
            {useRichEditor ? (
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                value={formik.values.question}
                onEditorChange={(content) =>
                  formik.setFieldValue("question", content)
                }
                init={{
                  height: 200,
                  menubar: false,
                  plugins:
                    "autolink codesample image link media table lists code",
                  toolbar:
                    "blocks fontfamily fontsize | bold italic underline | align numlist bullist | forecolor backcolor | image  | table  | code",
                  block_formats:
                    "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3",
                  license_key: "gpl",
                }}
              />
            ) : (
              <textarea
                name="question"
                value={formik.values.question}
                onChange={formik.handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  formik.errors.question
                    ? "border-red-500"
                    : "border-purple-300"
                }`}
                rows="3"
                placeholder="Enter your question here..."
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">
              Question Image (Optional)
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-md cursor-pointer hover:bg-purple-200 transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {imageFiles[question._id] && (
                <button
                  type="button"
                  onClick={() =>
                    uploadImage(question._id, imageFiles[question._id])
                  }
                  className="bg-purple-600 text-white px-3 py-1 rounded"
                >
                  Upload
                </button>
              )}

              {imagePreviews[question._id] || question.imagePath ? (
                <div className="relative">
                  <img
                    src={imagePreviews[question._id] || `${question.imagePath}`}
                    alt="Question preview"
                    className="w-20 h-20 object-cover rounded-md border border-purple-300"
                  />
                  {question.imagePath && (
                    <button
                      type="button"
                      onClick={() => removeImage(question._id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">
              Sub Question
            </label>
            <textarea
              name="subQuestion"
              value={formik.values.subQuestion}
              onChange={formik.handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                formik.errors.subQuestion
                  ? "border-red-500"
                  : "border-purple-300"
              }`}
              rows="3"
              placeholder="Enter your sub question here..."
            />
          </div>
          <div className="p-4 max-w-2xl ">
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={useGrid}
                onChange={() => setUseGrid(!useGrid)}
                className="mr-2"
              />
              Use Grid Format for Options
            </label>

            {useGrid ? (
              <div>
                <table className="border border-collapse w-full text-sm">
                  <tbody>
                    {gridOptions.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border px-2 py-1">
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) =>
                                handleGridChange(
                                  e.target.value,
                                  rowIndex,
                                  colIndex
                                )
                              }
                              className="w-full p-1 border border-gray-300 rounded"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <input
                    key={i}
                    name={`option${i}`}
                    value={formik.values[`option${i}`]}
                    onChange={formik.handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      formik.errors[`option${i}`]
                        ? "border-red-500"
                        : "border-purple-300"
                    }`}
                    placeholder={`Enter option ${i}`}
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">
              Correct Answer
            </label>
            <input
              name="correctAnswer"
              value={formik.values.correctAnswer}
              onChange={formik.handleChange}
              placeholder="Correct Answer"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                formik.errors.correctAnswer
                  ? "border-red-500"
                  : "border-purple-300"
              }`}
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Update Question
            </button>
            <button
              type="button"
              onClick={() => {
                formik.resetForm(); // Reset the form to initial values
              }}
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };
  const handleEditChapter = () => {
    navigate(
      `/admin/assignments/${exerciseId}/chapter-assignment?source=${exerciseData?.source}&exerciseName=${exerciseData?.name}`
    );
  };
  return (
    <div className="p-6 bg-purple-50 min-h-screen">
      <h3 className="text-2xl font-bold text-purple-800 mb-4">
        {exerciseData?.source}-{exerciseData?.name}
      </h3>
      {exerciseData?.source === "Previous Years Paper" && (
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={handleEditChapter}
        >
          Assign chapters
        </button>
      )}

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-purple-200">
        <form
          onSubmit={filterFormik.handleSubmit}
          className="flex items-center space-x-4"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-purple-700 mb-2">
              Filter by Question ID
            </label>
            <input
              type="text"
              name="questionId"
              value={filterFormik.values.questionId}
              onChange={filterFormik.handleChange}
              placeholder="Enter question ID to filter..."
              className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors mt-6"
          >
            <Search className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button
            type="button"
            onClick={() => {
              filterFormik.resetForm();
              setFilteredQuestions(questions);
            }}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors mt-6"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </button>
        </form>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-3">
          {filteredQuestions.length > 0 && (
            <button
              onClick={editMode ? exitBulkEdit : startBulkEdit}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                editMode
                  ? "bg-gray-500 text-white hover:bg-gray-600"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              <Edit className="w-4 h-4 mr-2" />
              {editMode ? "Exit Edit Mode" : "Edit All Questions"}
            </button>
          )}
        </div>
        <div className="text-sm text-purple-600">
          Showing {filteredQuestions.length} of {questions.length} questions
        </div>
      </div>

      {editMode
        ? filteredQuestions.map((q) => (
            <QuestionEditor key={q._id} question={q} />
          ))
        : filteredQuestions.map((question, questionIndex) => {
            const isEditing = editingQuestions.has(question._id);

            if (isEditing) {
              return <QuestionEditor key={question._id} question={question} />;
            }

            const getCorrectIndex = (correctAnswer) => {
              // Match (A), (B), (C), (D)
              const match = correctAnswer?.match(/\(([A-D])\)/i);
              if (match) {
                const letter = match[1].toUpperCase();
                return letter.charCodeAt(0) - 65; // 'A' is 65
              }
              return -1;
            };
            const correctIndex = getCorrectIndex(question.correctAnswer);
            return (
              <div
                key={question._id}
                className="bg-white rounded-lg shadow-md p-2 border border-purple-200 mb-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm font-medium mr-3">
                        Q{question.id}
                      </span>
                      <h4>
                        {/<[a-z][\s\S]*>/i.test(question.question) ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: question.question,
                            }}
                          />
                        ) : (
                          question.question
                        )}
                      </h4>
                    </div>
                    {question.imagePath && (
                      <img
                        src={`${question.imagePath}`}
                        alt="Question"
                        className="w-32 h-32 object-cover rounded-md border border-purple-300 mb-2"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => toggleIndividualEdit(question._id)}
                    className="flex items-center px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors ml-4"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                </div>

                {question.optionType === "grid" ? (
                  <table className="w-full table-auto border-collapse">
                    <tbody>
                      {question.gridOptions.map((row, rowIndex) => {
                        const isCorrectRow = row.includes(
                          question.correctAnswer
                        );

                        return (
                          <tr
                            key={rowIndex}
                            className={
                              isCorrectRow ? "bg-green-100 text-green-800" : ""
                            }
                          >
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="p-2 ">
                                {cell}
                              </td>
                            ))}
                            {isCorrectRow && (
                              <td className="text-green-600 font-medium pl-2">
                                (Correct)
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="space-y-2">
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-md border ${
                          index === correctIndex
                            ? "bg-green-50 border-green-300 text-green-800"
                            : "bg-gray-50 border-gray-300 text-gray-700"
                        }`}
                      >
                        <span className="font-medium">
                          {String.fromCharCode(65 + index)}.
                        </span>{" "}
                        {option}
                        {index === correctIndex && (
                          <span className="ml-2 text-green-600 font-medium">
                            (Correct)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
    </div>
  );
};

export default EditQuestionList;
