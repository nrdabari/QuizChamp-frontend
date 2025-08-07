import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UploadCloud, Check, X } from "lucide-react";
import { useApiService } from "../../hooks/useApiService";

export default function BulkQuestionUpload() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();

  const [exercise, setExercise] = useState(null);
  const [questionsTxt, setQuestionsTxt] = useState("");
  const [answersTxt, setAnswersTxt] = useState("");
  const [merged, setMerged] = useState([]);
  const [saving, setSaving] = useState(false);
  const { admin, isAdmin } = useApiService();

  // ── Fetch exercise metadata
  useEffect(() => {
    const fetchExercise = async () => {
      if (!isAdmin) {
        navigate("/admin/exercises");
        return;
      }
      try {
        const data = await admin.getExercise(exerciseId);
        setExercise(data);
      } catch (error) {
        console.error("❌ Failed to fetch exercise:", error);

        // Navigate back on error (404, etc.)
        navigate("/admin/exercises");
      }
    };

    fetchExercise();
  }, [exerciseId, navigate]);

  // ── When both files loaded, parse & merge
  useEffect(() => {
    if (!questionsTxt || !answersTxt) return;

    const parsedQuestions = parseFormattedQuestions(questionsTxt);
    const parsedAnswers = parseAnswers(answersTxt);

    const final = parsedQuestions.map((q, i) => ({
      ...q,
      correctAnswer: parsedAnswers[i] || "",
    }));

    setMerged(final);
  }, [questionsTxt, answersTxt]);

  // ── Parse questions from .txt (your format)
  const parseFormattedQuestions = (text) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const questions = [];
    let i = 0;
    let id = 1;

    while (i < lines.length) {
      const questionLine = lines[i];
      i++;

      const optionMap = { A: "", B: "", C: "", D: "" };
      for (let j = 0; j < 4 && i < lines.length; j++, i++) {
        const match = lines[i].match(/^\(?([A-Da-d])\)?\.?\)?\s*(.*)$/);
        if (match) {
          const [, label, text] = match;
          optionMap[label.toUpperCase()] = text;
        }
      }

      questions.push({
        id: id++,
        question: questionLine,
        options: ["A", "B", "C", "D"].map((k) => optionMap[k] || ""),
      });
    }

    return questions;
  };

  // ── Parse answers file (A/B/C/D per line)
  const parseAnswers = (text) =>
    text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

  // ── File upload handling
  const handleFile = (e, setter) => {
    const file = e.target.files[0];
    if (file) file.text().then(setter);
  };

  // ── Save all to backend
  const saveAll = async () => {
    if (!exerciseId || merged.length === 0) return;
    setSaving(true);
    try {
      const result = await admin.bulkCreateQuestions(exerciseId, merged);

      alert(`✅ Saved ${result.count} questions`);
      setTimeout(() => {
        navigate("/admin/exercises");
      }, 2000);
    } catch (err) {
      alert("❌ Network error: ", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8 space-y-8">
        <h1 className="text-3xl font-bold text-purple-700">Bulk Upload</h1>

        {exercise && (
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <p>
              <strong>Class:</strong> {exercise.class}
            </p>
            <p>
              <strong>Subject:</strong> {exercise.subject}
            </p>
            {exercise.chapter && (
              <p>
                <strong>Chapter:</strong> {exercise.chapter}
              </p>
            )}
            <p>
              <strong>Source:</strong> {exercise.source}
            </p>
          </div>
        )}

        {/* Upload */}
        <div className="grid md:grid-cols-2 gap-6">
          <FileInput
            label="Upload Questions .txt"
            ok={!!questionsTxt}
            onChange={(e) => handleFile(e, setQuestionsTxt)}
          />
          <FileInput
            label="Upload Answers .txt"
            ok={!!answersTxt}
            onChange={(e) => handleFile(e, setAnswersTxt)}
          />
        </div>

        {/* Preview */}
        {merged.length > 0 && (
          <div className="max-h-60 overflow-auto bg-purple-50 border border-purple-200 p-4 rounded">
            <p className="font-semibold mb-2">
              Preview ({merged.length} questions):
            </p>
            <pre className="text-sm">
              {JSON.stringify(merged.slice(0, 5), null, 2)}
              {merged.length > 5 && "\n..."}
            </pre>
          </div>
        )}

        {/* Save Button */}

        <button
          onClick={saveAll}
          disabled={saving || merged.length === 0}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-semibold ${
            saving ? "bg-purple-400" : "bg-purple-700 hover:bg-purple-800"
          }`}
        >
          {saving ? "Saving…" : "Save to Database"}
          <UploadCloud size={18} />
        </button>
      </div>
    </div>
  );
}

// ── UI component for file box
function FileInput({ label, ok, onChange }) {
  return (
    <div>
      <label className="block mb-1 font-medium text-purple-700">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept=".txt"
          onChange={onChange}
          className="w-full px-4 py-2 border border-purple-300 rounded-lg file:bg-purple-600 file:text-white file:px-3 file:py-1"
        />
        {ok ? (
          <Check className="text-green-600" />
        ) : (
          <X className="text-red-500" />
        )}
      </div>
    </div>
  );
}
