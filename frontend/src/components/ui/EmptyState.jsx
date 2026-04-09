import { memo } from "react";

const ICONS = {
  sessions: (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
      <rect x="6" y="10" width="36" height="30" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <path d="M16 6v8M32 6v8M6 22h36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="32" r="2" fill="currentColor" />
      <circle cx="24" cy="32" r="2" fill="currentColor" />
      <circle cx="32" cy="32" r="2" fill="currentColor" />
    </svg>
  ),
  bookings: (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
      <path d="M10 8h28a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2.5" />
      <path d="M16 24l6 6 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  coaches: (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
      <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2.5" />
      <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  gallery: (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
      <rect x="6" y="6" width="36" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="17" cy="17" r="4" stroke="currentColor" strokeWidth="2.5" />
      <path d="M6 32l10-10 8 8 6-6 12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
      <circle cx="22" cy="22" r="14" stroke="currentColor" strokeWidth="2.5" />
      <path d="M32 32l8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 22h8M22 18v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
      <path d="M24 16v10M24 30v2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  empty: (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden="true">
      <rect x="8" y="12" width="32" height="28" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <path d="M16 22h16M16 30h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M8 20h32" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  ),
};

function EmptyState({ title, description, action, className = "", icon }) {
  const iconEl = typeof icon === "string" ? ICONS[icon] : icon ?? ICONS.empty;

  return (
    <div
      className={`rounded-[1.5rem] border border-app-border bg-app-card p-10 text-center shadow-[var(--shadow-soft)] ${className}`}
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-primary">
        {iconEl}
      </div>

      <h2 className="text-xl font-bold text-app-text">{title}</h2>

      {description && (
        <p className="mt-3 text-sm leading-7 text-app-text-soft">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default memo(EmptyState);
