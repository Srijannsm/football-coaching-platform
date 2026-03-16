import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TrainingSessionsPage from "./pages/TrainingSessionsPage";
import SessionDetailPage from "./pages/SessionDetailPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import PlayerDashboardPage from "./pages/PlayerDashboardPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/training-sessions" element={<TrainingSessionsPage />} />
            <Route path="/training-sessions/:id" element={<SessionDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/player-dashboard" element={<PlayerDashboardPage />} />
            <Route path="/player-profile" element={<PlayerProfilePage />} />
          </Routes>
        </BrowserRouter>
    </>
  );
}

export default App;