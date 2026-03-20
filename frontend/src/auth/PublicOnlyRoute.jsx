import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function PublicOnlyRoute({ children }) {
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking session...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }

    return <Navigate to="/player-dashboard" replace />;
  }

  return children;
}

export default PublicOnlyRoute;