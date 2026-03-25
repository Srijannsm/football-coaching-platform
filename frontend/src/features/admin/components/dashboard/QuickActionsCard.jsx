import { ArrowRight, CalendarPlus2, ClipboardList, FolderPlus, MessageSquareMore } from "lucide-react";
import { Link } from "react-router-dom";
import AdminSectionCard from "../ui/AdminSectionCard";

const actions = [
  {
    label: "Create Program",
    description: "Add a new training program and prepare it for scheduling.",
    to: "/admin-dashboard/programs",
    icon: FolderPlus,
  },
  {
    label: "Create Session",
    description: "Schedule a new academy session with time, coach, and location.",
    to: "/admin-dashboard/sessions",
    icon: CalendarPlus2,
  },
  {
    label: "Review Bookings",
    description: "Check booking activity, confirmations, and player attendance flow.",
    to: "/admin-dashboard/bookings",
    icon: ClipboardList,
  },
  {
    label: "Manage Enquiries",
    description: "Respond to incoming leads and keep follow-ups organized.",
    to: "/admin-dashboard/enquiries",
    icon: MessageSquareMore,
  },
];

function QuickActionsCard() {
  return (
    <AdminSectionCard
      title="Quick Actions"
      description="Jump straight into the most common academy admin tasks."
    >
      <div className="grid gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.to}
              to={action.to}
              className="group rounded-3xl border border-app-border bg-app-surface-2 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/40 hover:bg-brand-primary-soft/40 hover:shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-app-border bg-app-card text-brand-primary transition-transform duration-200 group-hover:scale-105">
                  <Icon size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-app-text">
                      {action.label}
                    </p>

                    <ArrowRight
                      size={16}
                      className="mt-0.5 shrink-0 text-app-text-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-app-text"
                    />
                  </div>

                  <p className="mt-1 text-sm leading-6 text-app-text-muted">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </AdminSectionCard>
  );
}

export default QuickActionsCard;