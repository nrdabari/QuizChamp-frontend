import React, { useEffect, useState } from "react";

/**
 * ExamPage.jsx - Enhanced design with fixed question palette
 * Features:
 * - Modern, clean UI with better visual hierarchy
 * - Fixed question palette with proper color coding
 * - Improved responsive design
 * - Better accessibility and user experience
 */

export default function ExamPage1() {
  // ──────────────────────────────────────────────────────────  State
  const [stage, setStage] = useState("select"); // "select" | "exam" | "finish"
  const [fileList, setFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [examData, setExamData] = useState([]); // flat list

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);

  const EXAM_DURATION = 30 * 60; // 30 min (in seconds)
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);

  // ─────────────────────────────────────────────────────  Helpers
  const flattenQuestions = (data) => {
    const flat = [];
    data.forEach((entry) => {
      if (entry.direction && Array.isArray(entry.questions)) {
        entry.questions.forEach((q) => flat.push({ ...q, direction: entry.direction,header:entry.header }));
      } else {
        flat.push(entry);
      }
    });
    return flat;
  };

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // ───────────────────────────────────────────────  Fetch file list
  useEffect(() => {
    fetch("http://localhost:5000/api/list-json-files")
      .then((r) => r.json())
      .then((d) => setFileList(d.files || []))
      .catch(() => console.error("Unable to fetch file list"));
  }, []);

  // ─────────────────────────────────────────────────────  Timer tick
  useEffect(() => {
    if (stage !== "exam") return;
    const tick = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(tick);
          setStage("finish");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [stage]);

  // ─────────────────────────────────────────────────────  Start exam
  const startExam = async () => {
    if (!selectedFile) return;
    
    try {
      const res = await fetch(`http://localhost:5000/data/${selectedFile}`);
      const json = await res.json();
      const flat = flattenQuestions(json);
      setExamData(flat);
      setAnswers(Array(flat.length).fill(null));
      setCurrent(0);
      setTimeLeft(EXAM_DURATION);
      setStage("exam");
    } catch (err) {
      alert("Failed to load exam file");
    }
  };

  const recordAnswer = (choice) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = choice;
      return next;
    });
  };

  // Enhanced palette button class with better visual feedback
  const paletteClass = (idx) => {
    const baseClass = "w-10 h-10 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    if (idx === current) {
      return `${baseClass} bg-blue-600 text-white shadow-lg ring-2 ring-blue-400 ring-offset-2`;
    }
    if (answers[idx] !== null) {
      return `${baseClass} bg-green-500 text-white shadow-md hover:bg-green-600`;
    }
    return `${baseClass} bg-gray-200 text-gray-700 hover:bg-gray-300 border-2 border-gray-300`;
  };

  // ───────────────────────────────────────────────────  UI Sections
  const SelectStage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Online Exam</h1>
            <p className="text-gray-600">Select your exam file to begin</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Exam File
              </label>
              <select
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">-- Select an exam file --</option>
                {fileList.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              disabled={!selectedFile}
              onClick={startExam}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Start Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ExamStage = () => {
    const q = examData[current];
    if (!q) return null;

    const timeWarning = timeLeft <= 300; // 5 minutes warning
    const answeredCount = answers.filter(a => a !== null).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Question {current + 1} of {examData.length}
                </h1>
                <p className="text-gray-600 mt-1">
                  {answeredCount} answered • {examData.length - answeredCount} remaining
                </p>
              </div>
              <div className={`text-right ${timeWarning ? 'animate-pulse' : ''}`}>
                <div className={`text-3xl font-mono font-bold ${timeWarning ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-gray-500">Time remaining</p>
              </div>
            </div>
          </div>

          <div className="flex gap-6 pr-84">
            {/* Question Panel */}
            <div className="flex-1 mr-4">
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                {q.direction && (
                  <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-blue-800 font-medium italic">{q.direction}</p>
                    </div>
                  </div>
                )}
                 <div className="mb-8">
                  {q.header && (
                  <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-green-800 font-medium">{q.header}</p>
                    </div>
                  </div>
                )}
</div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 leading-relaxed flex items-start">
                    {q.question}
                  </h2>
                </div>

                <div className="space-y-3">
                  {q.options.map((opt, idx) => {
                    const label = String.fromCharCode(65 + idx);
                    const isSelected = answers[current] === label;
                    
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-400 shadow-md' 
                            : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="option"
                          value={label}
                          checked={isSelected}
                          onChange={() => recordAnswer(label)}
                          className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1 flex  items-start">
                          <span className="font-semibold text-blue-600 mr-2">{label}.</span>
                          <span className="text-gray-900">{opt || <em className="text-gray-500">No option provided</em>}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                    disabled={current === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  
                  {current < examData.length - 1 ? (
                    <button
                      onClick={() => setCurrent((c) => Math.min(examData.length - 1, c + 1))}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                    >
                      Next
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => setStage("finish")}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Finish Exam
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Question Palette - Fixed on Right */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 fixed top-4 right-4 w-80 h-[calc(100vh-2rem)] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Question Palette
                </h3>
                
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 mb-6">
                  {examData.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrent(idx)}
                      className={paletteClass(idx)}
                      title={`Question ${idx + 1}${answers[idx] ? ' (Answered)' : ' (Unanswered)'}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {/* Legend */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-gray-700">Current Question</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-700">Answered</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-200 border-2 border-gray-300 rounded"></div>
                    <span className="text-gray-700">Unanswered</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round((answeredCount / examData.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(answeredCount / examData.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FinishStage = () => {
    const answeredCount = answers.filter(Boolean).length;
    const percentage = Math.round((answeredCount / examData.length) * 100);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-lg w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Completed!</h1>
            <p className="text-gray-600 mb-8">Thank you for taking the exam</p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{answeredCount}</div>
                <div className="text-sm text-blue-700">Questions Answered</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{percentage}%</div>
                <div className="text-sm text-green-700">Completion Rate</div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              You answered {answeredCount} out of {examData.length} questions
            </p>
            
            <button
              onClick={() => {
                setStage("select");
                setAnswers([]);
                setExamData([]);
                setCurrent(0);
                setSelectedFile("");
              }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Take Another Exam
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ───────────────────────────────────────────────  Render root
  return (
    <div>
      {stage === "select" && <SelectStage />}
      {stage === "exam" && <ExamStage />}
      {stage === "finish" && <FinishStage />}
    </div>
  );
}