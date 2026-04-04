import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

function RegisterSuccessPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-md rounded-2xl border border-app-border bg-app-card p-10 shadow-[var(--shadow-soft)] text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                    <Mail size={32} />
                </div>
                <h2 className="text-2xl font-bold text-app-text">Check your inbox</h2>
                <p className="mt-3 text-sm leading-6 text-app-text-soft">
                    We sent you a verification email. Click the link inside to verify your email address, then you can log in.
                </p>
                <p className="mt-2 text-xs text-app-text-soft">
                    Didn't receive it? Check your spam folder.
                </p>
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

export default RegisterSuccessPage;
