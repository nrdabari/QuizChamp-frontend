import React, { useEffect, useState } from "react";
import {
  GripVertical,
  Plus,
  X,
  Save,
  BookOpen,
  Hash,
  AlertCircle,
} from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { useApiService } from "../../hooks/useApiService";

const ChapterAssignmentForm = () => {
  const { exerciseId } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source");
  const exerciseName = searchParams.get("exerciseName");

  const [assignmentRows, setAssignmentRows] = useState([]);
  const [draggedChapter, setDraggedChapter] = useState(null);
  const [dragOverRow, setDragOverRow] = useState(null);
  const [currentInput, setCurrentInput] = useState("");
  const [inputRowIndex, setInputRowIndex] = useState(null);
  const [availableChapters, setAvailableChapters] = useState([]);
  const [exerciseQuestions, setExerciseQuestions] = useState([]);
  // const [exerciseDetails, setExerciseDetails] = useState({});
  // const [loading, setLoading] = useState(false);
  const { admin, isAdmin } = useApiService();

  // Get chapters that are already assigned to rows
  const assignedChapterIds = assignmentRows
    .map((row) => row.chapterId)
    .filter(Boolean);

  // Get available chapters (not yet assigned)
  const unassignedChapters = availableChapters.filter(
    (chapter) => !assignedChapterIds.includes(chapter._id)
  );

  const fetchChapterAssignmentData = async (exerciseId) => {
    if (!exerciseId || !isAdmin) return;
    //   setLoading(true);
    try {
      const result = await admin.getChapterAssignmentData(exerciseId);

      if (result.success) {
        setAvailableChapters(result.data.chapters);
        setExerciseQuestions(result.data.questions);
        // setExerciseDetails(result.data.exercise);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      // setLoading(false);
    }
  };

  // Use this exerciseId to fetch data on component mount
  useEffect(() => {
    if (exerciseId) {
      fetchChapterAssignmentData(exerciseId);
    }
  }, [exerciseId, admin]);

  // Get all assigned question numbers across all rows
  const getAllAssignedQuestions = () => {
    const questionMap = {};
    assignmentRows.forEach((row, rowIndex) => {
      if (row.questionNumbers && row.questionNumbers.length > 0) {
        row.questionNumbers.forEach((qNum) => {
          if (questionMap[qNum]) {
            questionMap[qNum].push({
              rowIndex,
              chapterName: row.chapterName || "Unassigned Chapter",
            });
          } else {
            questionMap[qNum] = [
              {
                rowIndex,
                chapterName: row.chapterName || "Unassigned Chapter",
              },
            ];
          }
        });
      }
    });
    return questionMap;
  };

  const getDuplicateQuestions = () => {
    const questionMap = getAllAssignedQuestions();
    return Object.keys(questionMap).filter(
      (qNum) => questionMap[qNum].length > 1
    );
  };

  const handleDragStart = (e, chapter) => {
    setDraggedChapter(chapter);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = () => {
    setDraggedChapter(null);
    setDragOverRow(null);
  };

  const handleDragOver = (e, rowIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOverRow(rowIndex);
  };

  const handleDragLeave = () => {
    setDragOverRow(null);
  };

  const handleDrop = (e, rowIndex) => {
    e.preventDefault();
    if (draggedChapter) {
      const newRows = [...assignmentRows];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        chapterId: draggedChapter._id,
        chapterName: draggedChapter.name,
        chapterNumber: draggedChapter.chapterNumber,
      };
      setAssignmentRows(newRows);
    }
    setDragOverRow(null);
    setDraggedChapter(null);
  };

  const addNewRow = () => {
    setAssignmentRows([
      ...assignmentRows,
      {
        id: Date.now(),
        chapterId: null,
        chapterName: "",
        chapterNumber: null,
        questionNumbers: [],
      },
    ]);
  };

  const removeRow = (index) => {
    const newRows = assignmentRows.filter((_, i) => i !== index);
    setAssignmentRows(newRows);
    if (inputRowIndex === index) {
      setInputRowIndex(null);
      setCurrentInput("");
    }
  };

  const removeChapterFromRow = (index) => {
    const newRows = [...assignmentRows];
    newRows[index] = {
      ...newRows[index],
      chapterId: null,
      chapterName: "",
      chapterNumber: null,
    };
    setAssignmentRows(newRows);
  };

  const handleQuestionInputFocus = (index) => {
    setInputRowIndex(index);
    setCurrentInput(""); // Start with empty input for adding new questions
  };

  const handleQuestionInputChange = (value) => {
    setCurrentInput(value);
  };

  const processQuestionInput = () => {
    if (inputRowIndex !== null && currentInput.trim()) {
      const questionNumber = parseInt(currentInput.trim());
      const validQuestionIds = exerciseQuestions.map((q) => q.id);

      // Check if it's a valid number and exists in exercise
      if (!isNaN(questionNumber) && validQuestionIds.includes(questionNumber)) {
        const newRows = [...assignmentRows];
        const existingNumbers = newRows[inputRowIndex].questionNumbers || [];

        // Add only if not already exists in this row
        if (!existingNumbers.includes(questionNumber)) {
          newRows[inputRowIndex] = {
            ...newRows[inputRowIndex],
            questionNumbers: [...existingNumbers, questionNumber],
          };
          setAssignmentRows(newRows);
        }
      }

      // Always clear input after processing
      setCurrentInput("");
    }
  };

  const handleQuestionInputBlur = () => {
    processQuestionInput();
    setInputRowIndex(null);
  };

  const handleQuestionInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      processQuestionInput();
    }
  };

  const removeQuestionFromRow = (rowIndex, questionNum) => {
    const newRows = [...assignmentRows];
    newRows[rowIndex].questionNumbers = newRows[
      rowIndex
    ].questionNumbers.filter((q) => q !== questionNum);
    setAssignmentRows(newRows);
  };

  const handleSave = async () => {
    const duplicates = getDuplicateQuestions();
    if (duplicates.length > 0) {
      alert(`Cannot save: Duplicate questions found: ${duplicates.join(", ")}`);
      return;
    }
    if (!isAdmin) {
      alert("❌ Unauthorized access");
      return;
    }

    const validRows = assignmentRows.filter(
      (row) => row.chapterId && row.questionNumbers.length > 0
    );

    if (validRows.length === 0) {
      alert("Please add at least one chapter assignment with question numbers");
      return;
    }
    const questionIdToMongoId = new Map();
    exerciseQuestions.forEach((question) => {
      questionIdToMongoId.set(question.id, question._id);
    });
    // Transform data for API
    const assignments = validRows.map((row) => ({
      chapterId: row.chapterId,
      questionIds: row.questionNumbers
        .map((questionId) => {
          const mongoId = questionIdToMongoId.get(questionId);
          return mongoId; // Returns MongoDB _id instead of question.id
        })
        .filter(Boolean),
    }));
    try {
      const updated = await admin.assignChaptersToQuestions(
        exerciseId,
        assignments
      );
      alert("✅ Chapters saved successfully!");

      console.log("Saving assignments:", assignments);
      console.log("update assignments:", updated);
    } catch (error) {
      console.error("❌ Error while saving assignments:", error);
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    }

    console.log("Saving assignments:", assignments);
    alert("Assignments saved successfully!");
  };

  const questionMap = getAllAssignedQuestions();
  const duplicateQuestions = getDuplicateQuestions();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="text-blue-600" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Chapter Assignment
            </h1>
            <p className="text-gray-600">
              {source}-{exerciseName}
            </p>
          </div>
        </div>
      </div>

      {/* Available Chapters - Inline Display */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <GripVertical className="text-gray-400" size={20} />
          Available Chapters - Drag to assign
        </h2>

        {unassignedChapters.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>All chapters have been assigned</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {unassignedChapters.map((chapter) => (
              <div
                key={chapter._id}
                draggable
                onDragStart={(e) => handleDragStart(e, chapter)}
                onDragEnd={handleDragEnd}
                className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md hover:scale-105 ${
                  draggedChapter?._id === chapter._id
                    ? "opacity-50 scale-95"
                    : ""
                }`}
              >
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-xs">
                    {chapter.chapterNumber}
                  </span>
                </div>
                <span className="font-medium text-gray-800">
                  {chapter.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Duplicate Questions Warning */}
      {duplicateQuestions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-red-800">
                Duplicate Questions Found
              </h3>
              <p className="text-red-700 text-sm mt-1">
                These questions are assigned to multiple chapters:
                <span className="font-medium">
                  {" "}
                  {duplicateQuestions.join(", ")}
                </span>
              </p>
              <div className="mt-2 text-sm text-red-600">
                {duplicateQuestions.map((qNum) => (
                  <div key={qNum}>
                    Q{qNum}:{" "}
                    {questionMap[qNum]
                      .map((info) => info.chapterName)
                      .join(", ")}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Rows */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Chapter Assignments
          </h2>
          <button
            onClick={addNewRow}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus size={16} />
            Add Row
          </button>
        </div>

        {assignmentRows.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Hash size={24} className="text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">No assignments yet</p>
            <p className="text-sm">
              Click "Add Row" to start creating chapter assignments
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignmentRows.map((row, index) => (
              <div
                key={row.id}
                className={`border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
                  dragOverRow === index
                    ? "border-blue-400 bg-blue-50"
                    : row.chapterId
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 bg-gray-50"
                }`}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="flex items-start gap-4">
                  {/* Row Number */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-sm">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Chapter Assignment Area */}
                    {row.chapterId ? (
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-green-300 rounded-lg">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-xs">
                              {row.chapterNumber}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800">
                            {row.chapterName}
                          </span>
                          <button
                            onClick={() => removeChapterFromRow(index)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <p className="text-gray-500">
                          {dragOverRow === index
                            ? "Drop chapter here"
                            : "Drag a chapter here"}
                        </p>
                      </div>
                    )}

                    {/* Question Numbers */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Question Numbers
                      </label>

                      {/* Question Tags Display */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {row.questionNumbers.map((qNum) => (
                          <span
                            key={qNum}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                              duplicateQuestions.includes(qNum.toString())
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : "bg-blue-100 text-blue-800 border border-blue-300"
                            }`}
                          >
                            Q{qNum}
                            <button
                              onClick={() => removeQuestionFromRow(index, qNum)}
                              className="text-current hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Input Field */}
                      <input
                        type="text"
                        value={inputRowIndex === index ? currentInput : ""}
                        onFocus={() => handleQuestionInputFocus(index)}
                        onChange={(e) =>
                          handleQuestionInputChange(e.target.value)
                        }
                        onBlur={handleQuestionInputBlur}
                        onKeyDown={handleQuestionInputKeyDown}
                        placeholder="Enter single question number and press Enter"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={!row.chapterId}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter one question number at a time • Valid range: 1-
                        {Math.max(...exerciseQuestions.map((q) => q.id))}• Total
                        questions in exercise: {exerciseQuestions.length}
                      </p>
                    </div>
                  </div>

                  {/* Remove Row Button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => removeRow(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save Button */}
        {assignmentRows.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={duplicateQuestions.length > 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                duplicateQuestions.length > 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              <Save size={20} />
              Save All Assignments
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterAssignmentForm;
