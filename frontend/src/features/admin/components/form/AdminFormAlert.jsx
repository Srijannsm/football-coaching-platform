function AdminFormAlert({ message }) {
    if (!message) return null;

    return (
        <div
            className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300"
            role="alert"
        >
            {message}
        </div>
    );
}

export default AdminFormAlert;