import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";

function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
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