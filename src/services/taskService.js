import api from "../utils/api";

const taskService = {
  // Get student dashboard data
  getDashboard: async (studentId) => {
    return await api.get(`/tasks/dashboard/${studentId}`);
  },

  // Create new task
  createTask: async (taskData) => {
    return await api.post(`/tasks`, taskData);
  },

  // Timer operations
  // startTimer: async (taskId) => {
  //   return await api.post(`/tasks/${taskId}/start`);
  // },

  // pauseTimer: async (taskId) => {
  //   return await api.post(`/tasks/${taskId}/pause`);
  // },

  // stopTimer: async (taskId) => {
  //   return await api.post(`/tasks/${taskId}/stop`);
  // },

  // updateTimer: async (taskId) => {
  //   return await api.put(`/tasks/${taskId}/timer`);
  // },

  // Task completion
  completeTask: async (taskId) => {
    return await api.put(`/tasks/${taskId}/complete`);
  },

  // Favorites
  addToFavorites: async (taskId) => {
    return await api.post(`/tasks/${taskId}/favorite`);
  },

  removeFavorite: async (taskId) => {
    return await api.delete(`/tasks/${taskId}/favorite`);
  },

  // Delete task
  deleteTask: async (taskId) => {
    return await api.delete(`/tasks/${taskId}`);
  },

  // Admin operations
  getAllTasks: async () => {
    return await api.get(`/admin/tasks`);
  },

  getTaskStats: async () => {
    return await api.get(`/admin/tasks/stats`);
  },
};

export { taskService };
