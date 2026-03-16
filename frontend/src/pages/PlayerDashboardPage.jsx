import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

function PlayerDashboardPage() {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function fetchDashboard() {
        try {
            setError("");
            const response = await api.get("/bookings/dashboard/");
            setDashboard(response.data);
        } catch (err) {
            console.error("Failed to load dashboard:", err);

            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }

            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else {
                setError("Failed to load player dashboard.");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white">
                <Navbar />
                <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
                    <EmptyState
                        title="Loading dashboard..."
                        description="Please wait while we load your football academy activity."
                    />
                </div>
            </div>
        );
    }

    if (error || !dashboard) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white">
                <Navbar />
                <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
                    <EmptyState
                        title="Player Dashboard"
                        description={error || "Unable to load dashboard."}
                        action={
                            <Link to="/training-sessions">
                                <Button className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300">
                                    Browse Sessions
                                </Button>
                            </Link>
                        }
                        className="border-red-500/20"
                    />
                </div>
            </div>
        );
    }

    const { user, stats, next_booking, recent_bookings } = dashboard;

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <section className="border-b border-white/10 bg-gradient-to-b from-neutral-900 to-neutral-950">
                <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
                    <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
                        Player Dashboard
                    </p>

                    <h1 className="text-4xl font-extrabold md:text-5xl">
                        Welcome{user?.first_name ? `, ${user.first_name}` : ""}
                    </h1>

                    <p className="mt-4 max-w-2xl text-lg leading-8 text-neutral-300">
                        Track your bookings, check your next session, and manage your football academy journey from one place.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link to="/training-sessions">
                            <Button className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300">
                                Browse Sessions
                            </Button>
                        </Link>

                        <Link to="/my-bookings">
                            <Button
                                variant="outline"
                                className="rounded-full border-white/10 bg-transparent text-white hover:border-yellow-400 hover:text-yellow-400"
                            >
                                My Bookings
                            </Button>
                        </Link>

                        <Link to="/player-profile">
                            <Button
                                variant="outline"
                                className="rounded-full border-white/10 bg-transparent text-white hover:border-yellow-400 hover:text-yellow-400"
                            >
                                Edit Profile
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
                    <StatCard label="Total Bookings" value={stats.total_bookings} />
                    <StatCard label="Upcoming" value={stats.upcoming_bookings} />
                    <StatCard label="Confirmed" value={stats.confirmed_bookings} />
                    <StatCard label="Cancelled" value={stats.cancelled_bookings} />
                    <StatCard label="Attended" value={stats.attended_sessions} />
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-14 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
                <Card className="border-white/10 bg-white/5 shadow-xl backdrop-blur">
                    <CardContent className="p-6">
                        <h2 className="text-2xl font-extrabold text-white">Next Session</h2>

                        {next_booking ? (
                            <div className="mt-6 space-y-4">
                                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
                                    <p className="text-sm font-semibold uppercase tracking-wide text-yellow-400">
                                        {next_booking.program_title}
                                    </p>

                                    <div className="mt-4 space-y-3 text-sm text-neutral-300">
                                        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                                            <span className="text-neutral-400">Coach</span>
                                            <span className="text-right font-semibold text-white">
                                                {next_booking.coach_full_name}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                                            <span className="text-neutral-400">Date</span>
                                            <span className="text-right font-semibold text-white">
                                                {next_booking.session_date}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                                            <span className="text-neutral-400">Time</span>
                                            <span className="text-right font-semibold text-white">
                                                {next_booking.start_time} - {next_booking.end_time}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-neutral-400">Location</span>
                                            <span className="text-right font-semibold text-white">
                                                {next_booking.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Link to="/my-bookings">
                                    <Button
                                        variant="outline"
                                        className="rounded-full border-white/10 bg-transparent text-white hover:border-yellow-400 hover:text-yellow-400"
                                    >
                                        View All My Bookings
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="mt-6 rounded-2xl border border-white/10 bg-neutral-900/70 p-6">
                                <p className="text-neutral-300">
                                    You have no upcoming sessions right now.
                                </p>
                                <Link to="/training-sessions">
                                    <Button className="mt-4 rounded-full bg-yellow-400 text-black hover:bg-yellow-300">
                                        Book a Session
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-white/10 bg-white/5 shadow-xl backdrop-blur">
                    <CardContent className="p-6">
                        <h2 className="text-2xl font-extrabold text-white">Recent Bookings</h2>

                        {recent_bookings?.length ? (
                            <div className="mt-6 space-y-4">
                                {recent_bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="rounded-2xl border border-white/10 bg-neutral-900/70 p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-white">
                                                    {booking.program_title}
                                                </h3>
                                                <p className="mt-1 text-sm text-neutral-400">
                                                    {booking.session_date} • {booking.start_time}
                                                </p>
                                            </div>

                                            <StatusBadge status={booking.status} />
                                        </div>

                                        <div className="mt-3 text-sm text-neutral-300">
                                            <p>Coach: {booking.coach_full_name}</p>
                                            <p>Location: {booking.location}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-6 rounded-2xl border border-white/10 bg-neutral-900/70 p-6">
                                <p className="text-neutral-300">No bookings yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

export default PlayerDashboardPage;