import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import { Edit, Save, Trash2, Upload, X } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";

const EditQuestionList = () => {
  const { exerciseId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [exerciseData, setExerciseData] = useState([]);

  const [imagePreviews, setImagePreviews] = useState({});
  const [imageFiles, setImageFiles] = useState({});
  const [editMode, setEditMode] = useState(false);

  const startBulkEdit = () => setEditMode(true);
  const exitBulkEdit = () => setEditMode(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/questions/edit/${exerciseId}`)
      .then((res) => res.json())
      .then(setQuestions);
    fetch(`http://localhost:5000/api/exercises/${exerciseId}`)
      .then((res) => res.json())
      .then(setExerciseData);
  }, [exerciseId]);

  const uploadImage = async (questionId, file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
      `http://localhost:5000/api/questions/upload/${questionId}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    if (res.ok) {
      alert("✅ Image uploaded");
      return data.question;
    } else {
      alert("❌ Upload failed");
    }
  };

  const removeImage = async (questionId) => {
    const res = await fetch(
      `http://localhost:5000/api/questions/delete-image/${questionId}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      alert("🗑️ Image deleted");
      setImagePreviews((prev) => ({ ...prev, [questionId]: null }));
      setImageFiles((prev) => ({ ...prev, [questionId]: null }));
      setQuestions((prev) =>
        prev.map((q) => (q._id === questionId ? { ...q, imagePath: null } : q))
      );
    } else {
      alert("❌ Failed to delete image");
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
        const correctAnswer = values.correctAnswer;
        const res = await fetch(
          `http://localhost:5000/api/questions/${question._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: values.question,
              options,
              gridOptions: gridOptionsToSend,
              correctAnswer,
              optionType: optionTypeToSend,
              subQuestion: values.subQuestion,
            }),
          }
        );

        if (res.ok) {
          const updated = await res.json();

          // ✅ Update the questions state with the new updated data
          setQuestions((prev) =>
            prev.map((q) => (q._id === updated._id ? updated : q))
          );
          alert("✅ Question saved");
        } else {
          alert("❌ Failed to save");
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
                    src={
                      imagePreviews[question._id] ||
                      `http://localhost:5000${question.imagePath}`
                    }
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

  return (
    <div className="p-6 bg-purple-50 min-h-screen">
      <h3 className="text-2xl font-bold text-purple-800 mb-4">
        {exerciseData?.source}-{exerciseData?.name}
      </h3>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-3">
          {questions.length > 0 && (
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
      </div>

      {editMode
        ? questions.map((q) => <QuestionEditor key={q._id} question={q} />)
        : questions.map((question, questionIndex) => {
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
                        Q{questionIndex + 1}
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
                        src={`http://localhost:5000${question.imagePath}`}
                        alt="Question"
                        className="w-32 h-32 object-cover rounded-md border border-purple-300 mb-2"
                      />
                    )}
                  </div>
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
