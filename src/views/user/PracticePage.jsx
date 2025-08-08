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
      <div className="min-h-screen bg-gray-100 dark:bg-dark-bg-primary flex items-center justify-center transition-colors duration-250">
        <div className="text-center bg-white dark:bg-dark-bg-secondary p-8 rounded-lg shadow-lg dark:shadow-dark border border-gray-200 dark:border-dark-purple-700">
          <h2 className="text-xl font-bold font-display text-red-600 dark:text-red-400 mb-4">
            Invalid Practice Session
          </h2>
          <p className="text-text-light-secondary dark:text-text-dark-secondary mb-6 font-sans">
            Missing required parameters
          </p>
          <button
            onClick={goBack}
            className="px-6 py-3 bg-primary-600 dark:bg-dark-purple-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-dark-purple-600 transition-colors font-medium font-sans shadow-md"
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
      {/* Header - Always visible with fullscreen toggle */}
      <div className="bg-white dark:bg-dark-bg-secondary shadow-sm border-b border-gray-200 dark:border-dark-purple-700 transition-colors duration-250">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="flex items-center px-3 py-2 text-text-light-secondary dark:text-text-dark-secondary hover:text-text-light-primary dark:hover:text-text-dark-primary hover:bg-gray-100 dark:hover:bg-dark-purple-800 rounded-lg transition-colors font-sans"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold font-display text-primary-700 dark:text-text-dark-primary">
                  Practice Failed Questions
                </h1>
                <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm font-sans">
                  Review and practice questions you got wrong
                </p>
              </div>
            </div>

            {/* Fullscreen Toggle Button */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors font-sans shadow-md"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-4 h-4" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize className="w-4 h-4" />
                  <span>Fullscreen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Practice Component */}
      <div
        className={`${isFullscreen ? "p-0" : "container mx-auto px-4 py-8"}`}
      >
        <PracticeFailedQuestions exerciseId={exerciseId} userId={userId} />
      </div>
    </div>
  );
};

export default PracticePage;
