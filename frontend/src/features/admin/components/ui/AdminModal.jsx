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
            if (event.key === "Escape") {
                onClose?.();
            }
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
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

    function handleOverlayClick() {
        if (!closeOnOverlayClick) return;
        onClose?.();
    }

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            aria-describedby={description ? "admin-modal-description" : undefined}
        >
            <div
                className="absolute inset-0 bg-black/55 backdrop-blur-md transition-opacity"
                onClick={handleOverlayClick}
            />

            <div
                className={[
                    "relative z-[121] flex w-full flex-col overflow-hidden rounded-[28px]",
                    "border border-app-border bg-app-card shadow-[0_24px_80px_rgba(0,0,0,0.28)]",
                    "max-h-[min(92vh,900px)]",
                    "animate-[modalEnter_180ms_ease-out]",
                    sizeClassMap[size] || sizeClassMap.lg,
                ].join(" ")}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="relative border-b border-app-border bg-app-card/95 px-5 py-4 sm:px-6 sm:py-5">
                    <div className="pr-12">
                        <h2
                            id="admin-modal-title"
                            className="text-lg font-semibold tracking-tight text-app-text sm:text-xl"
                        >
                            {title}
                        </h2>

                        {description ? (
                            <p
                                id="admin-modal-description"
                                className="mt-1.5 max-w-2xl text-sm leading-6 text-app-text-muted"
                            >
                                {description}
                            </p>
                        ) : null}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className={[
                            "absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl",
                            "border border-app-border bg-app-surface-2 text-app-text-muted",
                            "transition duration-200 hover:border-brand-primary/30 hover:bg-brand-primary-soft hover:text-app-text",
                            "focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
                        ].join(" ")}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                    {children}
                </div>

                {footer ? (
                    <div className="border-t border-app-border bg-app-surface-2/50 px-5 py-4 sm:px-6">
                        {footer}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default AdminModal;