import {
  LayoutDashboard,
  Users,
  UserCheck,
  ShieldCheck,
  CalendarRange,
  ClipboardList,
  MessageSquareMore,
  Images,
  Home,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdminSidebar } from "../../hooks/useAdminSidebar";
import AdminSidebarLink from "./AdminSidebarLink";

const navigationItems = [
  {
    label: "Dashboard",
    to: "/admin-dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { label: "Players", to: "/admin-dashboard/players", icon: Users },
  { label: "Coaches", to: "/admin-dashboard/coaches", icon: UserCheck },
  {
    label: "Gallery",
    to: "/admin-dashboard/gallery",
    icon: Images,
  },
  { label: "Programs", to: "/admin-dashboard/programs", icon: ShieldCheck },
  { label: "Sessions", to: "/admin-dashboard/sessions", icon: CalendarRange },
  { label: "Bookings", to: "/admin-dashboard/bookings", icon: ClipboardList },
  {
    label: "Enquiries",
    to: "/admin-dashboard/enquiries",
    icon: MessageSquareMore,
  },
];

function SidebarBody({ collapsed = false, onLinkClick }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleNavigate(path) {
    navigate(path);
    onLinkClick?.();
  }

  function handleLogout() {
    logout();
    navigate("/");
    onLinkClick?.();
  }

  return (
    <div className="flex h-full flex-col text-app-text">
      {/* Top Brand Area */}
      <div className="border-b border-app-border px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => handleNavigate("/")}
            className={`group text-left transition ${collapsed ? "mx-auto" : ""}`}
          >
            <div className="flex items-center gap-3">
              {!collapsed ? (
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary/15 text-sm font-extrabold tracking-wide text-brand-primary ring-1 ring-brand-primary/20">
                  FA
                </div>
              ) : null}

              {!collapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-base font-bold tracking-tight text-app-text transition group-hover:text-brand-primary">
                    Football Academy
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-app-text-muted">
                    Admin Control Center
                  </p>
                </div>
              ) : null}
            </div>
          </button>

          {/* <div className="flex items-center gap-2">
            {mobile ? (
              <button
                type="button"
                onClick={closeMobileSidebar}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-surface-2 text-app-text-muted transition hover:border-brand-primary hover:text-brand-primary"
              >
                <X size={16} />
                <span className="sr-only">Close sidebar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                className="hidden xl:inline-flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-surface-2 text-app-text-muted transition hover:border-brand-primary hover:text-brand-primary"
              >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                <span className="sr-only">Toggle sidebar</span>
              </button>
            )}
          </div> */}
        </div>
      </div>

      {/* Profile */}
      <div className="px-4 py-4">
        {/* <div
          className={`rounded-3xl border border-app-border bg-gradient-to-br from-app-surface-2 to-app-card shadow-sm ${collapsed ? "px-2 py-3" : "px-4 py-4"
            }`}
        >
          {collapsed ? (
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/15 text-sm font-bold text-brand-primary ring-1 ring-brand-primary/20">
                {userInitial}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/15 text-sm font-bold text-brand-primary ring-1 ring-brand-primary/20">
                {userInitial}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-app-text">
                  {displayName}
                </p>
                <p className="mt-1 text-xs text-app-text-muted">
                  Administrator
                </p>
              </div>
            </div>
          )}
        </div> */}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {!collapsed ? (
          <div className="px-2 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-text-muted">
              Workspace
            </p>
          </div>
        ) : null}

        <nav className="space-y-1.5">
          {navigationItems.map((item) => (
            <AdminSidebarLink
              key={item.to}
              {...item}
              collapsed={collapsed}
              onClick={onLinkClick}
            />
          ))}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-app-border px-3 py-4">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleNavigate("/")}
            className={`group flex w-full items-center rounded-2xl border border-app-border bg-app-surface-2 px-3 py-3 text-sm transition hover:border-brand-primary/40 hover:bg-brand-primary/5 ${collapsed ? "justify-center" : "justify-start gap-3"
              }`}
          >
            <Home
              size={18}
              className="text-app-text-muted transition group-hover:text-brand-primary"
            />
            {!collapsed ? (
              <span className="font-medium text-app-text-muted transition group-hover:text-brand-primary">
                View Website
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className={`group flex w-full items-center rounded-2xl border border-red-500/20 bg-red-500/[0.04] px-3 py-3 text-sm transition hover:border-red-500/35 hover:bg-red-500/[0.08] ${collapsed ? "justify-center" : "justify-start gap-3"
              }`}
          >
            <LogOut
              size={18}
              className="text-red-400 transition group-hover:text-red-300"
            />
            {!collapsed ? (
              <span className="font-medium text-red-400 transition group-hover:text-red-300">
                Logout
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminSidebar() {
  const { isSidebarCollapsed, isMobileSidebarOpen, closeMobileSidebar } =
    useAdminSidebar();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden xl:sticky xl:top-0 xl:flex xl:h-screen xl:shrink-0 xl:flex-col xl:border-r xl:border-app-border xl:bg-app-card/95 xl:backdrop-blur ${isSidebarCollapsed ? "xl:w-24" : "xl:w-72"
          }`}
      >
        <SidebarBody collapsed={isSidebarCollapsed} />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={closeMobileSidebar}
            aria-label="Close admin sidebar"
          />

          <aside className="relative h-full w-[88vw] max-w-sm border-r border-app-border bg-app-card/95 shadow-2xl backdrop-blur-xl">
             <SidebarBody onLinkClick={closeMobileSidebar} />
          </aside>
        </div>
      ) : null}
    </>
  );
}

export default AdminSidebar;