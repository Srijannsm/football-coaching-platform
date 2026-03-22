function AdminFormErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {message}
    </div>
  );
}

export default AdminFormErrorBanner;
