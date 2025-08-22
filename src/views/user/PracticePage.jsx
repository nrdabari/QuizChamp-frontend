import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Maximize, Minimize } from "lucide-react";
import PracticeFailedQuestions from "./PracticeFailedQuestions";
import fscreen from "fscreen";

const PracticePage = () => {
  const { exerciseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const userId = searchParams.get("userId");

  // Fullscreen functionality
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(fscreen.fullscreenElement !== null);
    };

    if (fscreen.fullscreenEnabled) {
      fscreen.addEventListener("fullscreenchange", handleFullscreenChange);

      // Enter fullscreen by default when component mounts
      const timer = setTimeout(() => {
        if (!fscreen.fullscreenElement) {
          fscreen
            .requestFullscreen(document.documentElement)
            .catch(console.warn);
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        fscreen.removeEventListener("fullscreenchange", handleFullscreenChange);
      };
    }
  }, []);

  // Auto-exit fullscreen when component unmounts
  useEffect(() => {
    return () => {
      if (fscreen.fullscreenElement) {
        fscreen.exitFullscreen().catch(console.warn);
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!fscreen.fullscreenEnabled) {
      alert("Fullscreen is not supported in your browser");
      return;
    }

    if (isFullscreen) {
      fscreen.exitFullscreen();
    } else {
      fscreen.requestFullscreen(document.documentElement);
    }
  };

  const goBack = () => {
    // Exit fullscreen before navigation
    if (fscreen.fullscreenElement) {
      fscreen.exitFullscreen();
    }
    navigate(-1);
  };

  if (!exerciseId || !userId) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-dark-bg-primary flex items-center justify-center transition-colors duration-250 p-4">
        <div className="text-center bg-white dark:bg-dark-bg-secondary p-6 rounded-lg shadow-md border border-gray-200 dark:border-dark-purple-700 max-w-md w-full">
          <h2 className="text-lg font-bold font-display text-red-600 dark:text-red-400 mb-3">
            Invalid Practice Session
          </h2>
          <p className="text-text-light-secondary dark:text-text-dark-secondary mb-4 font-sans text-sm">
            Missing required parameters
          </p>
          <button
            onClick={goBack}
            className="w-full px-4 py-2 bg-primary-600 dark:bg-dark-purple-500 text-white rounded-md hover:bg-primary-700 dark:hover:bg-dark-purple-600 transition-colors font-medium font-sans text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-250 ${
        isFullscreen
          ? "bg-white dark:bg-dark-bg-primary"
          : "bg-gray-100 dark:bg-dark-bg-primary"
      }`}
    >
      {/* Compact Header - Fixed height */}
      <div className="bg-white dark:bg-dark-bg-secondary shadow-sm border-b border-gray-200 dark:border-dark-purple-700 transition-colors duration-250 h-24">
        <div className="w-full px-3 py-3 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left side - Back button and title */}
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <button
                onClick={goBack}
                className="flex items-center px-2 py-1.5 text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary hover:bg-gray-100 dark:hover:bg-dark-purple-800 rounded-md transition-colors font-sans text-sm"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Back</span>
              </button>

              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-base font-bold font-display text-primary-700 dark:text-text-dark-primary truncate">
                  Practice Failed Questions
                </h1>
                <p className="text-text-light-secondary dark:text-text-dark-secondary text-xs font-sans truncate hidden sm:block">
                  Review and practice questions you got wrong
                </p>
              </div>
            </div>

            {/* Right side - Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 text-white px-2.5 py-1.5 rounded-md transition-colors font-sans text-xs flex-shrink-0"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-3 h-3" />
                  <span className="hidden sm:inline">Exit</span>
                </>
              ) : (
                <>
                  <Maximize className="w-3 h-3" />
                  <span className="hidden sm:inline">Full</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Practice Component - Takes remaining height */}
      <div
        className={`${
          isFullscreen ? "h-screen" : "h-[calc(100vh-6rem)]"
        } overflow-y-auto`}
      >
        <PracticeFailedQuestions exerciseId={exerciseId} userId={userId} />
      </div>
    </div>
  );
};

export default PracticePage;
