import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import { useApiService } from "../../hooks/useApiService";

import fscreen from "fscreen";
import { getTextForRange } from "../../helper/helpers";
import QuestionContent from "../../components/QuestionDisplay";

const ExamPage = () => {
  const { exerciseId, chapterId } = useParams();
  const [searchParams] = useSearchParams();

  // Memoize derived values
  const isChapterTest = useMemo(
    () => chapterId && exerciseId === undefined,
    [chapterId, exerciseId]
  );
  const userId = useMemo(() => searchParams.get("user"), [searchParams]);
  const time = useMemo(() => searchParams.get("time"), [searchParams]);
  const submissionId = useMemo(
    () => searchParams.get("submissionId"),
    [searchParams]
  );
  const totalTime = useMemo(
    () => Number(searchParams.get("examTotalTime")),
    [searchParams]
  );

  // State variables
  const [exerciseData, setExerciseData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const initialTime = time;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isPaused, setIsPaused] = useState(false);
  const [questionEntryTime, setQuestionEntryTime] = useState(Date.now());
  const [attemptedQuestions, setAttemptedQuestions] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [questionIds, setQuestionIds] = useState([]);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { userServ } = useApiService();

  // Memoize style objects
  const imageStyle = useMemo(
    () => ({
      maxHeight: window.innerWidth < 640 ? "150px" : "300px",
    }),
    []
  );

  const directionImageStyle = useMemo(
    () => ({
      maxHeight: window.innerWidth < 640 ? "120px" : "300px",
    }),
    []
  );

  // Memoize total questions count
  const totalQuestions = useMemo(() => {
    return isChapterTest
      ? questionIds.length
      : exerciseData?.questionCount || 50;
  }, [isChapterTest, questionIds.length, exerciseData?.questionCount]);

  // Memoize current progress percentage
  const progressPercentage = useMemo(() => {
    return Math.round((currentIndex / totalQuestions) * 100);
  }, [currentIndex, totalQuestions]);

  // Memoize format time display
  const totalTimeDisplay = useMemo(() => {
    const minutes = totalTime || 60;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }, [totalTime]);

  // Memoized event handlers
  const handleQuestionNavigation = useCallback(
    (qNum, idx) => {
      try {
        if (isChapterTest && questionIds[idx]) {
          setCurrentQuestionId(questionIds[idx]);
        }
        setCurrentIndex(qNum);
      } catch (error) {
        console.log("Question navigation failed:", error);
      }
    },
    [isChapterTest, questionIds]
  );

  const formatTime = useCallback((seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  }, []);

  const toggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        const element = document.documentElement;
        if (element.requestFullscreen) {
          element.requestFullscreen().catch((err) => {
            console.log("Fullscreen request failed:", err);
          });
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch((err) => {
            console.log("Exit fullscreen failed:", err);
          });
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log("Fullscreen API not supported or failed:", error);
    }
  }, []);

  const openModal = useCallback((question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
    setZoomLevel(1);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setZoomLevel(1);
  }, []);

  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions));
  }, [totalQuestions]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(1, prev - 1));
  }, []);

  // Optimized answer change handler with batched state updates
  const handleAnswerChange = useCallback(
    async (value) => {
      const timeTakenInSeconds = Math.floor(
        (Date.now() - questionEntryTime) / 1000
      );

      // Update UI state immediately for better UX
      setSelectedAnswer(value);

      try {
        const answerData = {
          questionId: currentQuestion._id,
          userAnswer: value,
          timeTaken: timeTakenInSeconds,
        };

        await userServ.submitAnswer(submissionId, answerData);

        // Batch state updates based on test type
        if (isChapterTest) {
          setAttemptedQuestions((prev) => ({
            ...prev,
            [currentQuestion._id]: true,
          }));
        } else {
          setAttemptedQuestions((prev) => ({
            ...prev,
            [currentQuestion.id]: true,
          }));
        }
      } catch (error) {
        console.error("Failed to save answer:", error);
        // Revert UI state on error
        setSelectedAnswer("");
        alert(
          `Failed to save answer: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    },
    [questionEntryTime, currentQuestion, userServ, submissionId, isChapterTest]
  );

  const handleCompleteTest = useCallback(async () => {
    if (fscreen.fullscreenElement) {
      await fscreen.exitFullscreen();
    }
    try {
      const data = await userServ.completeExam(submissionId);
      alert(`Report generated!\nScore: ${data.score}/${data.totalQuestions}`);
      navigate(`/user/report/${submissionId}`);
    } catch (error) {
      console.error("Error completing exam:", error);
      alert(
        `Error completing exam: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }, [userServ, submissionId, navigate]);

  const resumeExam = useCallback(async () => {
    setIsPaused(false);
    try {
      await userServ.resumeExam(submissionId);
    } catch (error) {
      console.error("Failed to resume exam:", error);
      alert(
        `Failed to resume exam: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }, [userServ, submissionId]);

  const pauseExam = useCallback(async () => {
    setIsPaused(true);
    if (fscreen.fullscreenElement) {
      await fscreen.exitFullscreen();
    }
    try {
      await userServ.pauseExam(submissionId, timeLeft);
      navigate("/user/exam");
    } catch (error) {
      console.error("Failed to pause exam:", error);
      alert(
        `Failed to pause exam: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }, [userServ, submissionId, timeLeft, navigate]);

  // Auto-exit fullscreen when component unmounts
  useEffect(() => {
    const enterFullscreen = async () => {
      if (fscreen.fullscreenEnabled && !fscreen.fullscreenElement) {
        try {
          await fscreen.requestFullscreen(document.documentElement);
        } catch (error) {
          console.warn("Could not enter fullscreen:", error);
        }
      }
    };

    const timer = setTimeout(enterFullscreen, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fullscreen functionality
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(fscreen.fullscreenElement !== null);
    };

    if (fscreen.fullscreenEnabled) {
      fscreen.addEventListener("fullscreenchange", handleFullscreenChange);

      if (!fscreen.fullscreenElement) {
        fscreen.requestFullscreen(document.documentElement);
      }
    }

    return () => {
      if (fscreen.fullscreenEnabled) {
        fscreen.removeEventListener("fullscreenchange", handleFullscreenChange);
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCompleteTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, handleCompleteTest]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isChapterTest && chapterId) {
          const submissionData = await userServ.getChapterExamReport(
            submissionId
          );
          setQuestionIds(submissionData?.submissionDetails?.questionIds || []);
          setExerciseData({
            name: `${submissionData?.submissionDetails?.chapterName} `,
            source: "Previous Years Paper",
            questionCount:
              submissionData?.submissionDetails?.questionIds?.length || 0,
          });
        } else {
          const exerciseData = await userServ.getExercise(exerciseId);
          setExerciseData(exerciseData);
        }
        setSelectedAnswer("");
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    if ((exerciseId || (isChapterTest && chapterId)) && userId) {
      fetchData();
    }
  }, [exerciseId, chapterId, isChapterTest, userId, userServ, submissionId]);

  // Fetch question data
  useEffect(() => {
    const fetchQuestionAndAnswer = async () => {
      try {
        let data;

        if (isChapterTest && questionIds.length > 0) {
          const questionId = questionIds[currentIndex - 1];
          if (!questionId) {
            throw new Error("Question not found");
          }
          setCurrentQuestionId(questionId);
          data = await userServ.getChapterTestQuestion(
            submissionId,
            questionId
          );
        } else if (!isChapterTest && exerciseId) {
          data = await userServ.getExamQuestion(
            submissionId,
            exerciseId,
            currentIndex
          );
          setCurrentQuestionId(data.question?._id);
        }
        setCurrentQuestion(data.question);
        setSelectedAnswer(data.userAnswer || "");
        setQuestionEntryTime(Date.now());
      } catch (error) {
        console.error("Error loading question:", error);
      } finally {
        setLoading(false);
      }
    };

    if (
      (exerciseId && submissionId && currentIndex >= 1) ||
      (chapterId && submissionId && questionIds.length > 0)
    ) {
      fetchQuestionAndAnswer();
    }
  }, [
    currentIndex,
    exerciseId,
    submissionId,
    chapterId,
    questionIds,
    isChapterTest,
    userServ,
  ]);

  // Load attempted answers
  useEffect(() => {
    const loadAttemptedAnswers = async () => {
      if (!submissionId) return;

      try {
        const data = await userServ.getAttemptedAnswers(submissionId);
        const attemptedMap = {};
        data.attempts.forEach((attempt) => {
          attemptedMap[attempt] = true;
        });
        setAttemptedQuestions(attemptedMap);

        if (exerciseId && data.attempts.length > 0) {
          const maxNum = Math.max(...data.attempts);
          setCurrentIndex(maxNum);
        }
      } catch (error) {
        console.error("Failed to load attempted answers:", error);
      }
    };

    loadAttemptedAnswers();
  }, [submissionId, userServ, exerciseId]);

  // Memoize the question grid for both mobile and desktop
  const questionGridData = useMemo(() => {
    return Array.from({ length: totalQuestions }, (_, idx) => {
      const qNum = idx + 1;

      let isCurrent;
      let isAnswered;

      if (isChapterTest) {
        isCurrent = questionIds[idx] === currentQuestionId;
        const questionId = questionIds[idx];
        isAnswered = attemptedQuestions?.[questionId] || false;
      } else {
        isCurrent = qNum === currentIndex;
        isAnswered = attemptedQuestions?.[qNum] || false;
      }

      return { qNum, idx, isCurrent, isAnswered };
    });
  }, [
    totalQuestions,
    isChapterTest,
    questionIds,
    currentQuestionId,
    currentIndex,
    attemptedQuestions,
  ]);

  // Memoize desktop question grid
  const desktopQuestionGrid = useMemo(() => {
    return questionGridData.map(({ qNum, idx, isCurrent, isAnswered }) => (
      <button
        key={qNum}
        onClick={() => handleQuestionNavigation(qNum, idx)}
        className={`w-8 h-8 rounded-full text-xs font-bold font-sans border-2 transition-all duration-200 flex items-center justify-center
          ${
            isCurrent
              ? "border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-500 text-white ring-2 ring-blue-200 dark:ring-blue-800 shadow-lg"
              : isAnswered
              ? "border-green-500 bg-green-500 text-white hover:bg-green-600"
              : "border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        title={`Question ${qNum}${isCurrent ? " (Current)" : ""}${
          isAnswered ? " (Answered)" : ""
        }`}
      >
        {qNum}
      </button>
    ));
  }, [questionGridData, handleQuestionNavigation]);

  // Memoize mobile question grid
  const mobileQuestionGrid = useMemo(() => {
    return questionGridData.map(({ qNum, idx, isCurrent, isAnswered }) => (
      <button
        key={qNum}
        onClick={() => handleQuestionNavigation(qNum, idx)}
        className={`w-6 h-6 rounded-full text-xs font-bold font-sans border-2 transition-all duration-200 flex items-center justify-center
          ${
            isAnswered && !isCurrent
              ? "bg-green-500 border-green-500 text-white"
              : isCurrent
              ? "bg-blue-600 border-blue-600 text-white"
              : "bg-gray-100 border-gray-300 text-gray-700"
          }`}
        title={`Question ${qNum}${isCurrent ? " (Current)" : ""}${
          isAnswered ? " (Answered)" : ""
        }`}
      >
        {qNum > 99 ? qNum.toString().slice(-2) : qNum}
      </button>
    ));
  }, [questionGridData, handleQuestionNavigation]);

  // Update the directionInfo useMemo to handle both scenarios
  const directionInfo = useMemo(() => {
    const getDirectionForRange = (index, items = []) =>
      items.find((item) => index >= item.start && index <= item.end) || null;

    let direction, directionText, headerText, sectionText;

    if (isChapterTest) {
      // For chapter tests: use question-level directions/headers/sections
      direction = currentQuestion?.exerciseData.directions?.[0] || null;
      directionText =
        direction?.text || currentQuestion?.exerciseData?.directions?.[0]?.text;
      headerText =
        currentQuestion?.exerciseData?.headers?.[0]?.text ||
        currentQuestion?.exerciseData?.headers?.[0]?.text;
      sectionText =
        currentQuestion?.exerciseData?.sections?.[0]?.text ||
        currentQuestion?.exerciseData?.sections?.[0]?.text;
    } else {
      // For exercise tests: use exercise-level directions/headers/sections with range logic
      direction = getDirectionForRange(currentIndex, exerciseData?.directions);
      directionText = direction?.text;
      headerText = getTextForRange(currentIndex, exerciseData?.headers);
      sectionText = getTextForRange(currentIndex, exerciseData?.sections);
    }

    return { direction, directionText, headerText, sectionText };
  }, [
    currentIndex,
    exerciseData?.directions,
    exerciseData?.headers,
    currentQuestion,
    isChapterTest,
  ]);

  const renderQuestionContent = useCallback(
    (question) => {
      return (
        <div className="space-y-3">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 shadow-md transition-colors duration-250">
            <div>
              {question?.question ||
              question?.options?.length > 0 ||
              question?.gridOptions?.length > 0 ? (
                <div className="space-y-3">
                  {question.question && (
                    <h2 className="text-sm sm:text-sm lg:text-sm font-semibold font-display mb-3 text-gray-900 dark:text-white leading-relaxed">
                      <QuestionContent question={question.question} />
                    </h2>
                  )}

                  {question.imagePath && (
                    <div className="mb-3 text-center">
                      <img
                        src={`${question.imagePath}`}
                        alt="Question"
                        className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                        style={imageStyle}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                      <div className="hidden bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-lg p-4">
                        <div className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500 text-lg">
                          📷
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 font-medium font-sans text-xs sm:text-xs">
                          Image not found
                        </p>
                      </div>
                    </div>
                  )}

                  {question.subQuestion && (
                    <h3 className="text-xs sm:text-xs lg:text-xs font-semibold mb-3 text-gray-700 dark:text-gray-200 font-sans leading-relaxed">
                      <QuestionContent question={question.subQuestion} />
                    </h3>
                  )}

                  {question.optionType === "grid" &&
                  Array.isArray(question.gridOptions) &&
                  question.gridOptions.length > 0 ? (
                    <div className="mt-3 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-250">
                      {question.gridOptions.map((row, rowIndex) => {
                        if (rowIndex === 0) {
                          return (
                            <div
                              key={rowIndex}
                              className="flex font-semibold bg-gray-100 dark:bg-gray-700 p-2 sm:p-3 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-sans text-xs sm:text-xs"
                            >
                              <div className="w-8 sm:w-12"></div>
                              {row.map((cell, cellIndex) => (
                                <div
                                  key={cellIndex}
                                  className="flex-1 text-center font-medium"
                                >
                                  <QuestionContent question={cell} />
                                </div>
                              ))}
                            </div>
                          );
                        }

                        const optionLetter = ["A", "B", "C", "D"][rowIndex - 1];
                        return (
                          <label
                            key={rowIndex}
                            className="flex items-center border-b border-gray-200 dark:border-gray-600 p-2 sm:p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white font-sans text-xs sm:text-xs"
                          >
                            <input
                              type="radio"
                              name="gridAnswer"
                              value={`(${optionLetter})`}
                              checked={selectedAnswer === `(${optionLetter})`}
                              onChange={() =>
                                handleAnswerChange(`(${optionLetter})`)
                              }
                              className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2 mr-2 sm:mr-3"
                            />
                            <div
                              className={`w-6 h-6 sm:w-8 sm:h-8 rounded border-2 mr-2 sm:mr-3 flex items-center justify-center text-white font-bold text-xs sm:text-xs
                        ${
                          selectedAnswer === `(${optionLetter})`
                            ? "bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500"
                            : "bg-gray-400 dark:bg-gray-600 border-gray-400 dark:border-gray-600"
                        }`}
                            >
                              {optionLetter}
                            </div>
                            {row.map((cell, cellIndex) => (
                              <div
                                key={cellIndex}
                                className="flex-1 text-center"
                              >
                                <QuestionContent question={cell} />
                              </div>
                            ))}
                          </label>
                        );
                      })}
                    </div>
                  ) : question.options && question.options.length > 0 ? (
                    <ul className="space-y-2 sm:space-y-3 mt-3">
                      {question.options.map((opt, idx) => {
                        const optionLetter = ["(A)", "(B)", "(C)", "(D)"][idx];
                        return (
                          <li key={idx}>
                            <label
                              className={`flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                selectedAnswer === optionLetter
                                  ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 shadow-md"
                                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                            >
                              <input
                                type="radio"
                                name="answer"
                                value={optionLetter}
                                checked={selectedAnswer === optionLetter}
                                onChange={() =>
                                  handleAnswerChange(optionLetter)
                                }
                                className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2 mt-1"
                              />
                              <span className="text-xs sm:text-xs lg:text-xs text-gray-900 dark:text-white font-sans leading-relaxed flex-1">
                                <span className="font-semibold text-blue-600 dark:text-blue-400 mr-1 sm:mr-2">
                                  {optionLetter}
                                </span>
                                <QuestionContent question={opt} />
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="grid grid-cols-2 sm:flex sm:justify-center gap-2 sm:gap-6 mt-4">
                      {["A", "B", "C", "D"].map((option) => {
                        const optionValue = `(${option})`;
                        return (
                          <label
                            key={option}
                            className={`flex items-center justify-center font-medium text-sm sm:text-sm lg:text-sm space-x-1 sm:space-x-2 p-2 sm:p-3 lg:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                              selectedAnswer === optionValue
                                ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md"
                                : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            }`}
                          >
                            <input
                              type="radio"
                              name="answer"
                              value={optionValue}
                              checked={selectedAnswer === optionValue}
                              onChange={() => handleAnswerChange(optionValue)}
                              className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
                            />
                            <span className="font-sans text-xs sm:text-xs">
                              Option {option}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : question?.imagePath ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="mb-3 text-center w-full">
                    <img
                      src={`${question.imagePath}`}
                      alt="Question"
                      className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                      style={imageStyle}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic text-center py-6 sm:py-8 font-sans text-xs sm:text-xs">
                  No question data available.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    },
    [selectedAnswer, handleAnswerChange, imageStyle]
  );

  {
    loading & <div>Loading ....</div>;
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-250 flex flex-col">
      {/* Compact Mobile Header / Full Desktop Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 shadow-sm flex-shrink-0">
        <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-2 lg:py-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 sm:space-y-2 lg:space-y-0 gap-2 sm:gap-4 lg:gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                  <div className="w-1 sm:w-2 h-4 sm:h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                  <h1 className="text-xs sm:text-sm lg:text-sm xl:text-sm font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 truncate">
                    {exerciseData?.source} - {exerciseData?.name}
                  </h1>
                </div>

                <div className="hidden sm:flex flex-wrap items-center gap-2 sm:gap-2">
                  <div className="flex items-center space-x-1 sm:space-x-1 bg-green-100 dark:bg-green-900/30 px-2 sm:px-2 py-1 rounded-full">
                    <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-xs font-medium text-green-700 dark:text-green-300 font-sans">
                      Exam Active
                    </span>
                  </div>
                  <div className="hidden lg:flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                    <svg
                      className="w-4 h-4 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">
                <div className="flex items-center gap-1 sm:gap-3">
                  <div className="bg-white dark:bg-gray-800 rounded sm:rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 sm:p-2 min-w-[60px] sm:min-w-[100px]">
                    <div className="text-center">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 font-sans block">
                        <span className="hidden sm:inline">Remaining</span>
                        <span className="sm:hidden">Left</span>
                      </span>
                      <div className="text-xs sm:text-sm lg:text-sm font-bold font-mono text-red-600 dark:text-red-400">
                        {formatTime(timeLeft)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded sm:rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 sm:p-2 min-w-[60px] sm:min-w-[100px]">
                    <div className="text-center">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 font-sans block">
                        <span className="hidden sm:inline">Total Time</span>
                        <span className="sm:hidden">Total</span>
                      </span>
                      <div className="text-xs sm:text-sm lg:text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
                        {totalTimeDisplay}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    try {
                      if (isPaused) resumeExam();
                      else pauseExam();
                    } catch (error) {
                      console.log("Pause/Resume failed:", error);
                    }
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                  title={isPaused ? "Resume Exam" : "Pause Exam"}
                >
                  {isPaused ? (
                    <svg
                      className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.108v3.784a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded sm:rounded-lg transition-all duration-300 shadow-sm hover:shadow-lg flex items-center justify-center"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-2 sm:mt-3">
              <div className="flex items-center justify-between mb-1 sm:mb-1">
                <span className="text-xs sm:text-xs font-medium text-gray-600 dark:text-gray-400 font-sans">
                  <span className="sm:hidden">
                    {currentIndex}/{totalQuestions}
                  </span>
                  <span className="hidden sm:inline">
                    Progress: {currentIndex} of {totalQuestions} questions
                  </span>
                </span>
                <span className="text-xs sm:text-xs font-medium text-blue-600 dark:text-blue-400 font-sans">
                  {progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row w-full mx-auto flex-1 min-h-0">
        <div className="flex-1 lg:w-3/4 flex flex-col min-h-0">
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 px-3 sm:px-4 py-2 sm:py-3 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-sm sm:text-sm font-semibold font-display text-gray-900 dark:text-white">
                  Q No:{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    {currentIndex} / {totalQuestions}
                  </span>
                </div>
                <div className="text-xs sm:text-xs text-gray-600 dark:text-gray-400 font-sans">
                  Marks: <span className="font-medium">1</span>
                </div>
              </div>
              <div className="text-xs sm:text-xs text-gray-600 dark:text-gray-400 font-sans">
                Total Questions:{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {totalQuestions}
                </span>
              </div>
            </div>
          </div>

          {directionInfo.sectionText && (
            <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400 dark:border-green-500 p-2 sm:p-3 mx-3 sm:mx-4 mt-2 sm:mt-4 rounded-r text-green-800 dark:text-green-200 font-sans text-xs sm:text-xs flex-shrink-0">
              Sections: {directionInfo.sectionText}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {directionInfo.direction && (
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900/30 text-xs sm:text-xs rounded border border-yellow-300 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200 font-sans">
                {directionInfo.directionText && (
                  <div className="mb-2">{directionInfo.directionText}</div>
                )}
                {directionInfo.direction.imagePath && (
                  <div className="mb-2 sm:mb-4 text-center">
                    <img
                      src={`${directionInfo.direction.imagePath}`}
                      alt="Direction"
                      className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                      style={directionImageStyle}
                    />
                  </div>
                )}
              </div>
            )}

            {directionInfo.headerText && (
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/30 text-xs md:text-base border-l-4 border-blue-400 dark:border-blue-500 rounded-r text-blue-800 dark:text-blue-200 font-sans">
                {directionInfo.headerText.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-3 lg:p-4 shadow-md sm:shadow-lg transition-colors duration-250 mb-1 sm:mb-6">
              <button
                onClick={() => {
                  try {
                    openModal(currentQuestion?.question);
                  } catch (error) {
                    console.log("Zoom modal failed:", error);
                  }
                }}
                className="w-auto px-3 sm:px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md sm:rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors flex items-center justify-center space-x-2 shadow-sm sm:shadow-md font-sans mb-3 sm:mb-4 text-xs sm:text-xs"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
                <span>Zoom View</span>
              </button>

              {currentQuestion?.question ||
              currentQuestion?.options?.length > 0 ||
              currentQuestion?.gridOptions?.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-sm sm:text-sm lg:text-sm font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white font-display leading-relaxed">
                    <QuestionContent question={currentQuestion.question} />
                  </h2>

                  {currentQuestion.imagePath && (
                    <img
                      src={`${currentQuestion.imagePath}`}
                      alt="Question"
                      className="w-full max-w-md sm:max-w-lg lg:max-w-xl mb-1 sm:mb-4 rounded-lg shadow-md mx-auto sm:mx-0"
                      style={imageStyle}
                    />
                  )}

                  {currentQuestion.subQuestion && (
                    <h2 className="text-xs sm:text-xs lg:text-xs font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-200 font-sans leading-relaxed">
                      <QuestionContent question={currentQuestion.subQuestion} />
                    </h2>
                  )}
                </div>
              ) : currentQuestion?.imagePath ? (
                <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                  <img
                    src={`${currentQuestion.imagePath}`}
                    alt={`Q${currentIndex}`}
                    className="max-w-full h-auto rounded-lg shadow-md"
                    style={imageStyle}
                  />
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic font-sans text-center py-6 sm:py-8 text-xs sm:text-xs">
                  No question data available.
                </p>
              )}

              {currentQuestion?.optionType === "grid" &&
              Array.isArray(currentQuestion.gridOptions) ? (
                <div className="overflow-x-auto">
                  <div className="min-w-full border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    {currentQuestion.gridOptions.map((row, rowIndex) => {
                      if (rowIndex === 0) {
                        return (
                          <div
                            key={rowIndex}
                            className="flex font-semibold bg-gray-100 dark:bg-gray-700 p-2 sm:p-3 text-gray-900 dark:text-white font-sans min-w-max text-xs sm:text-xs"
                          >
                            {row.map((cell, cellIndex) => (
                              <div
                                key={cellIndex}
                                className="flex-1 text-center min-w-20 sm:min-w-24"
                              >
                                <QuestionContent question={cell} />
                              </div>
                            ))}
                          </div>
                        );
                      }

                      const optionLetter = ["A", "B", "C", "D"][rowIndex - 1];
                      return (
                        <label
                          key={rowIndex}
                          className="flex items-center border-t border-gray-200 dark:border-gray-600 p-2 sm:p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white font-sans min-w-max text-xs sm:text-xs"
                        >
                          <div
                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded border-2 mr-2 sm:mr-3 flex items-center justify-center text-white font-bold text-xs sm:text-xs
                        ${
                          selectedAnswer === `(${optionLetter})`
                            ? "bg-red-500 border-red-500"
                            : "bg-gray-400 border-gray-400"
                        }`}
                          >
                            {optionLetter}
                          </div>
                          <input
                            type="radio"
                            name="answer"
                            value={`(${optionLetter})`}
                            checked={selectedAnswer === `(${optionLetter})`}
                            onChange={() =>
                              handleAnswerChange(`(${optionLetter})`)
                            }
                            className="sr-only"
                          />
                          {row.map((cell, cellIndex) => (
                            <div
                              key={cellIndex}
                              className="flex-1 text-center min-w-20 sm:min-w-24"
                            >
                              <QuestionContent question={cell} />
                            </div>
                          ))}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {(currentQuestion?.options?.length > 0
                    ? currentQuestion.options
                    : ["", "", "", ""]
                  ).map((opt, idx) => {
                    const optionLetter = ["A", "B", "C", "D"][idx];
                    return (
                      <label
                        key={idx}
                        className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-200 dark:border-gray-600"
                      >
                        <div
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded border-2 mt-0.5 sm:mt-1 flex items-center justify-center text-white font-bold text-xs sm:text-xs flex-shrink-0
                      ${
                        selectedAnswer === `(${optionLetter})`
                          ? "bg-red-500 border-red-500"
                          : "bg-gray-400 border-gray-400"
                      }`}
                        >
                          {optionLetter}
                        </div>
                        <input
                          type="radio"
                          name="answer"
                          value={`(${optionLetter})`}
                          checked={selectedAnswer === `(${optionLetter})`}
                          onChange={() =>
                            handleAnswerChange(`(${optionLetter})`)
                          }
                          className="sr-only"
                        />
                        <span className="text-gray-900 dark:text-white font-sans leading-relaxed flex-1 text-xs sm:text-xs">
                          {<QuestionContent question={opt} /> ||
                            `Option ${optionLetter}`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="lg:hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-md mb-4">
              <h3 className="text-sm font-bold mb-3 text-gray-900 dark:text-white font-display">
                Questions: {totalQuestions}
              </h3>
              <div className="grid grid-cols-10 gap-1.5 mb-3">
                {mobileQuestionGrid}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-sans">
                    Not Visited
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-sans">
                    Answered
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-sans">
                    Skipped
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-600 ring-2 ring-blue-200"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-sans">
                    Current
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 p-3 sm:p-4 flex-shrink-0">
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  try {
                    goToPrevious();
                  } catch (error) {
                    console.log("Previous failed:", error);
                  }
                }}
                disabled={currentIndex <= 1}
                className="px-3 sm:px-6 py-2 bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-md sm:rounded-lg transition-colors shadow-sm sm:shadow-md font-sans font-medium disabled:cursor-not-allowed text-xs sm:text-xs"
              >
                ← Prev
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < totalQuestions && (
                  <button
                    onClick={() => {
                      try {
                        setShowModal(true);
                      } catch (error) {
                        console.log("End test failed:", error);
                      }
                    }}
                    className="px-2 sm:px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-md sm:rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors shadow-sm sm:shadow-md font-sans font-medium text-xs sm:text-xs"
                  >
                    End Test
                  </button>
                )}
              </div>

              {currentIndex >= totalQuestions ? (
                <button
                  onClick={() => {
                    try {
                      setShowModal(true);
                    } catch (error) {
                      console.log("Submit failed:", error);
                    }
                  }}
                  className="px-3 sm:px-6 py-2 bg-red-500 dark:bg-red-600 text-white rounded-md sm:rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors shadow-sm sm:shadow-md font-sans font-medium text-xs sm:text-xs"
                >
                  Submit
                </button>
              ) : (
                <button
                  onClick={() => {
                    try {
                      goToNext();
                    } catch (error) {
                      console.log("Next failed:", error);
                    }
                  }}
                  className="px-3 sm:px-6 py-2 bg-green-500 dark:bg-green-600 text-white rounded-md sm:rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors shadow-sm sm:shadow-md font-sans font-medium text-xs sm:text-xs"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/4 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-600 p-4 lg:overflow-y-auto">
          <div className="sticky top-4">
            <h3 className="text-sm font-bold mb-4 text-gray-900 dark:text-white font-display">
              Total Questions: {totalQuestions}
            </h3>

            <div className="grid grid-cols-7 gap-2 mb-6">
              {desktopQuestionGrid}
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                <span className="text-gray-700 dark:text-gray-300 font-sans">
                  Non Visited
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-gray-700 dark:text-gray-300 font-sans">
                  Answered
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-gray-700 dark:text-gray-300 font-sans">
                  Skipped
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-600 ring-2 ring-blue-200"></div>
                <span className="text-gray-700 dark:text-gray-300 font-sans">
                  Current
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Submit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-600">
            <div className="p-4 sm:p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white font-display mb-3 sm:mb-4">
                Submit Test?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-sans mb-4 sm:mb-6 text-xs sm:text-xs">
                Are you sure you want to submit the test? You won't be able to
                change your answers after submission.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    try {
                      setShowModal(false);
                    } catch (error) {
                      console.log("Cancel failed:", error);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-sans text-xs sm:text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    try {
                      setShowModal(false);
                      handleCompleteTest();
                    } catch (error) {
                      console.log("Submit test failed:", error);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors font-sans text-xs sm:text-xs"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {isModalOpen && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <h2 className="text-sm sm:text-sm font-bold text-gray-800 dark:text-white font-display">
                  Question {currentIndex} - Zoomed View
                </h2>
                {selectedAnswer && (
                  <span className="px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs sm:text-xs rounded-full font-sans">
                    Selected: {selectedAnswer}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center sm:justify-end space-x-2">
                <button
                  onClick={() => {
                    try {
                      zoomOut();
                    } catch (error) {
                      console.log("Zoom out failed:", error);
                    }
                  }}
                  className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors text-gray-700 dark:text-gray-200"
                  disabled={(zoomLevel || 1) <= 0.5}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                    />
                  </svg>
                </button>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 min-w-[60px] text-center font-sans">
                  {Math.round((zoomLevel || 1) * 100)}%
                </span>
                <button
                  onClick={() => {
                    try {
                      zoomIn();
                    } catch (error) {
                      console.log("Zoom in failed:", error);
                    }
                  }}
                  className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors text-gray-700 dark:text-gray-200"
                  disabled={(zoomLevel || 1) >= 3}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    try {
                      closeModal();
                    } catch (error) {
                      console.log("Close modal failed:", error);
                    }
                  }}
                  className="p-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-400 rounded-lg transition-colors ml-2 sm:ml-4"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-auto max-h-[calc(95vh-80px)] bg-white dark:bg-gray-800">
              <div
                className="p-3 sm:p-6 transition-transform duration-200 origin-top-left"
                style={{
                  transform: `scale(${zoomLevel || 1})`,
                  transformOrigin: "top left",
                }}
              >
                {renderQuestionContent(currentQuestion)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
