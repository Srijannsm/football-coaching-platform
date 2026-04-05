import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicOnlyRoute from "./auth/PublicOnlyRoute";
import AdminRoute from "./auth/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import WhatsAppButton from "./components/WhatsAppButton";

// Public pages
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const RegisterSuccessPage = lazy(() => import("./pages/RegisterSuccessPage"));
const CoachesPage = lazy(() => import("./pages/CoachesPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const TrainingSessionsPage = lazy(() => import("./pages/TrainingSessionsPage"));
const SessionDetailPage = lazy(() => import("./pages/SessionDetailPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const CoachDetailPage = lazy(() => import("./pages/CoachDetailPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Player dashboard pages
const DashboardLayout = lazy(() =>
  import("./components/layout/DashboardLayout")
);
const PlayerDashboardPage = lazy(() => import("./pages/PlayerDashboardPage"));
const MyBookingsPage = lazy(() => import("./pages/MyBookingsPage"));
const PlayerProfilePage = lazy(() => import("./pages/PlayerProfilePage"));
const EditPlayerProfile = lazy(() => import("./pages/EditPlayerProfile"));
const ChangePasswordPage = lazy(() => import("./pages/ChangePasswordPage"));

// Admin pages
const AdminShell = lazy(() =>
  import("./features/admin/components/layout/AdminShell")
);
const AdminDashboardPage = lazy(() =>
  import("./features/admin/pages/AdminDashboardPage")
);
const AdminPlayersPage = lazy(() =>
  import("./features/admin/pages/AdminPlayersPage")
);
const AdminCoachesPage = lazy(() =>
  import("./features/admin/pages/AdminCoachesPage")
);
const AdminProgramsPage = lazy(() =>
  import("./features/admin/pages/AdminProgramsPage")
);
const AdminSessionsPage = lazy(() =>
  import("./features/admin/pages/AdminSessionsPage")
);
const AdminBookingsPage = lazy(() =>
  import("./features/admin/pages/AdminBookingsPage")
);
const AdminEnquiriesPage = lazy(() =>
  import("./features/admin/pages/AdminEnquiriesPage")
);
const AdminGalleryPage = lazy(() =>
  import("./features/admin/pages/AdminGalleryPage")
);

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-surface">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
    </div>
  );
}

// Renders routes + conditionally shows the WhatsApp button.
// Must be inside BrowserRouter to use useLocation.
function AppContent() {
  const location = useLocation();
  const hideWhatsApp =
    location.pathname.startsWith("/admin-dashboard") ||
    location.pathname.startsWith("/player-dashboard");

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/coaches" element={<CoachesPage />} />
          <Route path="/coaches/:id" element={<CoachDetailPage />} />
          <Route
            path="/training-sessions"
            element={<TrainingSessionsPage />}
          />
          <Route
            path="/training-sessions/:id"
            element={<SessionDetailPage />}
          />

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

          <Route path="/register-success" element={<RegisterSuccessPage />} />

          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="*" element={<NotFoundPage />} />

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
            <Route path="change-password" element={<ChangePasswordPage />} />
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
            <Route path="coaches" element={<AdminCoachesPage />} />
            <Route path="programs" element={<AdminProgramsPage />} />
            <Route path="sessions" element={<AdminSessionsPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="enquiries" element={<AdminEnquiriesPage />} />
            <Route path="gallery" element={<AdminGalleryPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {!hideWhatsApp && <WhatsAppButton />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
