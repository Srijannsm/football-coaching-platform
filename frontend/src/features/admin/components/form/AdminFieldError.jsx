function AdminFieldError({ message, id }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-app-danger-text">
      {message}
    </p>
  );
}

export default AdminFieldError;
