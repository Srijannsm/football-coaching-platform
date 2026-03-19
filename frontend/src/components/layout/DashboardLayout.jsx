import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import Button from "../ui/Button";

const navigationItems = [
    {
        label: "Overview",
        to: "/player-dashboard",
        end: true,
        icon: "ℹ️",
    },
    {
        label: "Profile",
        to: "/player-dashboard/profile",
        icon: "👨",
    },
    {
        label: "Bookings",
        to: "/player-dashboard/bookings",
        icon: "📖",
    },
];

function SidebarLink({
    to,
    icon,
    children,
    end = false,
    onClick,
    collapsed = true,
}) {
    return (
        <NavLink
            to={to}
            end={end}
            onClick={onClick}
            title={collapsed ? children : undefined}
            className={({ isActive }) =>
                `group flex items-center rounded-[1rem] text-sm font-medium transition ${collapsed
                    ? "justify-center px-3 py-3"
                    : "gap-3 px-4 py-3"
                } ${isActive
                    ? "bg-brand-primary-soft text-app-text"
                    : "text-app-text-soft hover:bg-app-surface-2 hover:text-app-text"
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${isActive
                            ? "text-black"
                            : "bg-app-surface text-app-text-soft group-hover:text-app-text"
                            }`}
                    >
                        {icon}
                    </div>

                    {!collapsed ? <span className="truncate">{children}</span> : null}
                </>
            )}
        </NavLink>
    );
}

function DashboardLayout() {
    const location = useLocation();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [hasHoveredSidebar, setHasHoveredSidebar] = useState(false);
    const autoCollapseDoneRef = useRef(false);

    const pageTitle = useMemo(() => {
        if (location.pathname === "/player-dashboard") return "Dashboard Overview";
        if (location.pathname === "/player-dashboard/profile") return "My Profile";
        if (location.pathname === "/player-dashboard/profile/edit") {
            return "Edit Profile";
        }
        if (location.pathname === "/player-dashboard/bookings") {
            return "My Bookings";
        }
        return "Player Dashboard";
    }, [location.pathname]);

    useEffect(() => {
        if (autoCollapseDoneRef.current) return;
        if (sidebarCollapsed) return;
        if (hasHoveredSidebar) return;

        const timer = setTimeout(() => {
            setSidebarCollapsed(true);
            autoCollapseDoneRef.current = true;
        }, 2000);

        return () => clearTimeout(timer);
    }, [sidebarCollapsed, hasHoveredSidebar]);

    const pageDescription = useMemo(() => {
        if (location.pathname === "/player-dashboard") {
            return "Welcome back. Manage your academy activity, profile, and bookings from one place.";
        }

        if (location.pathname === "/player-dashboard/profile") {
            return "View your personal and football details in one organized place.";
        }

        if (location.pathname === "/player-dashboard/profile/edit") {
            return "Update your player information to keep your academy profile accurate.";
        }

        if (location.pathname === "/player-dashboard/bookings") {
            return "Track your booked training sessions and manage your participation.";
        }

        return "Manage your player account and academy activity.";
    }, [location.pathname]);

    function closeMobileSidebar() {
        setMobileSidebarOpen(false);
    }

    return (
        <div className="app-shell">
            <Navbar />

            <section className="mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6 lg:px-10">
                <div
                    className={`grid gap-6 ${sidebarCollapsed
                        ? "lg:grid-cols-[88px_minmax(0,1fr)]"
                        : "lg:grid-cols-[260px_minmax(0,1fr)]"
                        }`}
                >
                    {/* Desktop Sidebar */}
                    <aside
                        className="hidden lg:block"
                        onMouseEnter={() => setHasHoveredSidebar(true)}
                    >
                        <div className="sticky top-28">
                            <div className="rounded-[1.5rem] border border-app-border bg-app-card p-4 shadow-[var(--shadow-soft)]">
                                <div
                                    className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between gap-3"
                                        }`}
                                >
                                    {!sidebarCollapsed ? (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                                                Player Area
                                            </p>
                                            <h2 className="mt-2 text-xl font-black tracking-tight text-app-text">
                                                Dashboard
                                            </h2>
                                        </div>
                                    ) : (
                                        <div
                                            // className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-black text-brand-primary"
                                            title="Dashboard"
                                        >

                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setSidebarCollapsed((prev) => !prev)}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-app-border bg-app-surface text-sm font-medium text-app-text transition hover:border-brand-primary hover:text-brand-primary"
                                        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                                    >
                                        {sidebarCollapsed ? "→" : "←"}
                                    </button>
                                </div>

                                {!sidebarCollapsed ? (
                                    <p className="mt-4 text-sm leading-6 text-app-text-soft">
                                        Navigate your player workspace with a cleaner, focused layout.
                                    </p>
                                ) : null}

                                <div className="mt-5 space-y-2">
                                    {navigationItems.map((item) => (
                                        <SidebarLink
                                            key={item.to}
                                            to={item.to}
                                            end={item.end}
                                            icon={item.icon}
                                            collapsed={sidebarCollapsed}
                                        >
                                            {item.label}
                                        </SidebarLink>
                                    ))}
                                </div>

                                <div className="mt-5 border-t border-app-border pt-5">
                                    {!sidebarCollapsed ? (
                                        <Link to="/training-sessions">
                                            <Button fullWidth>Browse Sessions</Button>
                                        </Link>
                                    ) : (
                                        <Link
                                            to="/training-sessions"
                                            className="flex justify-center"
                                            title="Browse Sessions"
                                        >
                                            <button
                                                type="button"
                                                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-black shadow-[var(--shadow-soft)] transition hover:bg-brand-primary-hover"
                                            >
                                                +
                                            </button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="min-w-0">
                        {/* Mobile Controls */}
                        <div className="mb-4 lg:hidden">
                            <div className="rounded-[1.25rem] border border-app-border bg-app-card p-3 shadow-[var(--shadow-soft)]">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                                            Dashboard Menu
                                        </p>
                                        <p className="mt-1 text-sm text-app-text-soft">
                                            Navigate your player workspace
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setMobileSidebarOpen((prev) => !prev)}
                                        className="inline-flex items-center rounded-full border border-app-border bg-app-surface px-4 py-2 text-sm font-medium text-app-text transition hover:border-brand-primary hover:text-brand-primary"
                                    >
                                        {mobileSidebarOpen ? "Close" : "Open"}
                                    </button>
                                </div>

                                {mobileSidebarOpen && (
                                    <div className="mt-4 rounded-[1rem] border border-app-border bg-app-surface p-3">
                                        <div className="space-y-2">
                                            {navigationItems.map((item) => (
                                                <SidebarLink
                                                    key={item.to}
                                                    to={item.to}
                                                    end={item.end}
                                                    icon={item.icon}
                                                    onClick={closeMobileSidebar}
                                                >
                                                    {item.label}
                                                </SidebarLink>
                                            ))}
                                        </div>

                                        <div className="mt-4 border-t border-app-border pt-4">
                                            <Link to="/training-sessions" onClick={closeMobileSidebar}>
                                                <Button fullWidth>Browse Sessions</Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Header */}
                        <div className="rounded-[1.5rem] border border-app-border bg-app-card p-6 shadow-[var(--shadow-soft)] md:p-8">
                            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
                                        Player Dashboard
                                    </p>
                                    <h1 className="mt-3 text-3xl font-black tracking-tight text-app-text md:text-4xl">
                                        {pageTitle}
                                    </h1>
                                    <p className="mt-3 max-w-3xl text-sm leading-7 text-app-text-soft md:text-base">
                                        {pageDescription}
                                    </p>
                                </div>

                                {/* <div className="flex flex-wrap gap-3">
                                    <Link to="/player-dashboard/profile">
                                        <Button variant="outline">Profile</Button>
                                    </Link>

                                    <Link to="/player-dashboard/bookings">
                                        <Button variant="outline">Bookings</Button>
                                    </Link>

                                    <Link to="/training-sessions">
                                        <Button>Browse Sessions</Button>
                                    </Link>
                                </div> */}
                            </div>
                        </div>

                        {/* Child Content */}
                        <div className="mt-6">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default DashboardLayout;