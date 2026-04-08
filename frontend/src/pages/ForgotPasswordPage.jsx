import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
import { MailCheck } from "lucide-react";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/forgot-password/", { email });
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.detail || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <SEO title="Forgot Password" noindex />
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 md:p-10">
            <Link
              to="/login"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-app-border bg-app-card px-4 py-2 text-sm font-medium text-app-text-soft transition hover:border-brand-primary hover:text-app-text"
            >
              <span className="text-base">←</span>
              <span>Back to login</span>
            </Link>

            {submitted ? (
              <div className="flex flex-col items-center text-center py-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary mb-6">
                  <MailCheck size={32} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-app-text">
                  Check your inbox
                </h2>
                <p className="mt-3 text-sm leading-6 text-app-text-soft">
                  If an account with <span className="font-semibold text-app-text">{email}</span> exists,
                  we've sent a password reset link. It will expire in 1 hour.
                </p>
                <p className="mt-4 text-xs text-app-text-muted">
                  Didn't get it? Check your spam folder or{" "}
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="font-semibold text-brand-primary hover:text-app-text"
                  >
                    try again
                  </button>
                  .
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
                    Password Reset
                  </p>
                  <h2 className="text-3xl font-bold tracking-tight text-app-text">
                    Forgot your password?
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-app-text-soft">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    label="Email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your email"
                    required
                  />

                  <Button type="submit" loading={loading} disabled={loading} fullWidth>
                    Send reset link
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-app-text-soft">
                  Remembered it?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-brand-primary hover:text-app-text"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
