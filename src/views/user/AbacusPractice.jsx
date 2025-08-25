import React, { useEffect, useRef, useState } from "react";
import {
  Timer,
  Calculator,
  RotateCcw,
  Play,
  Trophy,
  Shuffle,
  Plus,
  Minus,
  X,
  Divide,
  Settings,
  Brain,
  Target,
  LayoutIcon,
  Square,
  Box,
  Zap,
} from "lucide-react";

// Enhanced Math Practice App with Abacus Theme - Compact Version
// Mixed digit options: 1+2, 2+1, 1+3, 3+1, 2+3, 3+2 digits
// Auto-focus on answer input when quiz starts
// NEW: Square, Cube, and Square Root operations
// Smart display format - only shows for supported operations
// Compact design for laptop viewing

// ---------------- Helpers ----------------
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const pad2 = (n) => String(n).padStart(2, "0");
const toMMSS = (secs) => `${pad2(Math.floor(secs / 60))}:${pad2(secs % 60)}`;

const getRandomNumber = (digits) => {
  if (digits <= 1) return Math.floor(Math.random() * 10); // 0-9
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateAdd = (digits) => {
  let a, b;
  if (typeof digits === "object") {
    a = getRandomNumber(digits.first);
    b = getRandomNumber(digits.second);
  } else {
    a = getRandomNumber(digits);
    b = getRandomNumber(digits);
  }
  return { q: `${a} + ${b}`, a: a + b };
};

const generateSub = (digits) => {
  let a, b;
  if (typeof digits === "object") {
    a = getRandomNumber(digits.first);
    b = getRandomNumber(digits.second);
  } else {
    a = getRandomNumber(digits);
    b = getRandomNumber(digits);
  }
  if (b > a) [a, b] = [b, a]; // avoid negatives for speed practice
  return { q: `${a} - ${b}`, a: a - b };
};

const generateMul = (digits) => {
  let a, b;
  if (typeof digits === "object") {
    a = getRandomNumber(digits.first);
    b = getRandomNumber(digits.second);
  } else {
    a = getRandomNumber(digits);
    b = getRandomNumber(digits);
  }
  return { q: `${a} × ${b}`, a: a * b };
};

const generateDiv = (digits) => {
  let divisor, quotient;
  if (typeof digits === "object") {
    divisor = clamp(getRandomNumber(digits.second), 1, Infinity);
    quotient = getRandomNumber(Math.max(1, digits.first - 1));
  } else {
    divisor = clamp(getRandomNumber(digits), 1, Infinity);
    quotient = getRandomNumber(Math.max(1, digits - 1));
  }
  const dividend = divisor * quotient;
  return { q: `${dividend} ÷ ${divisor}`, a: quotient };
};

const generateSquare = (digits) => {
  let n;
  if (typeof digits === "object") {
    n = getRandomNumber(digits.first);
  } else {
    // For squares, use smaller numbers to keep results reasonable
    const maxBase = digits <= 1 ? 9 : digits <= 2 ? 15 : 20;
    n = Math.floor(Math.random() * maxBase) + 1;
  }
  return { q: `${n}²`, a: n * n };
};

const generateCube = (digits) => {
  let n;
  if (typeof digits === "object") {
    n = getRandomNumber(digits.first);
  } else {
    // For cubes, use even smaller numbers to keep results reasonable
    const maxBase = digits <= 1 ? 5 : digits <= 2 ? 8 : 10;
    n = Math.floor(Math.random() * maxBase) + 1;
  }
  return { q: `${n}³`, a: n * n * n };
};

const generateSqrt = (digits) => {
  let n;
  if (typeof digits === "object") {
    n = getRandomNumber(digits.first);
  } else {
    // For square roots, generate perfect squares
    const maxBase = digits <= 1 ? 9 : digits <= 2 ? 15 : 20;
    const base = Math.floor(Math.random() * maxBase) + 1;
    n = base * base;
  }
  const root = Math.sqrt(n);
  return { q: `√${n}`, a: root };
};

const generators = {
  add: generateAdd,
  sub: generateSub,
  mul: generateMul,
  div: generateDiv,
  square: generateSquare,
  cube: generateCube,
  sqrt: generateSqrt,
};

const nextQuestion = (op, digits) => {
  if (op === "mix") {
    const ops = ["add", "sub", "mul", "div", "square", "cube", "sqrt"];
    const pick = ops[Math.floor(Math.random() * ops.length)];
    return generators[pick](digits);
  }
  return generators[op](digits);
};

// Helper function to check if operation supports vertical format
const supportsVerticalFormat = (operation) => {
  return ["add", "sub", "mul", "div"].includes(operation);
};

// Digit configuration options
const digitOptions = [
  {
    key: 1,
    label: "1 digit",
    value: 1,
    color: "bg-emerald-500 dark:bg-emerald-400",
  },
  {
    key: 2,
    label: "2 digits",
    value: 2,
    color: "bg-blue-500 dark:bg-blue-400",
  },
  {
    key: 3,
    label: "3 digits",
    value: 3,
    color: "bg-purple-500 dark:bg-purple-400",
  },
  {
    key: "2+1",
    label: "2 + 1 digits",
    value: { first: 2, second: 1 },
    color: "bg-pink-500 dark:bg-pink-400",
  },
  {
    key: "3+1",
    label: "3 + 1 digits",
    value: { first: 3, second: 1 },
    color: "bg-red-500 dark:bg-red-400",
  },
  {
    key: "3+2",
    label: "3 + 2 digits",
    value: { first: 3, second: 2 },
    color: "bg-yellow-500 dark:bg-yellow-400",
  },
];

export default function MathPracticeApp() {
  const [view, setView] = useState("menu"); // menu | quiz | result
  const [operation, setOperation] = useState("mix");
  const [digits, setDigits] = useState(1);
  const [duration, setDuration] = useState(60); // seconds
  const [displayFormat, setDisplayFormat] = useState("horizontal");
  const [timeLeft, setTimeLeft] = useState(0);
  const [q, setQ] = useState({ q: "", a: 0 });
  const [ans, setAns] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [history, setHistory] = useState([]); // {q, correct, user}

  const answerInputRef = useRef(null);

  // Timer loop
  useEffect(() => {
    if (view !== "quiz" || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [view, timeLeft]);

  useEffect(() => {
    if (view === "quiz" && timeLeft === 0) setView("result");
  }, [timeLeft, view]);

  // Auto-focus on answer input when quiz starts
  useEffect(() => {
    if (view === "quiz" && answerInputRef.current) {
      answerInputRef.current.focus();
    }
  }, [view, q.q]);

  const startQuiz = () => {
    setScore(0);
    setAttempts(0);
    setHistory([]);
    setAns("");
    setQ(nextQuestion(operation, digits));
    setTimeLeft(duration);
    setView("quiz");
  };

  const submit = () => {
    if (!q.q) return;
    const user = ans.trim();
    const userNum = Number(user);
    const correct = String(user) !== "" && userNum === q.a;
    setScore((s) => s + (correct ? 1 : 0));
    setAttempts((a) => a + 1);
    setHistory((h) =>
      [{ q: q.q, correct, user, right: q.a }, ...h].slice(0, 50)
    );
    setAns("");
    setQ(nextQuestion(operation, digits));
  };

  const skip = () => {
    setAttempts((a) => a + 1);
    setHistory((h) =>
      [
        { q: q.q, correct: false, user: "", right: q.a, skipped: true },
        ...h,
      ].slice(0, 50)
    );
    setAns("");
    setQ(nextQuestion(operation, digits));
  };

  const accuracy = attempts ? Math.round((score / attempts) * 100) : 0;
  const selectedDigitOption = digitOptions.find((opt) => {
    if (typeof digits === "object") {
      return JSON.stringify(opt.value) === JSON.stringify(digits);
    }
    return opt.value === digits;
  });

  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calculator className="h-5 w-5 text-amber-700 dark:text-purple-400" />
              <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-red-500 dark:bg-blue-500 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-base font-bold text-amber-900 dark:text-purple-100">
                Math Abacus
              </h1>
              <p className="text-xs text-amber-700 dark:text-purple-300">
                Lightning Fast Mental Math
              </p>
            </div>
          </div>
          <button
            onClick={() => setView("menu")}
            className="rounded-lg border border-amber-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur px-2 py-1 text-xs shadow-lg hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-200 text-gray-700 dark:text-gray-200"
          >
            <Settings className="mr-1 inline h-3 w-3" /> Settings
          </button>
        </div>

        {view === "menu" && (
          <div className="space-y-3 rounded-xl border border-amber-200 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90 backdrop-blur p-3 shadow-xl">
            <div className="text-center">
              <Brain className="mx-auto h-6 w-6 text-amber-600 dark:text-purple-400 mb-2" />
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">
                Choose Your Challenge
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Configure your mental math workout
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-4">
              {/* Operation */}
              <div className="rounded-lg border border-amber-100 dark:border-slate-600 bg-gradient-to-b from-white to-amber-50 dark:from-slate-700 dark:to-slate-800 p-2 shadow-sm">
                <div className="mb-2 flex items-center gap-1">
                  <Target className="h-3 w-3 text-amber-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-amber-900 dark:text-purple-100">
                    Operation Type
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setOperation("add")}
                    className={`rounded-lg px-2 py-1.5 font-semibold shadow-sm transition-all duration-200 ${
                      operation === "add"
                        ? "bg-emerald-500 dark:bg-emerald-400 text-white shadow-lg scale-105"
                        : "bg-white dark:bg-slate-600 hover:bg-emerald-50 dark:hover:bg-slate-500 hover:shadow-md text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <Plus className="mx-auto h-3 w-3 mb-0.5" />
                    <div className="text-xs">Add</div>
                  </button>
                  <button
                    onClick={() => setOperation("sub")}
                    className={`rounded-lg px-2 py-1.5 font-semibold shadow-sm transition-all duration-200 ${
                      operation === "sub"
                        ? "bg-blue-500 dark:bg-blue-400 text-white shadow-lg scale-105"
                        : "bg-white dark:bg-slate-600 hover:bg-blue-50 dark:hover:bg-slate-500 hover:shadow-md text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <Minus className="mx-auto h-3 w-3 mb-0.5" />
                    <div className="text-xs">Sub</div>
                  </button>
                  <button
                    onClick={() => setOperation("mul")}
                    className={`rounded-lg px-2 py-1.5 font-semibold shadow-sm transition-all duration-200 ${
                      operation === "mul"
                        ? "bg-purple-500 dark:bg-purple-400 text-white shadow-lg scale-105"
                        : "bg-white dark:bg-slate-600 hover:bg-purple-50 dark:hover:bg-slate-500 hover:shadow-md text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <X className="mx-auto h-3 w-3 mb-0.5" />
                    <div className="text-xs">Mul</div>
                  </button>
                  <button
                    onClick={() => setOperation("div")}
                    className={`rounded-lg px-2 py-1.5 font-semibold shadow-sm transition-all duration-200 ${
                      operation === "div"
                        ? "bg-orange-500 dark:bg-orange-400 text-white shadow-lg scale-105"
                        : "bg-white dark:bg-slate-600 hover:bg-orange-50 dark:hover:bg-slate-500 hover:shadow-md text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <Divide className="mx-auto h-3 w-3 mb-0.5" />
                    <div className="text-xs">Div</div>
                  </button>
                  <button
                    onClick={() => setOperation("square")}
                    className={`rounded-lg px-2 py-1.5 font-semibold shadow-sm transition-all duration-200 ${
                      operation === "square"
                        ? "bg-cyan-500 dark:bg-cyan-400 text-white shadow-lg scale-105"
                        : "bg-white dark:bg-slate-600 hover:bg-cyan-50 dark:hover:bg-slate-500 hover:shadow-md text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <Square className="mx-auto h-3 w-3 mb-0.5" />
                    <div className="text-xs">x²</div>
                  </button>
                  <button
                    onClick={() => setOperation("cube")}
                    className={`rounded-lg px-2 py-1.5 font-semibold shadow-sm transition-all duration-200 ${
                      operation === "cube"
                        ? "bg-teal-500 dark:bg-teal-400 text-white shadow-lg scale-105"
                        : "bg-white dark:bg-slate-600 hover:bg-teal-50 dark:hover:bg-slate-500 hover:shadow-md text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <Box className="mx-auto h-3 w-3 mb-0.5" />
                    <div className="text-xs">x³</div>
                  </button>
                  <button
                    onClick={() => setOperation("sqrt")}
                    className={`rounded-lg px-2 py-1.5 font-semibold shadow-sm transition-all duration-200 ${
                      operation === "sqrt"
                        ? "bg-rose-500 dark:bg-rose-400 text-white shadow-lg scale-105"
                        : "bg-white dark:bg-slate-600 hover:bg-rose-50 dark:hover:bg-slate-500 hover:shadow-md text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <Zap className="mx-auto h-3 w-3 mb-0.5" />
                    <div className="text-xs">√x</div>
                  </button>
                  <button
                    onClick={() => setOperation("mix")}
                    className={`col-span-2 rounded-lg px-2 py-1.5 font-semibold shadow-sm transition-all duration-200 ${
                      operation === "mix"
                        ? "bg-gradient-to-r from-pink-500 to-violet-500 dark:from-pink-400 dark:to-violet-400 text-white shadow-lg scale-105"
                        : "bg-white dark:bg-slate-600 hover:bg-gradient-to-r hover:from-pink-50 hover:to-violet-50 dark:hover:bg-slate-500 hover:shadow-md text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <Shuffle className="mx-auto h-3 w-3 mb-0.5" />
                    <div className="text-xs">Mix</div>
                  </button>
                </div>
              </div>

              {/* Display Format - Only show for operations that support it */}
              {supportsVerticalFormat(operation) && (
                <div className="rounded-lg border border-amber-100 dark:border-slate-600 bg-gradient-to-b from-white to-amber-50 dark:from-slate-700 dark:to-slate-800 p-2 shadow-sm">
                  <div className="mb-1 flex items-center gap-1">
                    <LayoutIcon className="h-3 w-3 text-amber-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-amber-900 dark:text-purple-100">
                      Display Format
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    <button
                      onClick={() => setDisplayFormat("horizontal")}
                      className={`rounded-lg px-2 py-1 font-semibold shadow-sm transition-all duration-200 ${
                        displayFormat === "horizontal"
                          ? "bg-teal-500 dark:bg-teal-400 text-white shadow-lg scale-105"
                          : "bg-white dark:bg-slate-600 hover:bg-teal-50 dark:hover:bg-slate-500 hover:shadow-md text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      <div className="text-xs mb-0.5">12 + 34</div>
                      <div className="text-xs opacity-75">Horizontal</div>
                    </button>
                    <button
                      onClick={() => setDisplayFormat("vertical")}
                      className={`rounded-lg px-2 py-1 font-semibold shadow-sm transition-all duration-200 ${
                        displayFormat === "vertical"
                          ? "bg-indigo-500 dark:bg-indigo-400 text-white shadow-lg scale-105"
                          : "bg-white dark:bg-slate-600 hover:bg-indigo-50 dark:hover:bg-slate-500 hover:shadow-md text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      <div className="text-xs mb-0.5 font-mono leading-tight">
                        <div className="text-right">12</div>
                        <div className="text-right">+34</div>
                        <div className="border-t border-current text-right">
                          ___
                        </div>
                      </div>
                      <div className="text-xs opacity-75">Vertical</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Digits */}
              <div className="rounded-lg border border-amber-100 dark:border-slate-600 bg-gradient-to-b from-white to-amber-50 dark:from-slate-700 dark:to-slate-800 p-2 shadow-sm">
                <div className="mb-2 flex items-center gap-1">
                  <Calculator className="h-3 w-3 text-amber-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-amber-900 dark:text-purple-100">
                    Digit Combinations
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                  {digitOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setDigits(option.value)}
                      className={`rounded-lg px-2 py-1 text-xs font-semibold shadow-sm transition-all duration-200 ${
                        JSON.stringify(digits) === JSON.stringify(option.value)
                          ? `${option.color} text-white shadow-lg scale-105`
                          : "bg-white dark:bg-slate-600 hover:shadow-md hover:scale-102 text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer */}
              <div className="rounded-lg border border-amber-100 dark:border-slate-600 bg-gradient-to-b from-white to-amber-50 dark:from-slate-700 dark:to-slate-800 p-2 shadow-sm">
                <div className="mb-2 flex items-center gap-1">
                  <Timer className="h-3 w-3 text-amber-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-amber-900 dark:text-purple-100">
                    Time Challenge
                  </span>
                </div>
                <div className="space-y-1">
                  {[
                    { label: "1 Minute Sprint", s: 60, desc: "Quick burst" },
                    { label: "2 Minute Flow", s: 120, desc: "Steady pace" },
                    { label: "3 Minute Marathon", s: 180, desc: "Endurance" },
                  ].map(({ label, s, desc }) => (
                    <button
                      key={s}
                      onClick={() => setDuration(s)}
                      className={`w-full rounded-lg px-2 py-1.5 font-semibold shadow-sm transition-all duration-200 ${
                        duration === s
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 dark:from-purple-500 dark:to-blue-500 text-white shadow-lg scale-105"
                          : "bg-white dark:bg-slate-600 hover:bg-amber-50 dark:hover:bg-slate-500 hover:shadow-md text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      <div className="text-xs">{label}</div>
                      <div className="text-xs opacity-75">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Section */}
            <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 p-3 text-white shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs opacity-90">Ready to practice:</div>
                  <div className="text-sm font-bold">
                    <span className="capitalize">{operation}</span> •{" "}
                    {selectedDigitOption?.label} • {toMMSS(duration)}
                  </div>
                </div>
                <button
                  onClick={startQuiz}
                  className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-bold text-emerald-600 dark:text-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <Play className="h-4 w-4" /> Start Practice
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "quiz" && (
          <div className="space-y-3 rounded-xl border border-amber-200 dark:border-slate-600 bg-white/95 dark:bg-slate-800/95 backdrop-blur p-3 shadow-xl">
            {/* Quiz Header */}
            <div className="flex items-center justify-between gap-2">
              {/* Compact Timer */}
              <div className="relative">
                <svg
                  className="w-12 h-12 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 45 * (1 - timeLeft / duration)
                    }`}
                    className="text-red-500 dark:text-red-400 transition-all duration-1000 ease-linear"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-sm font-bold text-red-600 dark:text-red-400">
                    {timeLeft}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 -mt-0.5">
                    sec
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 dark:from-purple-500 dark:to-pink-500 px-2 py-1 font-bold text-white shadow-lg">
                <Trophy className="h-3 w-3" />
                <span className="text-sm">Score: {score}</span>
              </div>
            </div>

            {/* Question Display */}
            <div className="text-center">
              {displayFormat === "vertical" &&
              supportsVerticalFormat(operation) ? (
                <>
                  {/* Vertical Math Problem */}
                  <div className="mx-auto mb-3 max-w-xs rounded-xl bg-gradient-to-b from-amber-100 to-orange-100 dark:from-slate-700 dark:to-slate-600 border-2 border-amber-300 dark:border-purple-400 px-3 py-2 shadow-2xl">
                    <div className="font-mono text-amber-900 dark:text-purple-100 drop-shadow-sm">
                      {(() => {
                        const parts = q.q.split(" ");
                        if (parts.length === 3) {
                          const [num1, op, num2] = parts;
                          return (
                            <div className="text-lg font-black leading-tight">
                              <div className="text-right mb-1">{num1}</div>
                              <div className="text-right mb-1">
                                {op}
                                {num2}
                              </div>
                              <div className="border-t-2 border-amber-900 dark:border-purple-100 text-right pt-1 mb-2">
                                <input
                                  ref={answerInputRef}
                                  value={ans}
                                  onChange={(e) =>
                                    setAns(
                                      e.target.value.replace(/[^0-9-]/g, "")
                                    )
                                  }
                                  onKeyDown={(e) =>
                                    e.key === "Enter" && submit()
                                  }
                                  inputMode="numeric"
                                  placeholder=""
                                  className="w-16 text-center bg-transparent border-none outline-none text-amber-900 dark:text-purple-100 placeholder-amber-600 dark:placeholder-purple-300 font-black text-lg"
                                />
                              </div>
                            </div>
                          );
                        }
                        return <div className="text-xl font-black">{q.q}</div>;
                      })()}
                    </div>
                  </div>

                  {/* Action Buttons for Vertical */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={submit}
                      className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 dark:from-purple-500 dark:to-blue-500 px-3 py-2 text-xs font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <Play className="h-3 w-3" /> Submit
                    </button>
                    <button
                      onClick={skip}
                      className="rounded-lg border-2 border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-600 px-3 py-2 text-xs font-bold shadow-lg hover:bg-gray-50 dark:hover:bg-slate-500 transition-all duration-200 text-gray-700 dark:text-gray-200"
                    >
                      Skip
                    </button>
                  </div>
                </>
              ) : 
                <>
                  {/* Horizontal Math Problem (Default for all operations) */}
                  <div className="mx-auto mb-3 max-w-xs rounded-xl bg-gradient-to-b from-amber-100 to-orange-100 dark:from-slate-700 dark:to-slate-600 border-2 border-amber-300 dark:border-purple-400 px-4 py-3 shadow-2xl">
                    <div className="text-xl font-black text-amber-900 dark:text-purple-100 drop-shadow-sm">
                      {q.q}
                    </div>
                  </div>

                  {/* Answer Input */}
                  <div className="flex items-center justify-center gap-1">
                    <input
                      ref={answerInputRef}
                      value={ans}
                      onChange={(e) =>
                        setAns(e.target.value.replace(/[^0-9-]/g, ""))
                      }
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                      inputMode="numeric"
                      placeholder="Your answer..."
                      className="w-32 rounded-lg border-4 border-amber-300 dark:border-purple-400 bg-white dark:bg-slate-700 px-3 py-2 text-center text-lg font-bold outline-none focus:border-emerald-400 dark:focus:border-purple-300 transition-all duration-200 text-gray-900 dark:text-gray-100"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={submit}
                        className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 dark:from-purple-500 dark:to-blue-500 px-3 py-2 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                      >
                        <Play className="h-3 w-3" /> Sub
                      </button>
                      <button
                        onClick={skip}
                        className="rounded-lg border-2 border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-600 px-3 py-2 text-sm font-bold shadow-lg hover:bg-gray-50 dark:hover:bg-slate-500 transition-all duration-200 text-gray-700 dark:text-gray-200"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                </>
              }
            </div>

            {/* Recent History */}
            <div className="mt-3">
              <h3 className="mb-2 text-xs font-bold text-amber-900 dark:text-purple-100">
                Recent Answers
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
                {history.slice(0, 6).map((h, i) => (
                  <div
                    key={i}
                    className={`rounded-lg px-2 py-1 text-xs font-medium shadow-sm border-2 ${
                      h.correct
                        ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-600"
                        : "bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-600"
                    }`}
                  >
                    <div className="font-bold">
                      {h.q} = {h.right}
                    </div>
                    <div className="text-xs mt-0.5">
                      {h.skipped
                        ? "⏭️ Skipped"
                        : h.correct
                        ? "✅ Correct!"
                        : `❌ You said: ${h.user || "nothing"}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === "result" && (
          <div className="space-y-3 rounded-xl border border-amber-200 dark:border-slate-600 bg-white/95 dark:bg-slate-800/95 backdrop-blur p-4 text-center shadow-xl">
            {/* Final Score */}
            <div className="space-y-2">
              <Trophy className="mx-auto h-8 w-8 text-amber-500 dark:text-purple-400" />
              <h2 className="text-lg font-bold text-amber-900 dark:text-purple-100">
                Practice Complete!
              </h2>
              <div className="mx-auto inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 dark:from-purple-500 dark:to-blue-500 px-4 py-2 text-lg font-bold text-white shadow-lg">
                Final Score: {score}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2 border-2 border-blue-200 dark:border-blue-600">
                <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                  {attempts}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-300">
                  Attempted
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2 border-2 border-emerald-200 dark:border-emerald-600">
                <div className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                  {score}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-300">
                  Correct
                </div>
              </div>
              <div className="rounded-lg bg-purple-50 dark:bg-purple-900/30 p-2 border-2 border-purple-200 dark:border-purple-600">
                <div className="text-lg font-bold text-purple-800 dark:text-purple-200">
                  {accuracy}%
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-300">
                  Accuracy
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setView("menu")}
                className="inline-flex items-center gap-1 rounded-lg border-2 border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-600 px-3 py-2 text-sm font-bold shadow-lg hover:bg-gray-50 dark:hover:bg-slate-500 transition-all duration-200 text-gray-700 dark:text-gray-200"
              >
                <Settings className="h-3 w-3" /> Change Settings
              </button>
              <button
                onClick={startQuiz}
                className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 dark:from-purple-500 dark:to-blue-500 px-4 py-2 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <RotateCcw className="h-3 w-3" /> Practice Again
              </button>
            </div>

            {/* Detailed Review */}
            <div className="mt-4 text-left">
              <h3 className="mb-2 text-center text-sm font-bold text-amber-900 dark:text-purple-100">
                Complete Review
              </h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className={`rounded-lg px-2 py-1 text-xs border-2 ${
                      h.correct
                        ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-600"
                        : "bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-600"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">
                        {h.q} = {h.right}
                      </span>
                      <span className="text-xs">
                        {h.skipped
                          ? "⏭️ Skipped"
                          : h.correct
                          ? "✅"
                          : `❌ ${h.user || "blank"}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <footer className="mt-4 text-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-slate-700 px-3 py-1 text-xs text-amber-800 dark:text-purple-200">
            <Brain className="h-3 w-3" />
            Enhanced with squares, cubes & square roots • Smart display format •
            Compact view
          </div>
        </footer>
      </div>
    </div>
  );
}
