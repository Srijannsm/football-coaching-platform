function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-[1.25rem] border border-app-border bg-app-card shadow-[var(--shadow-premium)] ${className}`}
    >
      {children}
    </div>
  );
}

function CardContent({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export { Card, CardContent };