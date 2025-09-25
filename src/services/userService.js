import api from "../utils/api";

export const userService = {
  // ✅ Get exam question with user answer
  getExamQuestion: async (submissionId, exerciseId, questionIndex) => {
    const response = await api.get(
      `/questions/exam/${submissionId}/${exerciseId}/${questionIndex}`
    );
    return response.data;
  },
  // ✅ Get attempted answers for submission
  getAttemptedAnswers: async (submissionId) => {
    const response = await api.get(`/submissions/attempted/${submissionId}`);
    return response.data;
  },
  // ✅ Submit answer for exam question
  submitAnswer: async (submissionId, answerData) => {
    const response = await api.patch(
      `/submissions/answer/${submissionId}`,
      answerData
    );
    return response.data;
  },
  // ✅ Complete exam submission
  completeExam: async (submissionId) => {
    const response = await api.post(`/submissions/complete/${submissionId}`);
    return response.data;
  },

  // ✅ Resume exam submission
  resumeExam: async (submissionId) => {
    const response = await api.patch(`/submissions/resume/${submissionId}`);
    return response.data;
  },
  // ✅ Pause exam submission (NEW METHOD)
  pauseExam: async (submissionId, timeLeft) => {
    const response = await api.patch(`/submissions/pause/${submissionId}`, {
      timeLeft,
    });
    return response.data;
  },
  // ✅ Get exam report (NEW METHOD)
  getExamReport: async (submissionId) => {
    const response = await api.get(`/submissions/report/${submissionId}`);
    return response.data;
  },
  // ✅ Get failed questions for practice (NEW METHOD)
  getFailedQuestionsForPractice: async (exerciseId, userId) => {
    const response = await api.get(
      `/practices/exercises/${exerciseId}/failed-questions?userId=${userId}`
    );
    return response.data;
  },
  // ✅ Get practice question by ID (NEW METHOD)
  getPracticeQuestion: async (questionId) => {
    const response = await api.get(`/practices/questions/${questionId}`);
    return response.data;
  },
  // ✅ Check practice question answer (NEW METHOD)
  checkPracticeAnswer: async (questionId, userAnswer) => {
    const response = await api.post(
      `/practices/questions/${questionId}/check-answer`,
      {
        userAnswer,
      }
    );
    return response.data;
  },
  // ✅ Start exam submission (NEW METHOD)
  startExam: async (examData) => {
    const response = await api.put("/submissions/start", examData);
    return response.data;
  },
  // ✅ Get all submissions (NEW METHOD)
  getAllSubmissions: async () => {
    const response = await api.get("/submissions");
    return response.data;
  },

  //   // ✅ Get all exercises
  getExercises: async (classLevel = null) => {
    const url = classLevel
      ? `/exercises?classLevel=${classLevel}`
      : "/exercises";
    const response = await api.get(url);
    return response.data;
  },
  // ✅ Get single exercise
  getExercise: async (id) => {
    const response = await api.get(`/exercises/${id}`);
    return response.data;
  },
  // ✅ Get Chapter list on subject and class level
  getChapters: async (subjectId, classLevel) => {
    const response = await api.get(
      `/chapters?subjectId=${subjectId}&classLevel=${classLevel}`
    );
    return response.data;
  },

  // ✅ Start chapter exam submission (NEW METHOD)
  startChapterTest: async (examData) => {
    const response = await api.post("/submissions/chapter-test", examData);
    return response.data;
  },

  // ✅ get chapter exam question (NEW METHOD)
  getChapterTestQuestion: async (submissionId, questionId) => {
    const response = await api.get(
      `/submissions/${submissionId}/chapter-question/${questionId}`
    );
    return response.data;
  },
  // ✅ Get chapter exam report (NEW METHOD)
  getChapterExamReport: async (submissionId) => {
    const response = await api.get(
      `/submissions/chapterTestDetails/${submissionId}`
    );
    return response.data;
  },
};
