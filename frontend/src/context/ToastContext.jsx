import { useCallback, useMemo, useRef, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
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

      <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-2.5">
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          const Icon = isSuccess ? CheckCircle : isError ? XCircle : Info;

          return (
            <div
              key={toast.id}
              className={`toast-enter pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md ${
                isSuccess
                  ? "border-green-500/30 bg-neutral-900/95 text-white"
                  : isError
                    ? "border-red-500/30 bg-neutral-900/95 text-white"
                    : "border-neutral-700/40 bg-neutral-900/95 text-white"
              }`}
            >
              <Icon
                size={18}
                className={`mt-0.5 shrink-0 ${
                  isSuccess ? "text-green-400" : isError ? "text-red-400" : "text-blue-400"
                }`}
              />

              <p className="min-w-0 flex-1 text-sm font-medium leading-6 break-words">
                {toast.message}
              </p>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded-full p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
