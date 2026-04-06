/**
 * Tests for auth route guards: ProtectedRoute, AdminRoute, PublicOnlyRoute.
 *
 * We mock `useAuth` so tests run without a real server or React context tree.
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi, describe, it, expect } from "vitest";

// ── mock useAuth ──────────────────────────────────────────────────────────────
vi.mock("../hooks/useAuth");
import { useAuth } from "../hooks/useAuth";

// ── components under test ────────────────────────────────────────────────────
import ProtectedRoute from "../auth/ProtectedRoute";
import AdminRoute from "../auth/AdminRoute";
import PublicOnlyRoute from "../auth/PublicOnlyRoute";

// ── helpers ───────────────────────────────────────────────────────────────────
function renderWithRouter(ui, { initialEntries = ["/"] } = {}) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}

// ── ProtectedRoute ─────────────────────────────────────────────────────────
describe("ProtectedRoute", () => {
  it("shows loading text while auth is resolving", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isAuthLoading: true });
    renderWithRouter(
      <ProtectedRoute>
        <p>Dashboard</p>
      </ProtectedRoute>
    );
    expect(screen.getByText(/checking session/i)).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isAuthLoading: false });
    renderWithRouter(
      <ProtectedRoute>
        <p>Dashboard</p>
      </ProtectedRoute>
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("redirects to / when unauthenticated", () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isAuthLoading: false });
    renderWithRouter(
      <Routes>
        <Route
          path="/player-dashboard"
          element={
            <ProtectedRoute>
              <p>Dashboard</p>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<p>Home</p>} />
      </Routes>,
      { initialEntries: ["/player-dashboard"] }
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });
});

// ── AdminRoute ───────────────────────────────────────────────────────────────
describe("AdminRoute", () => {
  it("shows loading text while auth is resolving", () => {
    useAuth.mockReturnValue({ user: null, isAuthenticated: false, isAuthLoading: true });
    renderWithRouter(
      <AdminRoute>
        <p>Admin Panel</p>
      </AdminRoute>
    );
    expect(screen.getByText(/checking admin access/i)).toBeInTheDocument();
  });

  it("renders children when user is admin", () => {
    useAuth.mockReturnValue({
      user: { role: "admin" },
      isAuthenticated: true,
      isAuthLoading: false,
    });
    renderWithRouter(
      <AdminRoute>
        <p>Admin Panel</p>
      </AdminRoute>
    );
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it("redirects unauthenticated user to /login", () => {
    useAuth.mockReturnValue({ user: null, isAuthenticated: false, isAuthLoading: false });
    renderWithRouter(
      <Routes>
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <p>Admin Panel</p>
            </AdminRoute>
          }
        />
        <Route path="/login" element={<p>Login Page</p>} />
      </Routes>,
      { initialEntries: ["/admin-dashboard"] }
    );
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects player (non-admin authenticated) to /", () => {
    useAuth.mockReturnValue({
      user: { role: "player" },
      isAuthenticated: true,
      isAuthLoading: false,
    });
    renderWithRouter(
      <Routes>
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <p>Admin Panel</p>
            </AdminRoute>
          }
        />
        <Route path="/" element={<p>Home</p>} />
      </Routes>,
      { initialEntries: ["/admin-dashboard"] }
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
  });
});

// ── PublicOnlyRoute ──────────────────────────────────────────────────────────
describe("PublicOnlyRoute", () => {
  it("renders children when not authenticated", () => {
    useAuth.mockReturnValue({ user: null, isAuthenticated: false, isAuthLoading: false });
    renderWithRouter(
      <PublicOnlyRoute>
        <p>Login Form</p>
      </PublicOnlyRoute>
    );
    expect(screen.getByText("Login Form")).toBeInTheDocument();
  });

  it("redirects authenticated player to /player-dashboard", () => {
    useAuth.mockReturnValue({
      user: { role: "player" },
      isAuthenticated: true,
      isAuthLoading: false,
    });
    renderWithRouter(
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <p>Login Form</p>
            </PublicOnlyRoute>
          }
        />
        <Route path="/player-dashboard" element={<p>Player Dashboard</p>} />
      </Routes>,
      { initialEntries: ["/login"] }
    );
    expect(screen.getByText("Player Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Login Form")).not.toBeInTheDocument();
  });

  it("redirects authenticated admin to /admin-dashboard", () => {
    useAuth.mockReturnValue({
      user: { role: "admin" },
      isAuthenticated: true,
      isAuthLoading: false,
    });
    renderWithRouter(
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <p>Login Form</p>
            </PublicOnlyRoute>
          }
        />
        <Route path="/admin-dashboard" element={<p>Admin Dashboard</p>} />
      </Routes>,
      { initialEntries: ["/login"] }
    );
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Login Form")).not.toBeInTheDocument();
  });
});
