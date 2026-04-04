import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("loading"); // loading | success | error | expired

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            setStatus("error");
            return;
        }

        api.get("/verify-email/", { params: { token } })
            .then(() => {
                setStatus("success");
            })
            .catch((err) => {
                if (err.response?.status === 410) {
                    setStatus("expired");
                } else {
                    setStatus("error");
                }
            });
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-md rounded-2xl border border-app-border bg-app-card p-10 shadow-[var(--shadow-soft)] text-center">
                {status === "loading" && (
                    <>
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/10">
                            <Loader2 size={32} className="animate-spin text-brand-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-app-text">Verifying your email...</h2>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-app-text">Email verified!</h2>
                        <p className="mt-3 text-sm leading-6 text-app-text-soft">
                            Your email has been verified. You can now book sessions and access all features.
                        </p>
                    </>
                )}

                {status === "expired" && (
                    <>
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                            <Mail size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-app-text">Link expired</h2>
                        <p className="mt-3 text-sm leading-6 text-app-text-soft">
                            This verification link has expired. Please log in and request a new one.
                        </p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                            <XCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-app-text">Verification failed</h2>
                        <p className="mt-3 text-sm leading-6 text-app-text-soft">
                            Something went wrong while verifying your email. Please try again.
                        </p>
                    </>
                )}

                <div className="mt-8 flex flex-col gap-3">
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-black transition hover:bg-brand-primary-hover"
                    >
                        Go to Login
                    </Link>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center rounded-full border border-app-border bg-app-surface px-6 py-3 text-sm font-medium text-app-text transition hover:border-brand-primary hover:text-brand-primary"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmailPage;
