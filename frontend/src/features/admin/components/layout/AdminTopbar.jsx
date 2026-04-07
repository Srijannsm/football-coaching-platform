import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdminSidebar } from "../../hooks/useAdminSidebar";
import ThemeToggle from "../../../../components/ThemeToggle";
import NotificationDropdown from "./NotificationDropdown";

const routeMeta = {
  "/admin-dashboard": {
    title: "Dashboard",
    description: "Track academy performance and daily operations.",
  },
  "/admin-dashboard/players": {
    title: "Players",
    description: "Manage registered players and account status.",
  },
  "/admin-dashboard/coaches": {
    title: "Coaches",
    description: "Manage registered coaches.",
  },
  "/admin-dashboard/gallery": {
    title: "Gallery",
    description: "Manage images and videos.",
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
  "/admin-dashboard/audit-log": {
    title: "Audit Logs",
    // description: "Handle incoming leads and communication notes.",
  },
};

function AdminTopbar() {
  const location = useLocation();
  const { user } = useAuth();
  const { isSidebarCollapsed, toggleSidebarCollapsed, openMobileSidebar } =
    useAdminSidebar();

  const meta = routeMeta[location.pathname] || routeMeta["/admin-dashboard"];
  const displayName =
    user?.first_name?.trim() || user?.username || user?.email || "Admin";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-app-border bg-app-card/95 backdrop-blur-sm">
      <div className="flex w-full items-center justify-between gap-4 px-4 md:px-6">
        {/* Left: Toggle + Page title */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile toggle */}
          <button
            type="button"
            onClick={openMobileSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-app-border text-app-text-muted transition hover:bg-app-surface-2 hover:text-app-text xl:hidden"
          >
            <Menu size={18} />
            <span className="sr-only">Open sidebar</span>
          </button>

          {/* Desktop toggle */}
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-app-border text-app-text-muted transition hover:bg-app-surface-2 hover:text-app-text xl:inline-flex"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </button>

          {/* Divider */}
          <div className="hidden h-5 w-px bg-app-border sm:block" />

          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-app-text sm:text-base">
              {meta.title}
            </h1>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <ThemeToggle />

          {/* User avatar chip */}
          <div className="hidden items-center gap-2.5 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
              {userInitial}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-app-text leading-none">
                {displayName}
              </p>
              <p className="mt-0.5 text-xs text-app-text-muted">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
