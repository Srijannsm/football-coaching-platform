function Alert({ children, variant = "info", className = "" }) {
    const variants = {
        info: "border-blue-500/20 bg-blue-500/10 text-blue-300",
        success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        error: "border-red-500/20 bg-red-500/10 text-red-300",
        warning: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    };

    return (
        <div className={`rounded-2xl border px-5 py-4 ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
}

export default Alert;