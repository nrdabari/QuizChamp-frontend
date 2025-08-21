import React, { useState } from "react";
import { useTask } from "../../context/TaskContext";
import { useAuth } from "../../context/AuthContext";
import {
  Plus,
  Timer,
  Check,
  Play,
  Pause,
  Square,
  Heart,
  Trash2,
  Clock,
  BookOpen,
  Star,
  TrendingUp,
  RotateCcw,
} from "lucide-react";

const StudentPanel = () => {
  const { user } = useAuth();
  const {
    todayTasks,
    carryoverTasks,
    favoriteTasks,
    dueRevisions,
    // stats,
    loading,
    error,
    activeTimerId,
    createTask,
    startTimer,
    pauseTimer,
    stopTimer,
    completeTask,
    addToFavorites,
    removeFavorite,
    deleteTask,
    practiceAgain,
    formatTime,
    getTaskStats,
  } = useTask();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    subject: "",
    timeAllocated: 15,
  });
  const [timerError, setTimerError] = useState("");

  const subjects = [
    "Mathematics",
    "Science",
    "English",
    "Social Studies",
    "Abacus",
    "General Knowledge",
    "Hindi",
    "Computer Science",
  ];

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createTask(taskForm);
      setTaskForm({
        title: "",
        description: "",
        subject: "",
        timeAllocated: 15,
      });
      setShowTaskForm(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleStartTimer = async (taskId) => {
    try {
      await startTimer(taskId);
      setTimerError("");
    } catch (error) {
      setTimerError(error.message);
      setTimeout(() => setTimerError(""), 3000);
    }
  };

  const taskStats = getTaskStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Study Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome back, {user?.name}! Ready to learn?
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Timer Error */}
        {timerError && (
          <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 rounded-lg">
            {timerError}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Check className="text-green-600 dark:text-green-400" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Completed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {taskStats.completed}/{taskStats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Clock className="text-blue-600 dark:text-blue-400" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Time Studied
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(taskStats.studiedTime)}m
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Heart className="text-pink-600 dark:text-pink-400" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Favorites
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {favoriteTasks.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <TrendingUp
                className="text-purple-600 dark:text-purple-400"
                size={24}
              />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Progress
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {taskStats.completionRate}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Task Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
          >
            <Plus size={20} />
            Create New Task
          </button>
        </div>

        {/* Task Creation Form */}
        {showTaskForm && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Create Your Study Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Name
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., IMO Math Practice"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  required
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Describe what you plan to study..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <select
                    required
                    value={taskForm.subject}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={taskForm.timeAllocated}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        timeAllocated: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Today's Tasks
            </h2>
            <TaskList
              tasks={[...carryoverTasks, ...todayTasks]}
              activeTimerId={activeTimerId}
              onStart={handleStartTimer}
              onPause={pauseTimer}
              onStop={stopTimer}
              onComplete={completeTask}
              onFavorite={addToFavorites}
              onDelete={deleteTask}
              formatTime={formatTime}
              emptyMessage="No tasks for today. Create one to get started!"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Due Revisions */}
            {dueRevisions.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center gap-2">
                  <RotateCcw size={20} />
                  Due for Revision
                </h3>
                <div className="space-y-2">
                  {dueRevisions.map((revision) => (
                    <div key={revision._id} className="text-sm">
                      <p className="font-medium text-yellow-700 dark:text-yellow-300">
                        {revision.taskId?.title}
                      </p>
                      <p className="text-yellow-600 dark:text-yellow-400">
                        Originally completed:{" "}
                        {new Date(
                          revision.originalCompletionDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Tasks */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Star size={20} className="text-yellow-500" />
                My Favorites
              </h3>
              {favoriteTasks.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No favorite tasks yet. Mark tasks as favorites to practice
                  them again!
                </p>
              ) : (
                <div className="space-y-3">
                  {favoriteTasks.slice(0, 5).map((favorite) => (
                    <div
                      key={favorite._id}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                        {favorite.taskId?.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                        Practiced {favorite.favorite?.practiceCount || 0} times
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => practiceAgain(favorite)}
                          className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded transition-colors"
                        >
                          Practice Again
                        </button>
                        <button
                          onClick={() => removeFavorite(favorite._id)}
                          className="text-xs text-red-600 hover:text-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Progress Summary */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Today's Progress
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Completion Rate
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {taskStats.completionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${taskStats.completionRate}%` }}
                  ></div>
                </div>
                {activeTimerId && (
                  <div className="mt-3 p-2 bg-orange-100 dark:bg-orange-900/30 rounded border border-orange-200 dark:border-orange-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                        Timer is running!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Task List Component
const TaskList = ({
  tasks,
  activeTimerId,
  onStart,
  onPause,
  onStop,
  onComplete,
  onFavorite,
  onDelete,
  formatTime,
  emptyMessage,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
        <BookOpen
          size={48}
          className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
        />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No tasks yet!
        </h3>
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          isActive={activeTimerId === task._id}
          onStart={onStart}
          onPause={onPause}
          onStop={onStop}
          onComplete={onComplete}
          onFavorite={onFavorite}
          onDelete={onDelete}
          formatTime={formatTime}
        />
      ))}
    </div>
  );
};

// Task Card Component
const TaskCard = ({
  task,
  // isActive,
  onStart,
  onPause,
  onStop,
  onComplete,
  onFavorite,
  onDelete,
  formatTime,
}) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500";
      case "high":
        return "border-l-orange-500";
      case "medium":
        return "border-l-blue-500";
      default:
        return "border-l-gray-500";
    }
  };

  const getSourceBadge = (source) => {
    const badges = {
      carryover: {
        text: "Carryover",
        class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      },
      revision: {
        text: "Revision",
        class:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      },
      favorite_practice: {
        text: "Practice",
        class:
          "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      },
      self_created: {
        text: "Today",
        class:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      },
    };
    return badges[source] || badges["self_created"];
  };

  const timeRemaining =
    task.timer?.timeRemaining ||
    task.customDuration ||
    task.taskId?.defaultDuration ||
    0;
  const timeSpent = task.timer?.totalTimeSpent || 0;
  const sourceBadge = getSourceBadge(task.source);

  return (
    <div
      className={`
    bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg 
    transition-all duration-200 border-l-4 border dark:border-gray-700
    ${
      task.status === "completed"
        ? "border-l-green-500 bg-green-50 dark:bg-green-900/10"
        : task.timer?.state === "running"
        ? "border-l-orange-500 bg-orange-50 dark:bg-orange-900/10"
        : getPriorityColor(task.priority)
    }
  `}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4 flex-1">
          {/* Completion Checkbox */}
          <button
            onClick={() => onComplete(task._id)}
            // disabled={task.status === "completed"}
            className={`
    w-8 h-8 rounded-full border-2 flex items-center justify-center 
    transition-colors
    ${
      task.status === "completed"
        ? "bg-green-500 border-green-500 text-white cursor-default"
        : "border-gray-300 dark:border-gray-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer"
    }
  `}
          >
            {task.status === "completed" && <Check size={16} />}
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3
                className={`text-lg font-semibold ${
                  task.status === "completed"
                    ? "text-gray-500 dark:text-gray-400 line-through"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {task.taskId?.title}
              </h3>

              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full">
                {task.taskId?.subject}
              </span>

              <span
                className={`px-2 py-1 text-xs rounded-full ${sourceBadge.class}`}
              >
                {sourceBadge.text}
              </span>

              {task.favorite?.isFavorite && (
                <Star
                  size={16}
                  className="text-yellow-500 fill-current"
                  title="Favorite Task"
                />
              )}

              {task.revision?.isRevision && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                  Revision #{task.revision.revisionNumber}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {task.taskId?.description}
            </p>

            {/* Timer Display */}
            <div className="flex items-center gap-4 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Timer
                  size={14}
                  className={
                    task.timer?.state === "running"
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-gray-500 dark:text-gray-400"
                  }
                />
                <span
                  className={`text-sm font-mono ${
                    task.timer?.state === "running"
                      ? "text-orange-600 dark:text-orange-400 font-bold text-lg"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-xs text-gray-400">remaining</span>
              </div>

              {timeSpent > 0 && (
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-green-500" />
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Studied: {formatTime(timeSpent)}
                  </span>
                </div>
              )}

              {task.priority === "urgent" && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full font-medium">
                  URGENT
                </span>
              )}
            </div>

            {/* Timer Status Indicators */}
            {task.timer?.state === "running" && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Timer Running
                </span>
              </div>
            )}

            {task.timer?.state === "paused" && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                  Timer Paused
                </span>
              </div>
            )}

            {task.status === "completed" && task.completedAt && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                ✓ Completed at {new Date(task.completedAt).toLocaleTimeString()}
              </p>
            )}

            {/* Revision Info */}
            {task.revision?.isRevision && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs border border-blue-200 dark:border-blue-700">
                <span className="text-blue-700 dark:text-blue-300">
                  📚 Revision of task originally completed on{" "}
                  {new Date(
                    task.revision.originalCompletionDate
                  ).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Favorite Practice Count */}
            {task.favorite?.isFavorite && task.favorite.practiceCount > 0 && (
              <div className="mt-2 text-xs text-pink-600 dark:text-pink-400">
                ⭐ Practiced {task.favorite.practiceCount} times as favorite
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 items-center ml-4">
          {task.status !== "completed" && (
            <>
              {task.timer?.state === "stopped" && (
                <button
                  onClick={() => onStart(task._id)}
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors shadow-sm"
                  title="Start Timer"
                >
                  <Play size={16} />
                </button>
              )}

              {task.timer?.state === "running" && (
                <>
                  <button
                    onClick={() => onPause(task._id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg transition-colors shadow-sm"
                    title="Pause Timer"
                  >
                    <Pause size={16} />
                  </button>
                  <button
                    onClick={() => onStop(task._id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors shadow-sm"
                    title="Stop Timer"
                  >
                    <Square size={16} />
                  </button>
                </>
              )}

              {task.timer?.state === "paused" && (
                <>
                  <button
                    onClick={() => onStart(task._id)}
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors shadow-sm"
                    title="Resume Timer"
                  >
                    <Play size={16} />
                  </button>
                  <button
                    onClick={() => onStop(task._id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors shadow-sm"
                    title="Stop Timer"
                  >
                    <Square size={16} />
                  </button>
                </>
              )}
            </>
          )}

          {/* Favorite Button */}
          <button
            onClick={() => onFavorite(task._id)}
            className={`p-2 rounded-lg transition-colors ${
              task.favorite?.isFavorite
                ? "text-yellow-500 hover:text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
                : "text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20"
            }`}
            title={
              task.favorite?.isFavorite
                ? "Remove from Favorites"
                : "Add to Favorites"
            }
          >
            <Heart
              size={16}
              className={task.favorite?.isFavorite ? "fill-current" : ""}
            />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(task._id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
            title="Delete Task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentPanel;
