import React, { useState } from "react";
import { CheckCircle2, Target, Timer, Users, User } from "lucide-react";
import { useTask } from "../../context/TaskContext";

export const AdminPanel = () => {
  const { todayTasks } = useTask();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filterStatus, setFilterStatus] = useState("all");

  // Filter tasks by date and status
  const filteredTasks = todayTasks.filter((task) => {
    const matchesDate = task.date === selectedDate;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && task.isCompleted) ||
      (filterStatus === "pending" && !task.isCompleted);
    return matchesDate && matchesStatus;
  });

  // Statistics
  const totalTasks = todayTasks.length;
  const completedTasks = todayTasks.filter((task) => task.isCompleted).length;
  const pendingTasks = totalTasks - completedTasks;
  const totalTimeAllocated = todayTasks.reduce(
    (sum, task) => sum + task.timeAllocated,
    0
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Admin Dashboard - Task Monitor
          </h1>
          <div className="flex gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Tasks</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <CheckCircle2
                className="text-green-600 dark:text-green-400"
                size={24}
              />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Completed Tasks
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {completedTasks}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Target
                className="text-orange-600 dark:text-orange-400"
                size={24}
              />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Pending Tasks
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {pendingTasks}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Timer
                className="text-purple-600 dark:text-purple-400"
                size={24}
              />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total Time (mins)
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {totalTimeAllocated}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600 dark:text-blue-400" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total Tasks
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {totalTasks}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Task List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              All Tasks - {selectedDate}
            </h2>
          </div>
          <div className="p-6">
            {filteredTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No tasks found for the selected date and filter.
              </p>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      task.isCompleted
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                        : task.timerState === "running"
                        ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              task.isCompleted
                                ? "bg-green-500 dark:bg-green-400"
                                : task.timerState === "running"
                                ? "bg-orange-500 dark:bg-orange-400 animate-pulse"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          ></div>
                          <h4 className="font-semibold text-lg text-gray-800 dark:text-white">
                            {task.taskName}
                          </h4>
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full">
                            {task.subject}
                          </span>
                          {task.timerState === "running" && (
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs rounded-full animate-pulse">
                              Timer Running
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          {task.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {task.studentName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Timer size={14} />
                            {task.timeAllocated} minutes allocated
                          </span>
                          {task.isCompleted && (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              ✓ Completed at{" "}
                              {new Date(task.completedAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {task.isCompleted ? (
                          <CheckCircle2
                            className="text-green-500 dark:text-green-400"
                            size={24}
                          />
                        ) : task.timerState === "running" ? (
                          <Timer
                            className="text-orange-500 dark:text-orange-400 animate-spin"
                            size={24}
                          />
                        ) : (
                          <Target
                            className="text-gray-400 dark:text-gray-600"
                            size={24}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
