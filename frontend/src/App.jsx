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
import DashboardLayout from "./components/layout/DashboardLayout";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicOnlyRoute from "./auth/PublicOnlyRoute";
import AdminRoute from "./auth/AdminRoute";
import AdminShell from "./features/admin/components/layout/AdminShell";
import AdminDashboardPage from "./features/admin/pages/AdminDashboardPage";
import AdminPlayersPage from "./features/admin/pages/AdminPlayersPage";
import AdminProgramsPage from "./features/admin/pages/AdminProgramsPage";
import AdminSessionsPage from "./features/admin/pages/AdminSessionsPage";
import AdminBookingsPage from "./features/admin/pages/AdminBookingsPage";
import AdminEnquiriesPage from "./features/admin/pages/AdminEnquiriesPage";

function App() {
  return (
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
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PlayerDashboardPage />} />
            <Route path="bookings" element={<MyBookingsPage />} />
            <Route path="profile" element={<PlayerProfilePage />} />
            <Route path="profile/edit" element={<EditPlayerProfile />} />
          </Route>

          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <AdminShell />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="players" element={<AdminPlayersPage />} />
            <Route path="programs" element={<AdminProgramsPage />} />
            <Route path="sessions" element={<AdminSessionsPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="enquiries" element={<AdminEnquiriesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;