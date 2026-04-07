import { useEffect } from "react";
import { X } from "lucide-react";

function AdminModal({
  open,
  title,
  description,
  children,
  footer = null,
  onClose,
  size = "lg",
  closeOnOverlayClick = true,
}) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClassMap = {
    sm: "max-w-lg",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-5xl",
    full: "max-w-7xl",
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-app-overlay backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Panel */}
      <div
        className={[
          "relative z-[121] flex w-full flex-col overflow-hidden rounded-2xl",
          "border border-app-border bg-app-card shadow-xl",
          "max-h-[min(92vh,860px)]",
          sizeClassMap[size] || sizeClassMap.lg,
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-app-border px-5 py-4 sm:px-6">
          <div>
            {title && (
              <h2
                id="admin-modal-title"
                className="text-base font-semibold text-app-text sm:text-lg"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-app-text-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-app-border text-app-text-muted transition hover:bg-app-surface-2 hover:text-app-text"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto app-scroll px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-app-border bg-app-surface-2/60 px-5 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminModal;
