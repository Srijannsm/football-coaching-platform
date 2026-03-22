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
                    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                        ? "bg-brand-primary text-white shadow-[var(--shadow-soft)]"
                        : "text-app-text-muted hover:bg-app-surface-2 hover:text-app-text",
                ].join(" ")
            }
        >
            {Icon ? (
                <Icon
                    size={18}
                    className="shrink-0 transition group-hover:scale-[1.02]"
                />
            ) : null}

            {!collapsed ? <span className="truncate">{label}</span> : null}
        </NavLink>
    );
}

export default AdminSidebarLink;