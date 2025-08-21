// ================================================================================================
// FRONTEND INTEGRATION FOR SIMPLIFIED 3-MODEL BACKEND
// ================================================================================================

// ============================================================================
// 1. TASK CONTEXT (src/context/TaskContext.js)
// ============================================================================
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useApiService } from "../hooks/useApiService";
import { useAuth } from "./AuthContext";

const TaskContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const { taskService } = useApiService();

  // State management
  const [studentTasks, setStudentTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [carryoverTasks, setCarryoverTasks] = useState([]);
  const [favoriteTasks, setFavoriteTasks] = useState([]);
  const [dueRevisions, setDueRevisions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Timer management
  const [activeTimerId, setActiveTimerId] = useState(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize audio for timer completion
  // Replace your audio initialization with this:
  useEffect(() => {
    // Create a longer completion melody
    const createCompletionSound = () => {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const duration = 2; // 2 seconds
      const sampleRate = audioContext.sampleRate;
      const buffer = audioContext.createBuffer(
        1,
        duration * sampleRate,
        sampleRate
      );
      const data = buffer.getChannelData(0);

      // Create a pleasant completion melody
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        // Play three ascending notes
        let frequency;
        if (t < 0.6) frequency = 523.25; // C5
        else if (t < 1.2) frequency = 659.25; // E5
        else frequency = 783.99; // G5

        // Add some fade out
        const fadeOut = Math.max(0, 1 - (t - 1.5) * 2);
        data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.3 * fadeOut;
      }

      return buffer;
    };

    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const buffer = createCompletionSound();

      audioRef.current = {
        play: () => {
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          source.start(0);
          return Promise.resolve();
        },
      };
    } catch (error) {
      console.log("Web Audio not supported, falling back to HTML audio",error);
      // Fallback to a longer beep
      audioRef.current = new Audio();
      audioRef.current.src =
        "data:audio/wav;base64,UklGRqQEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YWEQAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////";
      audioRef.current.volume = 0.5;
      audioRef.current.loop = false;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer logic
  // Timer management - CLIENT-SIDE ONLY
  useEffect(() => {
    if (activeTimerId) {
      const activeTask = [...todayTasks, ...carryoverTasks].find(
        (t) => t._id === activeTimerId
      );
      if (!activeTask) return;

      let timeLeft =
        activeTask.timer?.timeRemaining || activeTask.customDuration || 0;
      let sessionStartTime = Date.now(); // Track when this session started

      timerRef.current = setInterval(() => {
        timeLeft -= 1 / 60; // Decrease by 1 second

        // Calculate time spent in this session only
        const sessionElapsed = (Date.now() - sessionStartTime) / (1000 * 60);
        const previousTimeSpent = activeTask.timer?.totalTimeSpent || 0;

        updateTaskInState(activeTimerId, {
          ...activeTask,
          timer: {
            ...activeTask.timer,
            timeRemaining: Math.max(0, timeLeft),
            totalTimeSpent: previousTimeSpent + sessionElapsed, // Add session time to previous
            state: timeLeft <= 0 ? "completed" : "running",
          },
        });

        if (timeLeft <= 0) {
          setActiveTimerId(null);
          clearInterval(timerRef.current);
          if (audioRef.current) {
            audioRef.current
              .play()
              .catch((e) => console.log("Audio play failed:", e));
          }
          completeTask(activeTimerId);
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user, activeTimerId, todayTasks, carryoverTasks]);

  // Helper function to update task in state
  const updateTaskInState = (taskId, updatedTask) => {
    const updateTaskList = (taskList) =>
      taskList.map((task) => (task._id === taskId ? updatedTask : task));

    setTodayTasks((prev) => updateTaskList(prev));
    setCarryoverTasks((prev) => updateTaskList(prev));
    setFavoriteTasks((prev) => updateTaskList(prev));
    setStudentTasks((prev) => updateTaskList(prev));
  };

  // API functions
  const fetchDashboardData = async () => {
    if (!user?._id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await taskService.getDashboard(user._id);
      const { todayTasks, carryoverTasks, favoriteTasks, dueRevisions, stats } =
        response.data.data;
      console.log("context", response.data);

      setTodayTasks(todayTasks || []);
      setCarryoverTasks(carryoverTasks || []);
      setFavoriteTasks(favoriteTasks || []);
      setDueRevisions(dueRevisions || []);
      setStats(stats || {});

      // Combine all tasks for easy access
      setStudentTasks([
        ...(todayTasks || []),
        ...(carryoverTasks || []),
        ...(favoriteTasks || []),
      ]);

      // Check for active timer
      // const runningTask = [
      //   ...(todayTasks || []),
      //   ...(carryoverTasks || []),
      // ].find((task) => task.timer?.state === "running");
      // if (runningTask) {
      //   setActiveTimerId(runningTask._id);
      // }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      setLoading(true);
      const response = await taskService.createTask({
        ...taskData,
        createdBy: user._id,
      });
      await fetchDashboardData(); // Refresh data
      return response.data;
    } catch (error) {
      console.error("Failed to create task:", error);
      setError("Failed to create task");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const startTimer = async (taskId) => {
    try {
      if (activeTimerId && activeTimerId !== taskId) {
        throw new Error(
          "Only one timer can run at a time. Please stop the current timer first."
        );
      }

      const activeTask = [...todayTasks, ...carryoverTasks].find(
        (t) => t._id === taskId
      );
      if (!activeTask) return;

      // Pure client-side - no server call
      updateTaskInState(taskId, {
        ...activeTask,
        timer: {
          ...activeTask.timer,
          state: "running",
          startedAt: new Date(),
          timeRemaining:
            activeTask.customDuration ||
            activeTask.taskId?.defaultDuration ||
            15,
        },
      });

      setActiveTimerId(taskId);
      return activeTask;
    } catch (error) {
      console.error("Failed to start timer:", error);
      throw error;
    }
  };

  const pauseTimer = async (taskId) => {
    try {
      const activeTask = [...todayTasks, ...carryoverTasks].find(
        (t) => t._id === taskId
      );
      if (!activeTask) return;

      // Calculate final time spent for this session
      const currentTimeSpent = activeTask.timer?.totalTimeSpent || 0;

      updateTaskInState(taskId, {
        ...activeTask,
        timer: {
          ...activeTask.timer,
          state: "paused",
          totalTimeSpent: currentTimeSpent, // Keep the accumulated time
        },
      });

      setActiveTimerId(null);
    } catch (error) {
      console.error("Failed to pause timer:", error);
      throw error;
    }
  };

  const stopTimer = async (taskId) => {
    try {
      const activeTask = [...todayTasks, ...carryoverTasks].find(
        (t) => t._id === taskId
      );
      if (!activeTask) return;

      // Pure client-side stop
      updateTaskInState(taskId, {
        ...activeTask,
        timer: {
          ...activeTask.timer,
          state: "stopped",
          timeRemaining:
            activeTask.customDuration ||
            activeTask.taskId?.defaultDuration ||
            15,
          totalTimeSpent: 0,
        },
      });

      setActiveTimerId(null);
    } catch (error) {
      console.error("Failed to stop timer:", error);
      throw error;
    }
  };

  const completeTask = async (taskId) => {
    try {
      // Update local state immediately for better UX
      const updateCompletedTask = (taskList) =>
        taskList.map((task) =>
          task._id === taskId
            ? { ...task, status: "completed", completedAt: new Date() }
            : task
        );

      // Update all task lists immediately
      setTodayTasks((prev) => updateCompletedTask(prev));
      setCarryoverTasks((prev) => updateCompletedTask(prev));
      setFavoriteTasks((prev) => updateCompletedTask(prev));
      setStudentTasks((prev) => updateCompletedTask(prev));

      // Then make the API call
      await taskService.completeTask(taskId);

      // Clear active timer if this was the active task
      if (activeTimerId === taskId) {
        setActiveTimerId(null);
      }

      // Refresh data from server to get updated stats and new revisions
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to complete task:", error);
      // Revert the optimistic update on error
      await fetchDashboardData();
      throw error;
    }
  };

  const addToFavorites = async (taskId) => {
    try {
      const response = await taskService.addToFavorites(taskId);
      updateTaskInState(taskId, response.data);
      await fetchDashboardData(); // Refresh favorites list
    } catch (error) {
      console.error("Failed to add to favorites:", error);
      throw error;
    }
  };

  const removeFavorite = async (taskId) => {
    try {
      const response = await taskService.removeFavorite(taskId);
      updateTaskInState(taskId, response.data);
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      if (activeTimerId === taskId) {
        setActiveTimerId(null);
      }
      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to delete task:", error);
      throw error;
    }
  };

  const practiceAgain = async (favoriteTask) => {
    try {
      // Create a new task based on favorite
      return await createTask({
        title: favoriteTask.taskId.title,
        description: favoriteTask.taskId.description,
        subject: favoriteTask.taskId.subject,
        timeAllocated:
          favoriteTask.customDuration || favoriteTask.taskId.defaultDuration,
      });
    } catch (error) {
      console.error("Failed to practice again:", error);
      throw error;
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  // Helper functions
  const formatTime = (minutes) => {
    const totalSeconds = Math.round(minutes * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTaskStats = () => {
    const allTasks = [...todayTasks, ...carryoverTasks];
    const completed = allTasks.filter(
      (task) => task.status === "completed"
    ).length;
    const total = allTasks.length;
    const totalTime = allTasks.reduce(
      (sum, task) =>
        sum + (task.customDuration || task.taskId?.defaultDuration || 0),
      0
    );
    const studiedTime = allTasks.reduce(
      (sum, task) => sum + (task.timer?.totalTimeSpent || 0),
      0
    );

    return {
      completed,
      total,
      totalTime,
      studiedTime,
      remaining: totalTime - studiedTime,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  const value = {
    // State
    studentTasks,
    todayTasks,
    carryoverTasks,
    favoriteTasks,
    dueRevisions,
    stats,
    loading,
    error,
    activeTimerId,

    // Actions
    createTask,
    startTimer,
    pauseTimer,
    stopTimer,
    completeTask,
    addToFavorites,
    removeFavorite,
    deleteTask,
    practiceAgain,
    fetchDashboardData,

    // Helpers
    formatTime,
    getTaskStats,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
