import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from "lucide-react";

const PracticeFailedQuestions = ({ exerciseId, userId }) => {
  const [questionIds, setQuestionIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize practice session
  useEffect(() => {
    const initializePractice = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/practices/exercises/${exerciseId}/failed-questions?userId=${userId}`
        );
        const data = await response.json();

        if (data.questionIds.length === 0) {
          alert("Great! You have no failed questions to practice.");
          return;
        }

        setQuestionIds(data.questionIds);
        loadQuestion(data.questionIds[0]);
      } catch (error) {
        console.error("Error initializing practice:", error);
      }
    };

    initializePractice();
  }, [exerciseId, userId]);

  // Load current question
  const loadQuestion = async (questionId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/practices/questions/${questionId}`
      );
      const question = await response.json();
      setCurrentQuestion(question);
      setSelectedAnswer("");
      setShowFeedback(false);
      setFeedbackData(null);
    } catch (error) {
      console.error("Error loading question:", error);
    } finally {
      setLoading(false);
    }
  };

  // Submit answer and get feedback
  const submitAnswer = async () => {
    if (!selectedAnswer) {
      alert("Please select an answer");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/practices/questions/${currentQuestion._id}/check-answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userAnswer: selectedAnswer }),
        }
      );

      const feedback = await response.json();
      setFeedbackData(feedback);
      setShowFeedback(true);
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentIndex < questionIds.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      loadQuestion(questionIds[nextIndex]);
    } else {
      setIsCompleted(true);
    }
  };

  // Restart practice
  const restartPractice = () => {
    setCurrentIndex(0);
    setIsCompleted(false);
    loadQuestion(questionIds[0]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Practice Complete! 🎉
          </h2>
          <p className="text-gray-600">
            You've completed practicing {questionIds.length} failed questions.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={restartPractice}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <p className="text-gray-600">No questions available for practice.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Question {currentIndex + 1} of {questionIds.length}
          </span>
          <span className="text-sm text-blue-600 font-medium">
            Practice Mode
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / questionIds.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Q{currentIndex}.{" "}
          {/<\/?[a-z][\s\S]*>/i.test(currentQuestion?.question) ? (
            <span
              dangerouslySetInnerHTML={{
                __html: currentQuestion.question,
              }}
            />
          ) : (
            currentQuestion.question.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))
          )}
        </h3>

        {/* Question Image */}
        {currentQuestion.imagePath && (
          <img
            src={`http://localhost:5000${currentQuestion.imagePath}`}
            alt="Question"
            className="mb-4 max-w-full h-auto rounded-lg"
          />
        )}

        {/* Sub Question */}
        {currentQuestion.subQuestion && (
          <p className="text-gray-700 mb-4">
            {currentQuestion.subQuestion.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>
        )}
      </div>

      {/* Options */}
      {currentQuestion.optionType === "normal" ? (
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => {
            const optionLetter = `(${String.fromCharCode(65 + index)})`; // (A), (B), (C), (D)
            return (
              <label
                key={index}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedAnswer === optionLetter
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={optionLetter}
                  checked={selectedAnswer === optionLetter}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  className="mr-3"
                  disabled={showFeedback}
                />
                <span className="text-gray-900 font-medium mr-2">
                  {optionLetter}
                </span>
                <span className="text-gray-900">{option}</span>
              </label>
            );
          })}
        </div>
      ) : (
        // Grid options
        <div className="mb-6">
          <div className="grid gap-2 mb-4">
            {Array.isArray(currentQuestion.gridOptions) && (
              <div className="mt-4  rounded">
                {currentQuestion.gridOptions.map((row, rowIndex) => {
                  if (rowIndex === 0) {
                    // Header row, skip radio
                    return (
                      <div
                        key={rowIndex}
                        className="flex font-semibold bg-gray-100 p-2"
                      >
                        {row.map((cell, cellIndex) => (
                          <div key={cellIndex} className="flex-1 text-center">
                            {cell}
                          </div>
                        ))}
                      </div>
                    );
                  }

                  const optionLetter = ["(A)", "(B)", "(C)", "(D)"][
                    rowIndex - 1
                  ];

                  return (
                    <label
                      key={rowIndex}
                      className="flex items-center border-t p-2 cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={optionLetter}
                        checked={selectedAnswer === optionLetter}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        className="mr-1"
                      />
                      {row.map((cell, cellIndex) => (
                        <div key={cellIndex} className="flex-1 text-center">
                          {cell}
                        </div>
                      ))}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {currentQuestion.gridOptions.length === 0 &&
        currentQuestion.options.length === 0 && (
          <div className="flex justify-left items-center  gap-3 mt-4">
            {["A", "B", "C", "D"].map((option) => (
              <label
                key={option}
                className="flex items-center font-medium text-xl space-x-2"
              >
                <input
                  type="radio"
                  name={`option-${currentQuestion._id}`}
                  value={`(${option})`}
                  checked={selectedAnswer === `(${option})`}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  className="form-radio font-medium text-xl text-blue-600"
                />
                <span>Option {option}</span>
              </label>
            ))}
          </div>
        )}

      {/* Feedback */}
      {showFeedback && feedbackData && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            feedbackData.isCorrect
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-center mb-2">
            {feedbackData.isCorrect ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
            )}
            <span
              className={`font-semibold ${
                feedbackData.isCorrect ? "text-green-800" : "text-red-800"
              }`}
            >
              {feedbackData.isCorrect ? "Correct!" : "Incorrect"}
            </span>
          </div>

          {!feedbackData.isCorrect && (
            <p className="text-red-700">
              The correct answer is:{" "}
              <strong>{feedbackData.correctAnswer}</strong>
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="text-sm text-gray-500">
          {showFeedback ? "Ready for next question?" : "Select your answer"}
        </div>

        <div className="space-x-3">
          {!showFeedback ? (
            <button
              onClick={submitAnswer}
              disabled={!selectedAnswer}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {currentIndex < questionIds.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "Complete Practice"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeFailedQuestions;
