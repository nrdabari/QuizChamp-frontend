import { useNavigate } from "react-router-dom";
import { Shield, Home, LogIn } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/login", { replace: true });
  };

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Error Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <Shield size={40} className="text-red-500" />
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            You don't have permission to view this page
          </p>
        </div>

        {/* Error Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-purple-100">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Unauthorized Access
            </h2>
            <p className="text-gray-600 text-sm">
              This area is restricted. Please contact your administrator if you
              believe this is an error.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleLoginRedirect}
              className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              <LogIn size={20} />
              <span>Go to Login</span>
            </button>

            <button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium"
            >
              <Home size={20} />
              <span>Go to Homepage</span>
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">Error Code: 403 - Forbidden</p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
