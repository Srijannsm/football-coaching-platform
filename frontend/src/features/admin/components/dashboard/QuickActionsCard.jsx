import { Link } from "react-router-dom";
import AdminSectionCard from "../ui/AdminSectionCard";

const actions = [
  { label: "Create Program", to: "/admin-dashboard/programs" },
  { label: "Create Session", to: "/admin-dashboard/sessions" },
  { label: "Review Bookings", to: "/admin-dashboard/bookings" },
  { label: "Manage Enquiries", to: "/admin-dashboard/enquiries" },
];

function QuickActionsCard() {
  return (
    <AdminSectionCard
      title="Quick Actions"
      description="Jump straight into common admin tasks."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="rounded-2xl border border-app-border bg-app-surface-2 px-4 py-4 text-sm font-medium text-app-text transition hover:border-brand-primary hover:bg-brand-primary-soft hover:text-brand-primary"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </AdminSectionCard>
  );
}

export default QuickActionsCard;