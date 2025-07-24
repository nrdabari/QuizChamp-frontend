import React, { useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";

const CountdownTimer = ({ initialMinutes = 60 }) => {
  const initialTime = initialMinutes * 60; // Convert to seconds
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isPaused, setIsPaused] = useState(false);

  // Format time to HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // Timer logic
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-3xl font-bold text-red-600">
        Time Remaining: {formatTime(timeLeft)}
      </div>

      <button
        onClick={() => setIsPaused((prev) => !prev)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
      >
        {isPaused ? (
          <>
            <Play size={20} />
          </>
        ) : (
          <>
            <Pause size={20} />
          </>
        )}
      </button>
    </div>
  );
};

export default CountdownTimer;
