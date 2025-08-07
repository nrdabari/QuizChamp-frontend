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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Invalid Practice Session
          </h2>
          <p className="text-gray-600 mb-4">Missing required parameters</p>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isFullscreen ? "bg-white" : "bg-gray-100"}`}
    >
      {/* Header - Always visible with fullscreen toggle */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-purple-700">
                  Practice Failed Questions
                </h1>
                <p className="text-gray-600 text-sm">
                  Review and practice questions you got wrong
                </p>
              </div>
            </div>

            {/* Fullscreen Toggle Button */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
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
