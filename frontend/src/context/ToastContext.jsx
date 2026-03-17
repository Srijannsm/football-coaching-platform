import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function showToast(message, type = "info", duration = 4000) {
    const id = Date.now() + Math.random();

    const newToast = {
      id,
      message,
      type,
    };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed top-4 left-1/2 z-[9999] flex w-full max-w-md -translate-x-1/2 flex-col gap-3 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-enter pointer-events-auto flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md ${
              toast.type === "success"
                ? "border-green-400/30 bg-green-500/95 text-white"
                : toast.type === "error"
                ? "border-red-400/30 bg-red-500/95 text-white"
                : "border-white/10 bg-neutral-900/95 text-white"
            }`}
          >
            <div className="flex min-w-0 items-start gap-3">
              {/* <span className="mt-0.5 text-base">
                {toast.type === "success"
                  ? "✅"
                  : toast.type === "error"
                  ? "❌"
                  : "ℹ️"}
              </span> */}

              <p className="text-sm font-medium leading-6 break-words">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-full px-2 py-1 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Close toast"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider");
  }

  return context;
}