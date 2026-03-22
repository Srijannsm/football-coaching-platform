import { useCallback, useMemo, useRef, useState } from "react";
import { ToastContext } from "./toast-context";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, [])

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    toastIdRef.current += 1;
    const id = toastIdRef.current;

    const newToast = {
      id,
      message,
      type,
    };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-enter pointer-events-auto flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md ${toast.type === "success"
              ? "border-green-400/30 bg-green-500/95 text-app-text"
              : toast.type === "error"
                ? "border-red-400/30 bg-red-500/95 text-app-text"
                : "bg-app-border bg-neutral-900/95 text-app-text"
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
              className="shrink-0 rounded-full px-2 py-1 text-sm text-app-text/80 transition hover:bg-white/10 hover:text-app-text"
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
