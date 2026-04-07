function AdminFormErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div className="rounded-lg border border-app-danger-border bg-app-danger-bg px-4 py-3 text-sm text-app-danger-text" role="alert">
      {message}
    </div>
  );
}

export default AdminFormErrorBanner;
