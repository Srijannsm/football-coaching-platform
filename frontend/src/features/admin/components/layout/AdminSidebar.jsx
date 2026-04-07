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
  Trophy,
  FileText,
  BarChart3,
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
  { label: "Gallery", to: "/admin-dashboard/gallery", icon: Images },
  { label: "Programs", to: "/admin-dashboard/programs", icon: ShieldCheck },
  { label: "Sessions", to: "/admin-dashboard/sessions", icon: CalendarRange },
  { label: "Bookings", to: "/admin-dashboard/bookings", icon: ClipboardList },
  {
    label: "Enquiries",
    to: "/admin-dashboard/enquiries",
    icon: MessageSquareMore,
  },
  { label: "Analytics", to: "/admin-dashboard/analytics", icon: BarChart3 },
  { label: "Audit Log", to: "/admin-dashboard/audit-log", icon: FileText },
];

function SidebarBody({ collapsed = false, onLinkClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName =
    user?.first_name?.trim() ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Admin";
  const userInitial = displayName.charAt(0).toUpperCase();

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
    <div className="flex h-full flex-col bg-app-sidebar-bg">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-app-sidebar-border px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-sm font-bold text-white">
          <Trophy size={18} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-app-sidebar-text">
              Football Academy
            </p>
            <p className="text-xs text-app-sidebar-text-muted">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 admin-sidebar-scroll">
        {!collapsed && (
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-app-sidebar-text-muted">
            Menu
          </p>
        )}
        <nav className="space-y-0.5">
          {navigationItems.map((item) => (
            <AdminSidebarLink
              key={item.to}
              {...item}
              collapsed={collapsed}
              onClick={onLinkClick}
            />
          ))}
        </nav>

        {!collapsed && (
          <>
            <div className="my-4 border-t border-app-sidebar-border" />
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-app-sidebar-text-muted">
              General
            </p>
          </>
        )}
        {collapsed && <div className="my-4 border-t border-app-sidebar-border" />}

        <nav className="space-y-0.5">
          <button
            type="button"
            onClick={() => handleNavigate("/")}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-app-sidebar-text-muted transition-all duration-150 hover:bg-app-sidebar-hover hover:text-app-sidebar-text"
          >
            <Home size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">View Website</span>}
          </button>
        </nav>
      </div>

      {/* User profile */}
      <div className="border-t border-app-sidebar-border p-3">
        {collapsed ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-lg p-2.5 text-app-sidebar-text-muted transition hover:bg-red-500/15 hover:text-red-400"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-app-sidebar-border bg-app-sidebar-hover px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-app-sidebar-text">
                {displayName}
              </p>
              <p className="text-xs text-app-sidebar-text-muted">Administrator</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="shrink-0 rounded-lg p-1.5 text-app-sidebar-text-muted transition hover:bg-red-500/15 hover:text-red-400"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
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
        className={`hidden border-r border-app-sidebar-border xl:sticky xl:top-0 xl:flex xl:h-screen xl:shrink-0 xl:flex-col ${
          isSidebarCollapsed ? "xl:w-20" : "xl:w-64"
        } transition-all duration-300`}
      >
        <SidebarBody collapsed={isSidebarCollapsed} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-app-overlay backdrop-blur-sm"
            onClick={closeMobileSidebar}
            aria-label="Close sidebar"
          />
          <aside className="relative h-full w-64 shadow-2xl">
            <SidebarBody onLinkClick={closeMobileSidebar} />
          </aside>
        </div>
      )}
    </>
  );
}

export default AdminSidebar;
