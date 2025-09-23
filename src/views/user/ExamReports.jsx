import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Image,
  Check,
  X,
  MapPin,
  FileText,
  AlertCircle,
} from "lucide-react";
import moment from "moment";
import { useApiService } from "../../hooks/useApiService";

const TestReport = () => {
  const { submissionId } = useParams();
  const [openAccordion, setOpenAccordion] = useState(null);
  const [testReport, setTestReport] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [zoomLevel, setZoomLevel] = useState(1);
  // const [selectedQuestion, setSelectedQuestion] = useState(null);
  const { userServ } = useApiService();

  const [filterType, setFilterType] = useState("all"); // 'all', 'correct', 'wrong'
  const [directionModal, setDirectionModal] = useState({
    isOpen: false,
    content: "",
  });
  const [headerModal, setHeaderModal] = useState({
    isOpen: false,
    content: "",
  });

  // Refs for modal management
  const directionModalRef = useRef(null);
  const headerModalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        directionModalRef.current &&
        !directionModalRef.current.contains(event.target)
      ) {
        setDirectionModal({ isOpen: false, content: "" });
      }
      if (
        headerModalRef.current &&
        !headerModalRef.current.contains(event.target)
      ) {
        setHeaderModal({ isOpen: false, content: "" });
      }
    };

    if (directionModal.isOpen || headerModal.isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [directionModal.isOpen, headerModal.isOpen]);

  const openDirectionModal = (content) => {
    setDirectionModal({ isOpen: true, content });
  };

  const openHeaderModal = (content) => {
    setHeaderModal({ isOpen: true, content });
  };

  const closeDirectionModal = () => {
    setDirectionModal({ isOpen: false, content: "" });
  };

  const closeHeaderModal = () => {
    setHeaderModal({ isOpen: false, content: "" });
  };

  // Function to check if question has direction
  const getQuestionDirection = (questionNumber) => {
    if (!testReport?.submissionDetails?.exerciseId?.directions) return null;

    return testReport.submissionDetails.exerciseId.directions.find(
      (direction) =>
        questionNumber >= direction.start && questionNumber <= direction.end
    );
  };

  // Function to check if question has header
  const getQuestionHeader = (questionNumber) => {
    if (!testReport?.submissionDetails?.exerciseId?.headers) return null;

    return testReport.submissionDetails.exerciseId.headers.find(
      (header) => questionNumber >= header.start && questionNumber <= header.end
    );
  };

  // const openModal = (question) => {
  //   setSelectedQuestion(question);
  //   setIsModalOpen(true);
  //   setZoomLevel(1);
  // };

  // const closeModal = () => {
  //   setIsModalOpen(false);
  //   setSelectedQuestion(null);
  //   setZoomLevel(1);
  // };

  // const zoomIn = () => {
  //   setZoomLevel((prev) => Math.min(prev + 0.2, 2));
  // };

  // const zoomOut = () => {
  //   setZoomLevel((prev) => Math.max(prev - 0.2, 0.6));
  // };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setOpenAccordion(null); // Close any open accordions when filtering
  };
  const toggleAccordion = (questionId) => {
    setOpenAccordion(openAccordion === questionId ? null : questionId);
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await userServ.getExamReport(submissionId);
        setTestReport(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch report", error);
        setLoading(false);
      }
    };

    fetchReport();
  }, [submissionId, userServ]);

  // Filter questions based on selected filter type
  const getFilteredQuestions = () => {
    if (!testReport || !Array.isArray(testReport.questions)) return [];
    switch (filterType) {
      case "correct":
        return testReport.questions.filter((q) => q.isCorrect);
      case "wrong":
        return testReport.questions.filter((q) => !q.isCorrect);
      default:
        return testReport.questions;
    }
  };

  const getFilterTitle = () => {
    switch (filterType) {
      case "correct":
        return "Correct Questions";
      case "wrong":
        return "Wrong Questions";
      default:
        return "All Questions";
    }
  };

  const letterToIndex = (letter) => {
    return letter && letter.length === 3 ? letter.charCodeAt(1) - 65 : -1;
  };

  const getOptionStyle = (question, optionIndex) => {
    const userAnswerIndex = letterToIndex(question.userAnswer);
    const correctAnswerIndex = letterToIndex(question.correctAnswer);

    const isUserAnswer = userAnswerIndex === optionIndex;
    const isCorrectAnswer = correctAnswerIndex === optionIndex;

    if (isCorrectAnswer && isUserAnswer) {
      return "bg-green-100 dark:bg-green-800/40 border-green-500 dark:border-green-400 text-green-800 dark:text-green-200";
    } else if (isCorrectAnswer) {
      return "bg-green-50 dark:bg-green-800/20 border-green-300 dark:border-green-500 text-green-700 dark:text-green-300";
    } else if (isUserAnswer) {
      return "bg-red-100 dark:bg-red-800/40 border-red-500 dark:border-red-400 text-red-800 dark:text-red-200";
    } else {
      return "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-500 text-gray-900 dark:text-gray-100";
    }
  };

  const getOptionIcon = (question, optionIndex) => {
    const optionLetter = `(${String.fromCharCode(65 + optionIndex)})`;

    const isUserAnswer = question.userAnswer === optionLetter;
    const isCorrectAnswer = question.correctAnswer === optionLetter;

    if (isCorrectAnswer) {
      return (
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      );
    } else if (isUserAnswer && !isCorrectAnswer) {
      return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    }

    return null;
  };

  const renderAnswerExplanation = (question) => {
    const hasOptions = question.options && question.options.length > 0;

    return (
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="font-medium font-sans text-gray-900 dark:text-white">
            Correct Answer:
          </span>
          <span className="text-green-700 dark:text-green-300 font-sans">
            {hasOptions
              ? `${question.correctAnswer} ${
                  question.options[letterToIndex(question.correctAnswer)]
                }`
              : question.correctAnswer}
          </span>
        </div>

        {!question.isCorrect && (
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="font-medium font-sans text-gray-900 dark:text-white">
              Your Answer:
            </span>
            <span className="text-red-700 dark:text-red-300 font-sans">
              {hasOptions
                ? `${question.userAnswer} ${
                    question.options[letterToIndex(question.userAnswer)]
                  }`
                : question.userAnswer}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-600 dark:text-gray-400 text-lg font-sans">
        Loading report...
      </div>
    );
  }

  if (!testReport) {
    return (
      <div className="text-center py-20 text-red-600 dark:text-red-400 text-lg font-sans">
        Failed to load report.
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-250">
      {/* Direction Modal */}
      {directionModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div
            ref={directionModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg w-[600px] h-[400px] shadow-2xl border border-gray-300 dark:border-gray-600 overflow-hidden flex flex-col"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {/* Modal Header - Fixed */}
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 border-b border-gray-300 dark:border-gray-600 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded">
                  <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    INSTRUCTIONS
                  </h3>
                </div>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="h-full">
                <div className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded p-4">
                  <pre className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 text-base leading-relaxed font-serif">
                    {directionModal.content}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Modal */}
      {headerModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div
            ref={headerModalRef}
            className="bg-white dark:bg-gray-800 rounded-lg w-[800px] h-[600px] shadow-2xl border border-gray-300 dark:border-gray-600 overflow-hidden flex flex-col"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {/* Modal Header - Fixed */}
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 border-b border-gray-300 dark:border-gray-600 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded">
                  <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    READING PASSAGE
                  </h3>
                </div>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="h-full">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-6">
                  <div className="text-gray-900 dark:text-gray-100 text-base leading-7">
                    <pre className="whitespace-pre-wrap font-serif text-justify">
                      {headerModal.content}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-primary-600 dark:from-gray-800 dark:to-gray-700 text-white rounded-lg p-6 mb-8 shadow-lg dark:shadow-xl">
        <h1 className="text-3xl font-bold font-display mb-4">Test Report</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <div>
              <p className="text-sm opacity-90 font-sans">Student</p>
              <p className="font-semibold font-sans">
                {testReport.submissionDetails?.userId?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <div>
              <p className="text-sm opacity-90 font-sans">Date</p>
              <p className="font-semibold font-sans">
                {moment(testReport.submissionDetails?.endedAt).format(
                  "MMMM Do YYYY, h:mm A"
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <div>
              <p className="text-sm opacity-90 font-sans">Duration</p>
              <p className="font-semibold font-sans">
                {testReport.submissionDetails?.totalTime}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <div>
              <p className="text-sm opacity-90 font-sans">Score</p>
              <p className="font-semibold font-display text-2xl">
                {(
                  (testReport.questions.filter((q) => q.isCorrect).length /
                    testReport.questions.length) *
                  100
                ).toFixed(2)}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-md dark:shadow-xl transition-colors duration-250">
        <h2 className="text-xl font-bold font-display mb-4 text-gray-900 dark:text-white">
          {testReport.submissionDetails.exerciseId?.name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div
            className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
              filterType === "all"
                ? "border-blue-500 dark:border-blue-400 shadow-md bg-blue-50 dark:bg-blue-900/20"
                : "border-transparent hover:border-blue-300 dark:hover:border-blue-500"
            }`}
            onClick={() => handleFilterChange("all")}
          >
            <p className="text-2xl font-bold font-display text-blue-600 dark:text-blue-400">
              {testReport.questions?.length}
            </p>
            <p className="text-gray-600 dark:text-gray-300 font-sans">
              Total Attempted Questions
            </p>
            {filterType === "all" && (
              <div className="mt-2">
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full font-sans">
                  Active Filter
                </span>
              </div>
            )}
          </div>
          <div
            className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
              filterType === "correct"
                ? "border-green-500 dark:border-green-400 shadow-md bg-green-50 dark:bg-green-900/20"
                : "border-transparent hover:border-green-300 dark:hover:border-green-500"
            }`}
            onClick={() => handleFilterChange("correct")}
          >
            <p className="text-2xl font-bold font-display text-green-600 dark:text-green-400">
              {testReport.questions?.filter((q) => q.isCorrect).length}
            </p>
            <p className="text-gray-600 dark:text-gray-300 font-sans">
              Correct Answers
            </p>
            {filterType === "correct" && (
              <div className="mt-2">
                <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full font-sans">
                  Active Filter
                </span>
              </div>
            )}
          </div>
          <div
            className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
              filterType === "wrong"
                ? "border-red-500 dark:border-red-400 shadow-md bg-red-50 dark:bg-red-900/20"
                : "border-transparent hover:border-red-300 dark:hover:border-red-500"
            }`}
            onClick={() => handleFilterChange("wrong")}
          >
            <p className="text-2xl font-bold font-display text-red-600 dark:text-red-400">
              {testReport.questions?.filter((q) => !q.isCorrect).length}
            </p>
            <p className="text-gray-600 dark:text-gray-300 font-sans">
              Wrong Answers
            </p>
            {filterType === "wrong" && (
              <div className="mt-2">
                <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 text-xs rounded-full font-sans">
                  Active Filter
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Status Bar */}
        {filterType !== "all" && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                <span className="text-blue-800 dark:text-blue-200 font-medium font-sans">
                  Showing {getFilteredQuestions()?.length}{" "}
                  {getFilterTitle().toLowerCase()}
                </span>
              </div>
              <button
                onClick={() => handleFilterChange("all")}
                className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 text-sm font-medium font-sans transition-colors"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Questions Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">
          Question Review
        </h2>
        {getFilteredQuestions().map((question) => {
          const questionDirection = getQuestionDirection(question.id);
          const questionHeader = getQuestionHeader(question.id);
          return (
            <div
              key={question.questionId}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-md dark:shadow-xl overflow-hidden transition-colors duration-250"
            >
              {/* Question Header - Clickable for multiline questions */}
              <div
                className={`px-6 py-4 ${
                  question.isCorrect
                    ? "bg-green-50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-700"
                    : "bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-700"
                } ${
                  question.imagePath ||
                  (question.subQuestion &&
                    question.subQuestion.trim() !== "") ||
                  (question.gridOptions && question.gridOptions.length > 0)
                    ? "cursor-pointer hover:opacity-80"
                    : ""
                }`}
                onClick={() =>
                  (question.imagePath ||
                    (question.subQuestion &&
                      question.subQuestion.trim() !== "") ||
                    (question.gridOptions &&
                      question.gridOptions.length > 0)) &&
                  toggleAccordion(question.questionId)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white">
                      Question {question.id}
                    </h3>
                    {/* Direction and Header Icons */}
                    <div className="flex items-center space-x-2">
                      {questionDirection && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDirectionModal(questionDirection.text);
                          }}
                          className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                          title="View Instruction"
                        >
                          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                      )}

                      {questionHeader && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openHeaderModal(questionHeader.text);
                          }}
                          className="p-1 rounded-full bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors"
                          title="View Header"
                        >
                          <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </button>
                      )}
                    </div>
                    {(question.subQuestion?.trim() || question.imagePath) && (
                      <div className="flex items-center space-x-2">
                        <Image className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                          Multiline Question
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {question.isCorrect ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <span className="text-green-700 dark:text-green-300 font-medium font-sans">
                          Correct
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        <span className="text-red-700 dark:text-red-300 font-medium font-sans">
                          Incorrect
                        </span>
                      </>
                    )}
                    {(question.subQuestion?.trim() || question.imagePath) &&
                      (openAccordion === question.questionId ? (
                        <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      ))}
                  </div>
                </div>
                <p className="text-gray-800 dark:text-gray-200 mt-2 font-sans">
                  {/<[a-z][\s\S]*>/i.test(question.question) ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: question.question,
                      }}
                    />
                  ) : (
                    question.question.split("\n").map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))
                  )}
                </p>
              </div>

              {/* Question Content */}
              {!question.subQuestion?.trim() && !question.imagePath ? (
                // Simple Question Layout
                <div className="p-6">
                  {question.optionType === "grid" ? (
                    // Grid Options Display
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                        <span className="text-sm font-medium font-sans text-text-light-secondary dark:text-text-dark-secondary">
                          Grid Options
                        </span>
                      </div>
                      <table className="w-full table-auto border-collapse border border-gray-200 dark:border-dark-purple-600 rounded-lg overflow-hidden">
                        <tbody>
                          {question.gridOptions.map((row, rowIndex) => {
                            const isCorrectRow = row.includes(
                              question.correctAnswer
                            );
                            const isWrongRow = row.includes(
                              question.userAnswer
                            );
                            const isFirstRow = rowIndex === 0;
                            return (
                              <tr
                                key={rowIndex}
                                className={`
                              ${
                                isCorrectRow
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                                  : ""
                              }
                              ${
                                isWrongRow && !isCorrectRow
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                                  : ""
                              }
                              ${
                                isFirstRow &&
                                "bg-blue-100 dark:bg-blue-900/30 font-semibold text-sm"
                              }
                            `}
                              >
                                {row.map((cell, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className="p-2 font-sans text-text-light-primary dark:text-text-dark-primary border-r border-gray-200 dark:border-dark-purple-600 last:border-r-0"
                                  >
                                    {cell}
                                  </td>
                                ))}
                                {(isCorrectRow || isWrongRow) && (
                                  <td className="pl-2">
                                    {isCorrectRow ? (
                                      <Check className="text-green-500 dark:text-green-400 w-5 h-5" />
                                    ) : isWrongRow ? (
                                      <X className="text-red-500 dark:text-red-400 w-5 h-5" />
                                    ) : null}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : question.options && question.options.length > 0 ? (
                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${getOptionStyle(
                            question,
                            optionIndex
                          )}`}
                        >
                          <div className="flex items-center space-x-2 flex-1">
                            <span className="font-medium font-sans">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <span className="font-sans">{option}</span>
                          </div>
                          {getOptionIcon(question, optionIndex)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // When options are in image, show message
                    <div className="text-center py-8 text-text-light-secondary dark:text-text-dark-secondary">
                      <Image className="w-12 h-12 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                      <p className="font-sans">
                        Options are displayed in the question image above
                      </p>
                    </div>
                  )}

                  {/* Answer Explanation */}
                  {renderAnswerExplanation(question)}
                </div>
              ) : (
                // Multiline Question with Accordion
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    openAccordion === question.questionId
                      ? "max-h-none"
                      : "max-h-0"
                  }`}
                >
                  <div className="p-6 border-t border-gray-200 dark:border-dark-purple-700">
                    {/* Main Question */}
                    {question.question && (
                      <div className="mb-4">
                        <p className="font-medium font-sans text-text-light-primary dark:text-text-dark-primary">
                          {/<[a-z][\s\S]*>/i.test(question.question) ? (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: question.question,
                              }}
                            />
                          ) : (
                            question.question.split("\n").map((line, index) => (
                              <React.Fragment key={index}>
                                {line}
                                <br />
                              </React.Fragment>
                            ))
                          )}
                        </p>
                      </div>
                    )}
                    {/* Image Section */}
                    {question.imagePath && (
                      <div className="mb-6">
                        <img
                          src={`${question.imagePath}`}
                          alt="Question illustration"
                          className="w-52 max-w-2xl mx-auto rounded-lg shadow-md"
                        />
                      </div>
                    )}

                    {/* Sub Questions */}
                    {question.subQuestion && (
                      <div className="mb-6">
                        <h4 className="font-semibold font-display text-text-light-primary dark:text-text-dark-primary mb-3">
                          {question.subQuestion
                            .split("\n")
                            .map((line, index) => (
                              <React.Fragment key={index}>
                                {line}
                                <br />
                              </React.Fragment>
                            ))}
                        </h4>
                      </div>
                    )}

                    {question.optionType === "grid" ? (
                      // Grid Options Display
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                          <span className="text-sm font-medium font-sans text-text-light-secondary dark:text-text-dark-secondary">
                            Grid Options
                          </span>
                        </div>
                        <table className="w-full table-auto border-collapse border border-gray-200 dark:border-dark-purple-600 rounded-lg overflow-hidden">
                          <tbody>
                            {question.gridOptions.map((row, rowIndex) => {
                              const isCorrectRow = row.includes(
                                question.correctAnswer
                              );
                              const isWrongRow = row.includes(
                                question.userAnswer
                              );
                              const isFirstRow = rowIndex === 0;
                              return (
                                <tr
                                  key={rowIndex}
                                  className={`
                                ${
                                  isCorrectRow
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                                    : ""
                                }
                                ${
                                  isWrongRow && !isCorrectRow
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                                    : ""
                                }
                                ${
                                  isFirstRow
                                    ? "bg-blue-100 dark:bg-blue-900/30 font-semibold text-sm"
                                    : ""
                                }
                              `}
                                >
                                  {row.map((cell, cellIndex) => (
                                    <td
                                      key={cellIndex}
                                      className={`p-2 font-sans border-r border-gray-200 dark:border-dark-purple-600 last:border-r-0`}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                  {(isCorrectRow || isWrongRow) && (
                                    <td className="pl-2">
                                      {isCorrectRow ? (
                                        <Check className="text-green-500 dark:text-green-400 w-5 h-5" />
                                      ) : isWrongRow ? (
                                        <X className="text-red-500 dark:text-red-400 w-5 h-5" />
                                      ) : null}
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : question.options && question.options.length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${getOptionStyle(
                              question,
                              optionIndex
                            )}`}
                          >
                            <div className="flex items-center space-x-2 flex-1">
                              <span className="font-medium font-sans">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              <span className="font-sans">{option}</span>
                            </div>
                            {getOptionIcon(question, optionIndex)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      // When options are in image
                      <div className="text-center py-6 mb-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                        <Image className="w-10 h-10 mx-auto mb-2 text-blue-500 dark:text-blue-400" />
                        <p className="text-blue-700 dark:text-blue-300 font-medium font-sans">
                          Multiple choice options are shown in the image above
                        </p>
                        <p className="text-blue-600 dark:text-blue-400 text-sm mt-1 font-sans">
                          Please refer to the image for options A, B, C, D
                        </p>
                      </div>
                    )}

                    {/* Answer Explanation */}
                    {renderAnswerExplanation(question)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
        <p className="font-sans">
          Report generated on {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default TestReport;
