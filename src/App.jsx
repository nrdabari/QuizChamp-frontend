import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import routes from "./routes";
import Login from "./components/auth/Login";
import Unauthorized from "./views/Unauthorized";
import Layout from "./components/layout";
import { useAuth } from "./context/AuthContext";

// Component to handle initial routing logic
function AppRoutes() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if we're on the root path and user data is loaded
    if (!isLoading && location.pathname === "/" && user) {
      const defaultRoute =
        user.role === "admin" ? "/admin/exercises" : "/user/exam";
      console.log("Redirecting to:", defaultRoute, "User role:", user.role); // Debug log
      navigate(defaultRoute, { replace: true });
    }
  }, [user, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Root route - shows loading or redirects via useEffect */}
      <Route
        path="/"
        element={
          user ? <div>Redirecting...</div> : <Navigate to="/login" replace />
        }
      />

      {/* Protected Routes with Layout wrapper */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        {routes
          .filter((route) => route.layout === "/admin")
          .map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={
                <ProtectedRoute allowedRoles={route.role || ["admin"]}>
                  {route.component}
                </ProtectedRoute>
              }
            />
          ))}
      </Route>

      <Route
        path="/user/*"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        {routes
          .filter((route) => route.layout === "/user")
          .map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={
                <ProtectedRoute allowedRoles={route.role || ["user"]}>
                  {route.component}
                </ProtectedRoute>
              }
            />
          ))}
      </Route>

      {/* Catch all - redirect based on auth status */}
      <Route
        path="*"
        element={
          user ? (
            <Navigate
              to={user.role === "admin" ? "/admin/exercises" : "/user/exam"}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
