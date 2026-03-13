import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TrainingSessionsPage from "./pages/TrainingSessionsPage";
import MyBookingsPage from "./pages/MyBookingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TrainingSessionsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;