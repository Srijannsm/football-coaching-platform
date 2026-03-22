import { Menu, Bell, PanelLeftClose } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdminSidebar } from "../../hooks/useAdminSidebar";
import ThemeToggle from "../../../../components/ThemeToggle";

const routeMeta = {
  "/admin-dashboard": {
    title: "Dashboard",
    description: "Track academy performance and daily operations.",
  },
  "/admin-dashboard/players": {
    title: "Players",
    description: "Manage registered players and account status.",
  },
  "/admin-dashboard/programs": {
    title: "Programs",
    description: "Create and control academy training programs.",
  },
  "/admin-dashboard/sessions": {
    title: "Sessions",
    description: "Plan, publish, and manage training sessions.",
  },
  "/admin-dashboard/bookings": {
    title: "Bookings",
    description: "Review player bookings and update status.",
  },
  "/admin-dashboard/enquiries": {
    title: "Enquiries",
    description: "Handle incoming leads and communication notes.",
  },
};

function AdminTopbar() {
  const location = useLocation();
  const { user } = useAuth();
  const { toggleSidebarCollapsed, openMobileSidebar } = useAdminSidebar();

  const meta = routeMeta[location.pathname] || routeMeta["/admin-dashboard"];
  const displayName =
    user?.first_name?.trim() || user?.username || user?.email || "Admin";

  return (
    <header className="sticky top-0 z-30 border-b border-app-border bg-app-card/85 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={openMobileSidebar}
            className="inline-flex rounded-2xl border border-app-border bg-app-surface-2 p-2 text-app-text-muted transition hover:border-brand-primary hover:text-brand-primary xl:hidden"
          >
            <Menu size={18} />
            <span className="sr-only">Open sidebar</span>
          </button>

          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="hidden rounded-2xl border border-app-border bg-app-surface-2 p-2 text-app-text-muted transition hover:border-brand-primary hover:text-brand-primary xl:inline-flex"
          >
            <PanelLeftClose size={18} />
            <span className="sr-only">Toggle sidebar</span>
          </button>

          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-app-text">
              {meta.title}
            </p>
            <p className="truncate text-sm text-app-text-muted">
              {meta.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-2xl border border-app-border bg-app-surface-2 p-2 text-app-text-muted transition hover:border-brand-primary hover:text-brand-primary"
          >
            <Bell size={18} />
            <span className="sr-only">Notifications</span>
          </button>

          <div className="hidden rounded-2xl border border-app-border bg-app-surface-2 px-4 py-2 sm:block">
            <p className="text-sm font-medium text-app-text">{displayName}</p>
            <p className="text-xs text-app-text-muted">Admin account</p>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;