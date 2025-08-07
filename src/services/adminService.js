// services/adminService.js - Exercise-related functions
import api from "../utils/api";

export const adminService = {
  // ✅ Create or Update Exercise (your API endpoint)
  createOrUpdateExercise: async (exerciseData) => {
    const response = await api.post("/exercises/exercise", exerciseData);
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

  //   // ✅ Delete exercise
  //   deleteExercise: async (id) => {
  //     const response = await api.delete(`/exercises/${id}`);
  //     return response.data;
  //   },

  getSubjects: async (classLevel) => {
    const response = await api.get(`/subjects?classLevel=${classLevel}`);
    return response.data;
  },

  getChapters: async (subjectId, classLevel) => {
    const response = await api.get(
      `/chapters?subjectId=${subjectId}&classLevel=${classLevel}`
    );
    return response.data;
  },

  uploadDirectionImage: async (exerciseId, formData) => {
    const response = await api.post(
      `/exercises/${exerciseId}/directions/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  removeDirectionImage: async (exerciseId, directionIndex) => {
    const response = await api.delete(
      `/exercises/${exerciseId}/directions/${directionIndex}/image`
    );
    return response.data;
  },

  bulkCreateQuestions: async (exerciseId, questions) => {
    const response = await api.post(`/questions/bulk`, {
      exerciseId,
      questions,
    });
    return response.data;
  },

  // ✅ Get chapter assignment data for exercise
  getChapterAssignmentData: async (exerciseId) => {
    const response = await api.get(
      `/exercises/${exerciseId}/chapter-assignment-data`
    );
    return response.data;
  },
  // ✅ Assign chapters to exercise questions
  assignChaptersToQuestions: async (exerciseId, assignments) => {
    const response = await api.post(
      `/questions/assign/${exerciseId}/assign-chapters`,
      assignments
    );
    return response.data;
  },

  // ✅ Get questions for editing
  getQuestionsForEdit: async (exerciseId) => {
    const response = await api.get(`/questions/edit/${exerciseId}`);
    return response.data;
  },

  // ✅ Upload image to question
  uploadQuestionImage: async (questionId, file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post(
      `/questions/upload/${questionId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
  // ✅ Remove image from question
  removeQuestionImage: async (questionId) => {
    const response = await api.delete(`/questions/delete-image/${questionId}`);
    return response.data;
  },

  // ✅ Update question
  updateQuestion: async (questionId, questionData) => {
    const response = await api.put(`/questions/${questionId}`, questionData);
    return response.data;
  },

 
};
