import { NavLink } from "react-router-dom";

function AdminSidebarLink({
  to,
  label,
  icon: Icon,
  end = false,
  collapsed = false,
  onClick,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
          isActive
            ? "bg-brand-primary text-white shadow-sm"
            : "text-app-sidebar-text-muted hover:bg-app-sidebar-hover hover:text-app-sidebar-text",
        ].join(" ")
      }
    >
      {Icon ? (
        <Icon size={18} className="shrink-0" />
      ) : null}

      {!collapsed ? <span className="truncate">{label}</span> : null}
    </NavLink>
  );
}

export default AdminSidebarLink;
