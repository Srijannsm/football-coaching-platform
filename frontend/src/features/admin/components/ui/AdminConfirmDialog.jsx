import Button from "../../../../components/ui/Button";

function AdminConfirmDialog({
    open,
    title = "Confirm action",
    description = "Are you sure you want to continue?",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    isLoading = false,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-3xl border border-app-border bg-app-card p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-app-text">{title}</h3>
                <p className="mt-2 text-sm text-app-text-muted">{description}</p>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                        {cancelLabel}
                    </Button>

                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        loading={isLoading}
                        loadingText="Deleting..."
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default AdminConfirmDialog;