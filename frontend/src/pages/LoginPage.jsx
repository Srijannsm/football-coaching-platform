import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import SEO from "../components/SEO";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import { Card, CardContent } from "../components/ui/Card";
import { useToast } from "../hooks/useToast";

function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const { showToast } = useToast();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const fromLocation = location.state?.from;
  const from = fromLocation
    ? `${fromLocation.pathname}${fromLocation.search || ""}`
    : "/player-dashboard";

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login(formData);

      showToast("Login successful.", "success");

      const fallbackRoute =
        loggedInUser?.role === "admin"
          ? "/admin-dashboard"
          : "/player-dashboard";

      // If logged in but not verified, go to dashboard (banner will show)
      // The banner will show since we pass the is_email_verified flag

      navigate(fromLocation ? from : fallbackRoute, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);

      if (err.response?.data) {
        setError("Invalid username or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <SEO title="Sign In" description="Sign in to your Football Academy account to manage bookings and track your player development." noindex />
      <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
        <div className="hidden border-r border-app-border bg-app-surface px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
              Football Academy
            </p>

            <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight text-app-text">
              Welcome back to your training journey.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-app-text-soft">
              Log in to manage bookings, explore sessions, and continue building
              your game with structured academy coaching.
            </p>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardContent className="p-5">
                <h3 className="text-lg font-bold text-app-text">
                  Book sessions easily
                </h3>
                <p className="mt-2 text-sm leading-7 text-app-text-soft">
                  Browse available training sessions and reserve your place in a
                  few clicks.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="text-lg font-bold text-app-text">
                  Track your progress
                </h3>
                <p className="mt-2 text-sm leading-7 text-app-text-soft">
                  View your booked sessions, manage cancellations, and stay
                  organized as a player.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12 lg:px-10">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 md:p-10">
              <Link
                to="/"
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-app-border bg-app-card px-4 py-2 text-sm font-medium text-app-text-soft transition hover:border-brand-primary hover:text-app-text"
              >
                <span className="text-base">←</span>
                <span>Back to home</span>
              </Link>

              <div className="mb-8">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
                  Player Login
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-app-text">
                  Sign in
                </h2>
                <p className="mt-3 text-sm leading-6 text-app-text-soft">
                  Enter your credentials to access your academy account.
                </p>
              </div>

              {error && (
                <div className="mb-6">
                  <Alert variant="error">{error}</Alert>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  id="username"
                  type="text"
                  name="username"
                  label="Username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />

                <div>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    label="Password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    showToggle
                    required
                  />
                  <div className="mt-1.5 text-right">
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-app-text-muted hover:text-brand-primary transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  fullWidth
                >
                  Login
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-app-text-soft">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-brand-primary hover:text-app-text"
                >
                  Register
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;