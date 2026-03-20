import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
          },
        }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;