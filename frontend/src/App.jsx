import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TrainingSessionsPage from "./pages/TrainingSessionsPage";
import SessionDetailPage from "./pages/SessionDetailPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import PlayerDashboardPage from "./pages/PlayerDashboardPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import EditPlayerProfile from "./pages/EditPlayerProfile";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";

function App() {
  return (
    <>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/training-sessions" element={<TrainingSessionsPage />} />
            <Route path="/training-sessions/:id" element={<SessionDetailPage />} />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />

            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />

            <Route
              path="/player-dashboard"
              element={
                <ProtectedRoute>
                  <PlayerDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/player-profile"
              element={
                <ProtectedRoute>
                  <PlayerProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-player-profile"
              element={
                <ProtectedRoute>
                  <EditPlayerProfile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </>
  );
}

export default App;