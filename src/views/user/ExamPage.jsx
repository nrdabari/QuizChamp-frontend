import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import { ImageIcon, Pause, Play, X, ZoomIn, ZoomOut } from "lucide-react";

const ExamPage = () => {
  const { exerciseId } = useParams();
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("user");
  const time = searchParams.get("time");
  const submissionId = searchParams.get("submissionId");
  const examTotalTime = Number(searchParams.get("examTotalTime")); // totalTime in minutes

  const [exerciseData, setExerciseData] = useState(null);

  const [userData, setUserData] = useState(null);
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

  const openModal = (question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
    setZoomLevel(1);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setZoomLevel(1);
  };

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  };

  // Utils
  const getTextForRange = (index, items = []) =>
    items.find((item) => index >= item.start && index <= item.end)?.text ||
    null;

  // Format time to HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

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
  }, [isPaused]);
  console.log(loading);

  // Fetch current question + exercise + user
  useEffect(() => {
    const fetchData = async () => {
      // setLoading(true);
      try {
        const [exerciseRes, userRes] = await Promise.all([
          // fetch(
          //   `http://localhost:5000/api/questions/single/${exerciseId}/${currentIndex}`
          // ),
          fetch(`http://localhost:5000/api/exercises/${exerciseId}?`),
          fetch(`http://localhost:5000/api/users/${userId}`),
        ]);

        const [exercise, user] = await Promise.all([
          exerciseRes.json(),
          userRes.json(),
        ]);

        setExerciseData(exercise);
        setUserData(user);
        setSelectedAnswer(""); // Reset selection
      } catch (err) {
        console.error("❌ Error loading question:", err);
      } finally {
        setLoading(false);
      }
    };

    if (exerciseId && userId && currentIndex) {
      fetchData();
    }
  }, [exerciseId, userId]);

  useEffect(() => {
    const fetchQuestionAndAnswer = async () => {
      // setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/questions/exam/${submissionId}/${exerciseId}/${currentIndex}`
        );
        if (!res.ok) throw new Error("Failed to fetch question");

        const data = await res.json();
        setCurrentQuestion(data.question);
        setSelectedAnswer(data.userAnswer || "");

        // Set the entry time for the new question
        setQuestionEntryTime(Date.now());
      } catch (err) {
        console.error("❌ Error loading question:", err);
      } finally {
        setLoading(false);
      }
    };

    if (exerciseId && submissionId && currentIndex >= 1) {
      fetchQuestionAndAnswer();
    }
  }, [currentIndex, exerciseId, submissionId]);

  useEffect(() => {
    const loadAttemptedAnswers = async () => {
      if (!submissionId) return;

      try {
        const res = await fetch(
          `http://localhost:5000/api/submissions/attempted/${submissionId}`
        );
        const data = await res.json();

        // Assume response: { attempts: [ { questionId: 'abc123' }, ... ] }
        const attemptedMap = {};
        data.attempts.forEach((attempt) => {
          attemptedMap[attempt.questionId] = true;
        });
        console.log(attemptedMap);
        setAttemptedQuestions(attemptedMap);
      } catch (err) {
        console.error("❌ Failed to load attempted answers:", err);
      }
    };

    loadAttemptedAnswers();
  }, [submissionId]);

  // Handle option select and save to backend
  const handleAnswerChange = async (value) => {
    setSelectedAnswer(value);
    const timeTakenInSeconds = Math.floor(
      (Date.now() - questionEntryTime) / 1000
    );

    try {
      await fetch(
        `http://localhost:5000/api/submissions/answer/${submissionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: currentQuestion._id,
            userAnswer: value,
            timeTaken: timeTakenInSeconds || 10,
          }),
        }
      );
      setAttemptedQuestions((prev) => ({
        ...prev,
        [currentQuestion._id]: true,
      }));
    } catch (err) {
      console.error("❌ Failed to save answer:", err);
    }
  };

  const handleCompleteTest = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/submissions/complete/${submissionId}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();

      if (res.ok) {
        alert(
          `✅ Report generated!\nScore: ${data.score}/${data.totalQuestions}`
        );
        navigate(`/user/report/${submissionId}`);
        // navigate(`/user/exam`);
      } else {
        alert(`❌ Failed: ${data.message}`);
      }
    } catch (err) {
      alert("❌ Error completing exam");
      console.error(err);
    }
  };

  const resumeExam = async () => {
    setIsPaused(false);
    try {
      await fetch(
        `http://localhost:5000/api/submissions/resume/${submissionId}`,
        {
          method: "PATCH",
        }
      );
    } catch (err) {
      console.error("❌ Failed to resume exam:", err);
    }
  };

  const pauseExam = async () => {
    setIsPaused(true);
    try {
      await fetch(
        `http://localhost:5000/api/submissions/pause/${submissionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeLeft }),
        }
      );
      navigate("/user/exam");
    } catch (err) {
      console.error("❌ Failed to pause exam:", err);
    }
  };

  const goToNext = () => setCurrentIndex((prev) => prev + 1);
  const goToPrevious = () => setCurrentIndex((prev) => Math.max(1, prev - 1));

  // if (loading || !currentQuestion) return <p>Loading...</p>;

  const getDirectionForRange = (index, items = []) =>
    items.find((item) => index >= item.start && index <= item.end) || null;

  const direction = getDirectionForRange(
    currentIndex,
    exerciseData?.directions
  );

  // Extract direction/header/section text
  const directionText = direction?.text;
  const headerText = getTextForRange(currentIndex, exerciseData?.headers);
  const sectionText = getTextForRange(currentIndex, exerciseData?.sections);

  const renderQuestionContent = (question, currentIndex) => {
    console.log(question, currentIndex);

    return (
      <div>
        <div className="bg-white border rounded p-6 shadow-lg">
          <div>
            {/* Question with options or grid */}
            {question?.question ||
            question?.options?.length > 0 ||
            question?.gridOptions?.length > 0 ? (
              <div>
                {question.question && (
                  <h2 className="text-xl font-semibold mb-4">
                    Q{currentIndex}.{" "}
                    {/<\/?[a-z][\s\S]*>/i.test(question?.question) ? (
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
                  </h2>
                )}

                {/* Question Image */}
                {question.imagePath && (
                  <div className="mb-4 text-center">
                    <img
                      src={`http://localhost:5000${question.imagePath}`}
                      alt="Question"
                      className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                      style={{ maxHeight: "500px" }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <div className="hidden bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 font-medium">
                        Image not found
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {question.imagePath}
                      </p>
                    </div>
                  </div>
                )}

                {/* Sub Question */}
                {question.subQuestion && (
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    {question.subQuestion.split("\n").map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </h3>
                )}

                {/* Grid Type Options */}
                {question.optionType === "grid" &&
                Array.isArray(question.gridOptions) &&
                question.gridOptions.length > 0 ? (
                  <div className="mt-4 border rounded overflow-hidden">
                    {question.gridOptions.map((row, rowIndex) => {
                      if (rowIndex === 0) {
                        // Header row
                        return (
                          <div
                            key={rowIndex}
                            className="flex font-semibold bg-gray-100 p-3 border-b"
                          >
                            <div className="w-12"></div>
                            {row.map((cell, cellIndex) => (
                              <div
                                key={cellIndex}
                                className="flex-1 text-center font-medium"
                              >
                                {cell}
                              </div>
                            ))}
                          </div>
                        );
                      }

                      return (
                        <label
                          key={rowIndex}
                          className="flex items-center border-b p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          {row.map((cell, cellIndex) => (
                            <div key={cellIndex} className="flex-1 text-center">
                              {cell}
                            </div>
                          ))}
                        </label>
                      );
                    })}
                  </div>
                ) : // Default Options (A-D) when options array exists
                question.options && question.options.length > 0 ? (
                  <ul className="space-y-3 mt-4">
                    {question.options.map((opt, idx) => {
                      const optionLetter = ["(A)", "(B)", "(C)", "(D)"][idx];
                      return (
                        <li key={idx}>
                          <label className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors">
                            <span className="text-lg">
                              <span className="font-semibold text-blue-600">
                                {optionLetter}
                              </span>{" "}
                              {opt}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  // Fallback A-D options when no specific options provided
                  <div className="flex justify-center items-center gap-6 mt-6">
                    {["A", "B", "C", "D"].map((option) => (
                      <label
                        key={option}
                        className="flex items-center font-medium text-xl space-x-2 p-3 rounded-lg border hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <span className="text-blue-700">Option {option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ) : question?.imagePath ? (
              // Image-only questions
              <div className="flex flex-col items-center space-y-6">
                <div className="mb-4 text-center">
                  <img
                    src={`http://localhost:5000${question.imagePath}`}
                    alt="Question"
                    className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                    style={{ maxHeight: "500px" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                  <div className="hidden bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 font-medium">Image not found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {question.imagePath}
                    </p>
                  </div>
                </div>

                {/* Radio Buttons A to D */}
                <div className="flex justify-center items-center gap-6 mt-6">
                  {["A", "B", "C", "D"].map((option) => (
                    <label
                      key={option}
                      className="flex items-center font-medium text-xl space-x-2 p-3 rounded-lg border hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name={`option-${question._id}`}
                        value={`(${option})`}
                        checked={selectedAnswer === `(${option})`}
                        onChange={() => handleAnswerChange(`(${option})`)}
                        className="form-radio text-blue-600 text-xl"
                      />
                      <span className="text-blue-700">Option {option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic text-center py-8">
                No question data available.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex">
      <div className="w-5/6 p-2 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2">Exam</h1>
        <p>
          <strong>User:</strong> {userData?.name}
        </p>
        <p>
          <strong>Time:</strong>{" "}
          {examTotalTime ? Math.floor(examTotalTime) : Math.floor(time / 60)}{" "}
          mins
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-6"
        >
          Finish Test
        </button>

        <ConfirmModal
          isOpen={showModal}
          title="Generate Report?"
          message="Are you sure you want to complete the test and generate the report?"
          onConfirm={() => {
            setShowModal(false);
            handleCompleteTest();
          }}
          onCancel={() => setShowModal(false)}
        />

        <div className="text-xl font-bold text-red-600">
          <div className="flex flex-col items-center gap-4">
            <div className="text-3xl font-bold text-red-600">
              Time Remaining: {formatTime(timeLeft)}
            </div>

            <button
              onClick={() => {
                if (isPaused) resumeExam();
                else pauseExam();
              }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
            >
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
            </button>
          </div>
        </div>
        {sectionText && (
          <div className="mb-2 p-2 bg-green-50 text-sm border-l-4 border-green-400 rounded">
            {sectionText}
          </div>
        )}

        <div className="mt-6 bg-white border rounded p-4 shadow">
          {direction && (
            <div className="mb-4 p-2 bg-yellow-100 text-sm rounded">
              {directionText && <div className="mb-2">{directionText}</div>}
              {direction.imagePath && (
                <div className="mb-4 text-center">
                  <img
                    src={`http://localhost:5000${direction.imagePath}`}
                    alt="Direction"
                    className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                    style={{ maxHeight: "500px" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = "block";
                      }
                    }}
                  />
                  <div
                    style={{ display: "none" }}
                    className="text-gray-500 text-sm mt-2"
                  >
                    Image failed to load
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => openModal(currentQuestion?.question)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <ZoomIn className="w-4 h-4" />
            <span>Zoom View</span>
          </button>
          {headerText && (
            <div className="mb-2 p-2 bg-blue-50 text-sm border-l-4 border-blue-400 rounded">
              {headerText}
            </div>
          )}
          <div>
            {currentQuestion?.question ||
            currentQuestion?.options?.length > 0 ||
            currentQuestion?.gridOptions?.length > 0 ? (
              <div>
                <h2 className="text-xl font-semibold mb-2">
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
                </h2>
                {/* <p><span style="font-weight: bold; -webkit-text-stroke: 1px black; color: transparent; font-size: 54pt;"> F R A M E </span></p> */}
                {currentQuestion.imagePath && (
                  <img
                    src={`http://localhost:5000${currentQuestion.imagePath}`}
                    alt="Question"
                    className="w-96 mb-4"
                  />
                )}
                {currentQuestion.subQuestion && (
                  <h2 className="text-xl font-semibold mb-2">
                    {currentQuestion.subQuestion
                      .split("\n")
                      .map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                  </h2>
                )}
                {/* <ul className="space-y-2">
                  {(currentQuestion.options || []).map((opt, idx) => {
                    const optionLetter = ["(A)", "(B)", "(C)", "(D)"][idx];
                    return (
                      <li key={idx}>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="answer"
                            value={optionLetter}
                            checked={selectedAnswer === optionLetter}
                            onChange={() => handleAnswerChange(optionLetter)}
                          />
                          <span>
                            {optionLetter} {opt}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul> */}
                {/* Grid Type Options */}
                {currentQuestion.optionType === "grid" &&
                Array.isArray(currentQuestion.gridOptions) ? (
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
                          className="flex items-center border-t p-2 cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="answer"
                            value={optionLetter}
                            checked={selectedAnswer === optionLetter}
                            onChange={() => handleAnswerChange(optionLetter)}
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
                ) : (
                  // Default Options (A-D)
                  <ul className="space-y-2 mt-3">
                    {(currentQuestion.options || []).map((opt, idx) => {
                      const optionLetter = ["(A)", "(B)", "(C)", "(D)"][idx];
                      return (
                        <li key={idx}>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="answer"
                              value={optionLetter}
                              checked={selectedAnswer === optionLetter}
                              onChange={() => handleAnswerChange(optionLetter)}
                            />
                            <span>
                              {optionLetter} {opt}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
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
                            onChange={() => handleAnswerChange(`(${option})`)}
                            className="form-radio font-medium text-xl text-blue-600"
                          />
                          <span>Option {option}</span>
                        </label>
                      ))}
                    </div>
                  )}
              </div>
            ) : currentQuestion?.imagePath ? (
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={`http://localhost:5000${currentQuestion.imagePath}`}
                  alt={`Q${currentIndex}`}
                  className="max-w-full h-auto rounded shadow-md"
                  style={{ maxHeight: "500px" }}
                />

                {/* Radio Buttons A to D */}
                <div className="flex justify-center items-center  gap-3 mt-4">
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
                        onChange={() => handleAnswerChange(`(${option})`)}
                        className="form-radio font-medium text-xl text-blue-600"
                      />
                      <span>Option {option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No question data available.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={goToPrevious}
            // disabled={currentIndex === 1}
            className="bg-purple-200 hover:bg-purple-300 px-4 py-2 rounded"
          >
            Previous
          </button>
          {currentIndex >= exerciseData?.questionCount ? (
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-6"
            >
              Submit Test
            </button>
          ) : (
            <button
              onClick={goToNext}
              disabled={currentIndex >= exerciseData?.questionCount}
              className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded"
            >
              Next
            </button>
          )}
        </div>
      </div>
      {exerciseData && exerciseData?.questionCount > 0 && (
        <div className="w-1/6 p-2 border-l bg-gray-50">
          <h2 className="text-lg font-bold mb-3">Questions</h2>
          <div className="grid grid-cols-4 gap-2">
            {Array.from(
              { length: exerciseData?.questionCount || 0 },
              (_, idx) => {
                const qNum = idx + 1;
                const isCurrent = qNum === currentIndex;
                const isAttempted = attemptedQuestions[qNum];

                return (
                  <button
                    key={qNum}
                    onClick={() => setCurrentIndex(qNum)}
                    className={`w-10 h-10 rounded-full text-sm font-bold border 
              ${isCurrent ? "border-blue-600" : "border-gray-300"} 
              ${isAttempted ? "bg-green-300" : "bg-white"} 
              hover:bg-gray-100`}
                    title={`Go to Question ${qNum}`}
                  >
                    {qNum}
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}
      {isModalOpen && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Question {selectedQuestion.questionIndex} - Zoomed View
                </h2>
                {selectedAnswer && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Selected: {selectedAnswer}
                  </span>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={zoomOut}
                  className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-600 min-w-[60px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={zoomIn}
                  className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  disabled={zoomLevel >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors ml-4"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-auto max-h-[calc(95vh-80px)]">
              <div
                className="p-6 transition-transform duration-200 origin-top-left"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "top left",
                }}
              >
                {renderQuestionContent(currentQuestion, currentIndex)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
