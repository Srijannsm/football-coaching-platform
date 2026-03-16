import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";

function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
      const response = await api.post("/login/", formData);
      const { access, refresh } = response.data;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      navigate("/");
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
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between border-r border-white/10 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black p-12">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              Football Academy
            </p>

            <h1 className="max-w-xl text-5xl font-extrabold leading-tight">
              Welcome back to your training journey.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-neutral-300">
              Log in to manage bookings, explore sessions, and continue building
              your game with structured academy coaching.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <h3 className="mb-2 text-lg font-bold text-white">
                Book Sessions Easily
              </h3>
              <p className="text-sm leading-7 text-neutral-300">
                Browse available training sessions and reserve your place in a
                few clicks.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <h3 className="mb-2 text-lg font-bold text-white">
                Track Your Progress
              </h3>
              <p className="text-sm leading-7 text-neutral-300">
                View your booked sessions, manage cancellations, and stay
                organized as a player.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12 lg:px-10">
          <Card className="w-full max-w-md rounded-3xl border-white/10 bg-white/5 shadow-2xl backdrop-blur">
            <CardContent className="p-8 md:p-10">
              <Link
                to="/"
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                <span className="text-base">←</span>
                <span>Back to home</span>
              </Link>
              <div className="mb-8">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
                  Player Login
                </p>
                <h2 className="text-3xl font-extrabold text-white">Sign in</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-400">
                  Enter your credentials to access your academy account.
                </p>
              </div>

              {error && (
                <div
                  className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  id="username"
                  type="text"
                  name="username"
                  label="Username"
                  labelClassName="text-white font-semibold"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  className="border-white/10 bg-neutral-900 text-white placeholder:text-neutral-500 focus:border-yellow-400 focus:ring-yellow-400/10"
                />

                <Input
                  id="password"
                  type="password"
                  name="password"
                  label="Password"
                  labelClassName="text-white font-semibold"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="border-white/10 bg-neutral-900 text-white placeholder:text-neutral-500 focus:border-yellow-400 focus:ring-yellow-400/10"
                />

                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  fullWidth
                  className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300"
                >
                  Login
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-neutral-400">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-yellow-400 hover:text-yellow-300"
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