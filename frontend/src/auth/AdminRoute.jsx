import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function AdminRoute({ children }) {
    const location = useLocation();
    const { user, isAuthenticated, isAuthLoading } = useAuth();

    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <p className="text-sm text-slate-300">Checking admin access...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (user?.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default AdminRoute;