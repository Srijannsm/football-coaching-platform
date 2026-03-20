import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";

const navigationItems = [
    { label: "Dashboard", to: "/admin-dashboard", end: true },
    { label: "Players", to: "/admin-dashboard/players" },
    { label: "Sessions", to: "/admin-dashboard/sessions" },
    { label: "Bookings", to: "/admin-dashboard/bookings" },
    { label: "Enquiries", to: "/admin-dashboard/enquiries" },
];

function AdminLayout() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="flex min-h-screen">
                <aside className="hidden w-72 border-r border-white/10 bg-slate-900/80 lg:flex lg:flex-col">
                    <div className="border-b border-white/10 px-6 py-5">
                        <button
                            onClick={() => navigate("/")}
                            className="text-left text-xl font-bold tracking-tight text-yellow-400"
                        >
                            Football Academy Admin
                        </button>
                        <p className="mt-1 text-sm text-slate-400">
                            Manage academy operations
                        </p>
                    </div>

                    <nav className="flex-1 space-y-2 px-4 py-6">
                        {navigationItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `block rounded-xl px-4 py-3 text-sm font-medium transition ${isActive
                                        ? "bg-yellow-400 text-black"
                                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="border-t border-white/10 px-4 py-4">
                        <button
                            onClick={handleLogout}
                            className="w-full rounded-xl border border-red-400/30 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                        >
                            Logout
                        </button>
                    </div>
                </aside>

                <div className="flex min-h-screen flex-1 flex-col">
                    <header className="border-b border-white/10 bg-slate-900/60 px-4 py-4 backdrop-blur md:px-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-xl font-semibold text-white">
                                    Admin Dashboard
                                </h1>
                                <p className="text-sm text-slate-400">
                                    Welcome back, {user?.first_name || user?.username}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate("/")}
                                    className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                                >
                                    View Website
                                </button>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 px-4 py-6 md:px-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;