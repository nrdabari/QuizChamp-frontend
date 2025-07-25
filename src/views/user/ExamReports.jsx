import React, { useState, useEffect } from "react";
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
} from "lucide-react";

const TestReport = () => {
  const { submissionId } = useParams();
  const [openAccordion, setOpenAccordion] = useState(null);
  const [testReport, setTestReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleAccordion = (questionId) => {
    setOpenAccordion(openAccordion === questionId ? null : questionId);
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/submissions/report/${submissionId}`
        );
        const data = await res.json();
        setTestReport(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch report", error);
        setLoading(false);
      }
    };

    fetchReport();
  }, [submissionId]);

  const letterToIndex = (letter) => {
    return letter && letter.length === 3 ? letter.charCodeAt(1) - 65 : -1;
  };

  const getOptionStyle = (question, optionIndex) => {
    const userAnswerIndex = letterToIndex(question.userAnswer);
    const correctAnswerIndex = letterToIndex(question.correctAnswer);

    const isUserAnswer = userAnswerIndex === optionIndex;
    const isCorrectAnswer = correctAnswerIndex === optionIndex;

    if (isCorrectAnswer && isUserAnswer) {
      return "bg-green-100 border-green-500 text-green-800";
    } else if (isCorrectAnswer) {
      return "bg-green-50 border-green-300 text-green-700";
    } else if (isUserAnswer) {
      return "bg-red-100 border-red-500 text-red-800";
    } else {
      return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const getOptionIcon = (question, optionIndex) => {
    const optionLetter = `(${String.fromCharCode(65 + optionIndex)})`;

    const isUserAnswer = question.userAnswer === optionLetter;
    const isCorrectAnswer = question.correctAnswer === optionLetter;

    if (isCorrectAnswer) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (isUserAnswer && !isCorrectAnswer) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }

    return null;
  };
  const renderAnswerExplanation = (question) => {
    const hasOptions = question.options && question.options.length > 0;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="font-medium text-gray-800">Correct Answer:</span>
          <span className="text-green-700">
            {hasOptions
              ? `${question.correctAnswer} ${
                  question.options[letterToIndex(question.correctAnswer)]
                }`
              : question.correctAnswer}
          </span>
        </div>

        {!question.isCorrect && (
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-gray-800">Your Answer:</span>
            <span className="text-red-700">
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
      <div className="text-center py-20 text-gray-600 text-lg">
        Loading report...
      </div>
    );
  }

  if (!testReport) {
    return (
      <div className="text-center py-20 text-red-600 text-lg">
        Failed to load report.
      </div>
    );
  }

  return (
    <div className="w-full   p-6 bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">Test Report</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <div>
              <p className="text-sm opacity-90">Student</p>
              <p className="font-semibold">
                {testReport.submissionDetails?.userId?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <div>
              <p className="text-sm opacity-90">Date</p>
              <p className="font-semibold">
                {testReport.submissionDetails?.endedAt}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <div>
              <p className="text-sm opacity-90">Duration</p>
              <p className="font-semibold">
                {testReport.submissionDetails?.totalTime}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <div>
              <p className="text-sm opacity-90">Score</p>
              <p className="font-semibold text-2xl">
                {testReport.submissionDetails?.score}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">
          {testReport.submissionDetails?.exerciseId?.source}-{" "}
          {testReport.submissionDetails?.exerciseId?.name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4">
            <p className="text-2xl font-bold text-blue-600">
              {testReport.questions?.length}
            </p>
            <p className="text-gray-600">Total Attempted Questions</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-2xl font-bold text-green-600">
              {testReport.questions?.filter((q) => q.isCorrect).length}
            </p>
            <p className="text-gray-600">Correct Answers</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-2xl font-bold text-red-600">
              {testReport.questions?.filter((q) => !q.isCorrect).length}
            </p>
            <p className="text-gray-600">Wrong Answers</p>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Question Review</h2>

        {testReport.questions.map((question, index) => (
          <div
            key={question.questionId}
            className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
          >
            {/* Question Header - Clickable for multiline questions */}
            <div
              className={`px-6 py-4 ${
                question.isCorrect
                  ? "bg-green-50 border-b border-green-200"
                  : "bg-red-50 border-b border-red-200"
              } ${
                question.imagePath ||
                (question.subQuestion && question.subQuestion.trim() !== "") ||
                (question.gridOptions && question.gridOptions.length > 0)
                  ? "cursor-pointer hover:opacity-80"
                  : ""
              }`}
              onClick={() =>
                (question.imagePath ||
                  (question.subQuestion &&
                    question.subQuestion.trim() !== "") ||
                  (question.gridOptions && question.gridOptions.length > 0)) &&
                toggleAccordion(question.questionId)
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Question {index + 1}
                  </h3>
                  {(question.subQuestion?.trim() || question.imagePath) && (
                    <div className="flex items-center space-x-2">
                      <Image className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        Multiline Question
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {question.isCorrect ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-green-700 font-medium">
                        Correct
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-600" />
                      <span className="text-red-700 font-medium">
                        Incorrect
                      </span>
                    </>
                  )}
                  {(question.subQuestion?.trim() || question.imagePath) &&
                    (openAccordion === question.questionId ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ))}
                </div>
              </div>
              <p className="text-gray-700 mt-2">
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
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-600">
                        Grid Options
                      </span>
                    </div>
                    <table className="w-full table-auto border-collapse">
                      <tbody>
                        {question.gridOptions.map((row, rowIndex) => {
                          const isCorrectRow = row.includes(
                            question.correctAnswer
                          );
                          const isWrongRow = row.includes(question.userAnswer);
                          const isFirstRow = rowIndex === 0;
                          return (
                            <tr
                              key={rowIndex}
                              className={`
            ${isCorrectRow ? "bg-green-100 text-green-800" : ""}
             ${isWrongRow && !isCorrectRow ? "bg-red-100 text-red-800" : ""}
            ${isFirstRow && "bg-blue-100 font-semibold text-sm"}
          `}
                            >
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="p-2 ">
                                  {cell}
                                </td>
                              ))}
                              {(isCorrectRow || isWrongRow) && (
                                <td className="pl-2">
                                  {isCorrectRow ? (
                                    <Check className="text-green-500 w-5 h-5" />
                                  ) : isWrongRow ? (
                                    <X className="text-red-500 w-5 h-5" />
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
                          <span className="font-medium">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span>{option}</span>
                        </div>
                        {getOptionIcon(question, optionIndex)}
                      </div>
                    ))}
                  </div>
                ) : (
                  // When options are in image, show message
                  <div className="text-center py-8 text-gray-600">
                    <Image className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Options are displayed in the question image above</p>
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
                <div className="p-6 border-t border-gray-200">
                  {/* Main Question */}
                  {question.question && (
                    <div className="mb-4">
                      <p className="font-medium text-gray-800">
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
                        src={`http://localhost:5000${question.imagePath}`}
                        alt="Question illustration"
                        className="w-52 max-w-2xl mx-auto rounded-lg shadow-md"
                      />
                    </div>
                  )}

                  {/* Sub Questions */}
                  {question.subQuestion && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        {question.subQuestion.split("\n").map((line, index) => (
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
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600">
                          Grid Options
                        </span>
                      </div>
                      <table className="w-full table-auto border-collapse">
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
            ${isCorrectRow ? "bg-green-100 text-green-800" : ""}
            ${isWrongRow && !isCorrectRow ? "bg-red-100 text-red-800" : ""}
            ${isFirstRow ? "bg-blue-100 font-semibold text-sm" : ""}
          `}
                              >
                                {row.map((cell, cellIndex) => (
                                  <td key={cellIndex} className={`p-2 `}>
                                    {cell}
                                  </td>
                                ))}
                                {(isCorrectRow || isWrongRow) && (
                                  <td className="pl-2">
                                    {isCorrectRow ? (
                                      <Check className="text-green-500 w-5 h-5" />
                                    ) : isWrongRow ? (
                                      <X className="text-red-500 w-5 h-5" />
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
                            <span className="font-medium">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <span>{option}</span>
                          </div>
                          {getOptionIcon(question, optionIndex)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // When options are in image
                    <div className="text-center py-6 mb-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Image className="w-10 h-10 mx-auto mb-2 text-blue-500" />
                      <p className="text-blue-700 font-medium">
                        Multiple choice options are shown in the image above
                      </p>
                      <p className="text-blue-600 text-sm mt-1">
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
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500">
        <p>Report generated on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default TestReport;
