import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  ZoomIn,
  X,
} from "lucide-react";
import { useApiService } from "../../hooks/useApiService";

const PracticeFailedQuestions = ({ exerciseId, userId }) => {
  const [questionIds, setQuestionIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  const { userServ } = useApiService();

  // Initialize practice session
  useEffect(() => {
    const initializePractice = async () => {
      if (!exerciseId || !userId) {
        return;
      }
      setLoading(true);
      try {
        const data = await userServ.getFailedQuestionsForPractice(
          exerciseId,
          userId
        );

        if (data.questionIds.length === 0) {
          alert("Great! You have no failed questions to practice.");
          return;
        }

        setQuestionIds(data.questionIds);
        loadQuestion(data.questionIds[0]);
      } catch (error) {
        console.error("❌ Error initializing practice:", error);
        // setError(error.response?.data?.message || error.message || "Failed to initialize practice");
      } finally {
        setLoading(false);
      }
    };

    initializePractice();
  }, [exerciseId, userId, userServ]);

  // Load current question
  const loadQuestion = async (questionId) => {
    try {
      setLoading(true);
      const question = await userServ.getPracticeQuestion(questionId);
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
      const feedback = await userServ.checkPracticeAnswer(
        currentQuestion._id,
        selectedAnswer
      );
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

  const getTextForRange = (index, items = []) =>
    items.find((item) => index >= item.start && index <= item.end)?.text ||
    null;

  const sectionText = getTextForRange(
    currentQuestion.id,
    currentQuestion?.exerciseId?.sections
  );
  const getDirectionForRange = (index, items = []) =>
    items.find((item) => index >= item.start && index <= item.end) || null;

  const direction = getDirectionForRange(
    currentQuestion.id,
    currentQuestion?.exerciseId?.directions
  );
  const directionText = direction?.text;
  const headerText = getTextForRange(
    currentQuestion.id,
    currentQuestion?.exerciseId?.headers
  );

  const openImageZoom = (imagePath, alt) => {
    setZoomedImage({ src: imagePath, alt });
  };

  const closeImageZoom = () => {
    setZoomedImage(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg dark:shadow-dark transition-colors duration-250">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl dark:shadow-dark overflow-hidden border border-gray-100 dark:border-dark-purple-700">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-primary-600 dark:from-dark-purple-600 dark:to-dark-purple-500 text-white p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium font-sans bg-white/20 dark:bg-white/30 px-3 py-1 rounded-full">
              Question {currentIndex + 1} of {questionIds.length}
            </span>
            <span className="text-sm font-medium font-sans bg-green-500 dark:bg-green-600 px-3 py-1 rounded-full">
              Practice Mode
            </span>
          </div>
          <div className="w-full bg-white/20 dark:bg-white/30 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-green-500 dark:from-green-500 dark:to-green-400 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
              style={{
                width: `${((currentIndex + 1) / questionIds.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
        <div className="p-8">
          {/* Section Display */}
          {sectionText && (
            <div className="mb-4 inline-block">
              <span className="inline-flex items-center px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-sm font-medium font-sans rounded-full border border-emerald-200 dark:border-emerald-700">
                <div className="w-1.5 h-1.5 bg-emerald-400 dark:bg-emerald-300 rounded-full mr-2"></div>
                {sectionText}
              </span>
            </div>
          )}

          {/* Direction Section */}
          {(direction?.imagePath || directionText) && (
            <div className="mb-2 p-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-xl shadow-sm">
              <div className="flex items-center mb-1">
                <div className="w-6 h-6 bg-amber-400 dark:bg-amber-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">!</span>
                </div>
                <h3 className="text-base font-semibold font-display text-amber-800 dark:text-amber-200">
                  Instructions
                </h3>
              </div>

              {directionText && (
                <div className="text-text-light-primary dark:text-text-dark-primary mb-2 leading-relaxed font-sans">
                  {directionText.split("\n").map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </div>
              )}

              {direction?.imagePath && (
                <div className="relative group">
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${
                      direction.imagePath
                    }`}
                    alt="Direction"
                    className="w-full h-36 object-contain rounded-lg shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                    onClick={() =>
                      openImageZoom(
                        `${import.meta.env.VITE_BACKEND_URL}${
                          direction.imagePath
                        }`,
                        "Direction"
                      )
                    }
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = "block";
                      }
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black/50 dark:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                  <div
                    style={{ display: "none" }}
                    className="text-text-light-secondary dark:text-text-dark-secondary text-sm mt-2 p-4 bg-gray-100 dark:bg-dark-bg-tertiary rounded-lg font-sans"
                  >
                    📷 Image failed to load
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Header/Passage Section */}
          {headerText && (
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-400 dark:border-blue-500 rounded-r-xl shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-400 dark:bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">📖</span>
                </div>
                <h3 className="text-lg font-semibold font-display text-blue-800 dark:text-blue-200">
                  Passage
                </h3>
              </div>
              <div className="text-text-light-primary dark:text-text-dark-primary leading-relaxed font-sans">
                {headerText.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Question */}
          <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 rounded-xl border border-gray-200 dark:border-dark-purple-700 shadow-sm">
            <h3 className="text-xl font-bold font-display text-text-light-primary dark:text-text-dark-primary mb-4 flex items-center">
              <span className="bg-blue-600 dark:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm mr-3">
                Q{currentIndex + 1}
              </span>
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
              <div className="mb-4 relative group">
                <img
                  src={`${currentQuestion.imagePath}`}
                  alt="Question"
                  className="w-full h-36 object-contain rounded-lg shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() =>
                    openImageZoom(`${currentQuestion.imagePath}`, "Question")
                  }
                />
                <div className="absolute top-2 right-2 bg-black/50 dark:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Sub Question */}
            {currentQuestion.subQuestion && (
              <p className="text-text-light-secondary dark:text-text-dark-secondary mb-4 italic pl-4 border-l-2 border-gray-300 dark:border-dark-purple-600 font-sans">
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
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors font-sans ${
                      selectedAnswer === optionLetter
                        ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30"
                        : "border-gray-300 dark:border-dark-purple-600 hover:border-gray-400 dark:hover:border-dark-purple-500 bg-white dark:bg-dark-bg-tertiary"
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={optionLetter}
                      checked={selectedAnswer === optionLetter}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      className="mr-3 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                      disabled={showFeedback}
                    />
                    <span className="text-text-light-primary dark:text-text-dark-primary font-medium mr-2">
                      {optionLetter}
                    </span>
                    <span className="text-text-light-primary dark:text-text-dark-primary">
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            // Grid options
            <div className="mb-6">
              <div className="grid gap-2 mb-4">
                {Array.isArray(currentQuestion.gridOptions) && (
                  <div className="mt-4 rounded border border-gray-200 dark:border-dark-purple-700 overflow-hidden">
                    {currentQuestion.gridOptions.map((row, rowIndex) => {
                      if (rowIndex === 0) {
                        // Header row, skip radio
                        return (
                          <div
                            key={rowIndex}
                            className="flex font-semibold font-sans bg-gray-100 dark:bg-dark-purple-800 text-text-light-primary dark:text-text-dark-primary p-2"
                          >
                            {row.map((cell, cellIndex) => (
                              <div
                                key={cellIndex}
                                className="flex-1 text-center"
                              >
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
                          className="flex items-center border-t border-gray-200 dark:border-dark-purple-700 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-purple-800 transition-colors"
                        >
                          <input
                            type="radio"
                            name="answer"
                            value={optionLetter}
                            checked={selectedAnswer === optionLetter}
                            onChange={(e) => setSelectedAnswer(e.target.value)}
                            className="mr-1 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                          />
                          {row.map((cell, cellIndex) => (
                            <div
                              key={cellIndex}
                              className="flex-1 text-center text-text-light-primary dark:text-text-dark-primary font-sans"
                            >
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
              <div className="flex justify-left items-center gap-3 mt-4">
                {["A", "B", "C", "D"].map((option) => (
                  <label
                    key={option}
                    className="flex items-center font-medium text-xl space-x-2 text-text-light-primary dark:text-text-dark-primary font-sans"
                  >
                    <input
                      type="radio"
                      name={`option-${currentQuestion._id}`}
                      value={`(${option})`}
                      checked={selectedAnswer === `(${option})`}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      className="form-radio font-medium text-xl text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
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
                  ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700"
                  : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700"
              }`}
            >
              <div className="flex items-center mb-2">
                {feedbackData.isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                )}
                <span
                  className={`font-semibold font-sans ${
                    feedbackData.isCorrect
                      ? "text-green-800 dark:text-green-200"
                      : "text-red-800 dark:text-red-200"
                  }`}
                >
                  {feedbackData.isCorrect ? "Correct!" : "Incorrect"}
                </span>
              </div>

              {!feedbackData.isCorrect && (
                <p className="text-red-700 dark:text-red-300 font-sans">
                  The correct answer is:{" "}
                  <strong>{feedbackData.correctAnswer}</strong>
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-text-light-secondary dark:text-text-dark-secondary font-sans">
              {showFeedback ? "Ready for next question?" : "Select your answer"}
            </div>

            <div className="space-x-3">
              {!showFeedback ? (
                <button
                  onClick={submitAnswer}
                  disabled={!selectedAnswer}
                  className="inline-flex items-center px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium font-sans shadow-md"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="inline-flex items-center px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors font-medium font-sans shadow-md"
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
      </div>
      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-black/80 dark:bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-6xl max-h-full">
            <button
              onClick={closeImageZoom}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 dark:bg-white/30 dark:hover:bg-white/40 text-white p-2 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={zoomedImage.src}
              alt={zoomedImage.alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeFailedQuestions;
