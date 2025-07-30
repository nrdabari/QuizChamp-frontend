import React from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // If you have lucide-react, otherwise use any back icon
import PracticeFailedQuestions from "./PracticeFailedQuestions";

const PracticePage = () => {
  const { exerciseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userId = searchParams.get("userId");

  const goBack = () => {
    navigate(-1); // Go back to previous page
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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
          </div>
        </div>
      </div>

      {/* Practice Component */}
      <div className="container mx-auto px-4 py-8">
        <PracticeFailedQuestions exerciseId={exerciseId} userId={userId} />
      </div>
    </div>
  );
};

export default PracticePage;
