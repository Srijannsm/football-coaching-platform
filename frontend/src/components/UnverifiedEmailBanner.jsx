import { useState } from "react";
import { MailWarning, Check, X, RefreshCw } from "lucide-react";
import api from "../api/axios";
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
        <div className="fixed inset-x-0 top-0 z-40 px-4 pointer-events-none lg:px-6">
            <div className="pointer-events-auto mt-[88px] max-w-7xl mx-auto">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-2.5 shadow-lg backdrop-blur-xl ring-1 ring-amber-400/10">
                    {/* Left: icon + message */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex shrink-0 h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
                            <MailWarning size={15} />
                            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                            </span>
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 leading-snug">
                                Your email isn't verified
                            </p>
                            <p className="hidden sm:block text-xs text-amber-600/80 dark:text-amber-400/70 truncate">
                                You won't be able to book sessions until you verify your email address.
                            </p>
                        </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex shrink-0 items-center gap-2">
                        {sent ? (
                            <span className="flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
                                <Check size={12} />
                                Email sent
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={sending}
                                className="flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 transition hover:bg-amber-500/25 disabled:opacity-60"
                            >
                                <RefreshCw size={11} className={sending ? "animate-spin" : ""} />
                                {sending ? "Sending…" : "Resend link"}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setDismissed(true)}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-amber-500/50 transition hover:bg-amber-500/10 hover:text-amber-500"
                            aria-label="Dismiss"
                        >
                            <X size={13} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UnverifiedEmailBanner;
