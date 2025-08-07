// services/adminService.js - Exercise-related functions
import api from "../utils/api";

export const adminService = {
  // ✅ Create or Update Exercise (your API endpoint)
  createOrUpdateExercise: async (exerciseData) => {
    const response = await api.post("/exercises/exercise", exerciseData);
    return response.data;
  },

  //   // ✅ Get all exercises
  //   getExercises: async () => {
  //     const response = await api.get("/exercises");
  //     return response.data;
  //   },

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
};
