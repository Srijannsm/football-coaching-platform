import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
import { useToast } from "../hooks/useToast";
import { ShieldCheck } from "lucide-react";

function ChangePasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (formData.new_password.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await api.post("/change-password/", formData);
      showToast("Password changed successfully.", "success");
      navigate("/player-dashboard/profile");
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to change password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="p-6 md:p-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-app-text">
              Change Password
            </h2>
            <p className="mt-0.5 text-sm text-app-text-soft">
              Update your account password.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="current_password"
            type="password"
            name="current_password"
            label="Current password"
            value={formData.current_password}
            onChange={handleChange}
            placeholder="Enter your current password"
            required
          />

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

          <div className="pt-2">
            <Button type="submit" loading={loading} disabled={loading} fullWidth>
              Update password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default ChangePasswordPage;
