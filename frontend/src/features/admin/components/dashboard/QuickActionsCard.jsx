import { ArrowRight, CalendarPlus2, ClipboardList, FolderPlus, MessageSquareMore } from "lucide-react";
import { Link } from "react-router-dom";
import AdminSectionCard from "../ui/AdminSectionCard";

const actions = [
  {
    label: "Create Program",
    description: "Add a new training program.",
    to: "/admin-dashboard/programs",
    icon: FolderPlus,
    color: "text-app-accent-blue-text bg-app-accent-blue-bg border-app-accent-blue-border",
  },
  {
    label: "Create Session",
    description: "Schedule a new academy session.",
    to: "/admin-dashboard/sessions",
    icon: CalendarPlus2,
    color: "text-app-accent-emerald-text bg-app-accent-emerald-bg border-app-accent-emerald-border",
  },
  {
    label: "Review Bookings",
    description: "Check booking confirmations.",
    to: "/admin-dashboard/bookings",
    icon: ClipboardList,
    color: "text-app-accent-yellow-text bg-app-accent-yellow-bg border-app-accent-yellow-border",
  },
  {
    label: "Manage Enquiries",
    description: "Respond to incoming leads.",
    to: "/admin-dashboard/enquiries",
    icon: MessageSquareMore,
    color: "text-app-accent-violet-text bg-app-accent-violet-bg border-app-accent-violet-border",
  },
];

function QuickActionsCard() {
  return (
    <AdminSectionCard
      title="Quick Actions"
      description="Jump straight into common tasks."
      contentClassName="!p-0"
    >
      <div className="divide-y divide-app-border">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-app-surface-2"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${action.color}`}
              >
                <Icon size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-app-text">
                  {action.label}
                </p>
                <p className="text-xs text-app-text-muted">
                  {action.description}
                </p>
              </div>
              <ArrowRight
                size={15}
                className="shrink-0 text-app-text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-app-text"
              />
            </Link>
          );
        })}
      </div>
    </AdminSectionCard>
  );
}

export default QuickActionsCard;
