import { useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import api from "../api/axios";
import Button from "./ui/Button";
import { useToast } from "../hooks/useToast";

function UnverifiedEmailBanner() {
    const { showToast } = useToast();
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    async function handleResend() {
        setSending(true);
        try {
            await api.post("/send-verification/");
            setSent(true);
            showToast("Verification email sent! Check your inbox.", "success");
        } catch (err) {
            const msg = err.response?.data?.detail || "Failed to send verification email.";
            showToast(msg, "error");
        } finally {
            setSending(false);
        }
    }

    if (dismissed) return null;

    return (
        <div className="fixed inset-x-0 top-0 z-40 mx-4 pointer-events-none lg:mx-6">
            <div className="pointer-events-auto mt-[96px] max-w-7xl mx-auto">
                <div className="rounded-[1.5rem] border border-amber-500/30 bg-amber-500/12 px-5 py-3 shadow-[var(--shadow-soft)] backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
                                <AlertTriangle size={16} />
                            </div>
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-400 truncate">
                                Verify your email to unlock all features.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2.5">
                            {sent ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-green-500">
                                    <Check size={14} />
                                    Sent!
                                </span>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResend}
                                    disabled={sending}
                                    loading={sending}
                                >
                                    Resend link
                                </Button>
                            )}

                            <button
                                type="button"
                                onClick={() => setDismissed(true)}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-amber-500/60 transition hover:text-amber-500"
                                title="Dismiss"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UnverifiedEmailBanner;
