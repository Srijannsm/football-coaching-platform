import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
import { useToast } from "../hooks/useToast";
import { ShieldCheck, AlertTriangle } from "lucide-react";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ new_password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.new_password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await api.post("/reset-password/", { token, ...formData });
      showToast("Password reset successfully. You can now log in.", "success");
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // No token in URL
  if (!token) {
    return (
      <div className="app-shell">
        <div className="flex min-h-screen items-center justify-center px-6 py-12">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 md:p-10 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-5">
                <AlertTriangle size={28} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-app-text">
                Invalid reset link
              </h2>
              <p className="mt-3 text-sm leading-6 text-app-text-soft">
                This link is missing a reset token. Please request a new password reset.
              </p>
              <Link to="/forgot-password" className="mt-6">
                <Button>Request new link</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 md:p-10">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
                  Password Reset
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-app-text">
                  Set a new password
                </h2>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {error}
                {(error.toLowerCase().includes("expired") || error.toLowerCase().includes("invalid")) && (
                  <span>
                    {" "}
                    <Link to="/forgot-password" className="font-semibold underline hover:no-underline">
                      Request a new one.
                    </Link>
                  </span>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="new_password"
                type="password"
                name="new_password"
                label="New password"
                value={formData.new_password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                required
              />

              <Input
                id="confirm_password"
                type="password"
                name="confirm_password"
                label="Confirm new password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Repeat your new password"
                required
              />

              <Button type="submit" loading={loading} disabled={loading} fullWidth>
                Reset password
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-app-text-soft">
              <Link
                to="/login"
                className="font-semibold text-brand-primary hover:text-app-text"
              >
                Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
