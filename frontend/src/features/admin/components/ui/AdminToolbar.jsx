function AdminToolbar({ left, right, className = "" }) {
  const hasLeft = Boolean(left);
  const hasRight = Boolean(right);

  return (
    <div
      className={`flex flex-wrap items-center gap-3 bg-transparent border-0 rounded-none p-0 shadow-none ${className}`}
    >
      {hasLeft ? (
        <div className="ml-auto flex items-center gap-3">
          {left}
        </div>
      ) : null}

      {hasRight ? (
        <div className="ml-auto flex flex-wrap items-center gap-3">
          {right}
        </div>
      ) : null}
    </div>
  );
}

export default AdminToolbar;