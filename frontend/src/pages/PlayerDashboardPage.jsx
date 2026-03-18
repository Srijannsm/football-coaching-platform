import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getPlayerDashboard } from "../services/playerDashboardService";
import EmptyState from "../components/ui/EmptyState";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

function PlayerDashboardPage() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function fetchDashboard() {
        try {
            setError("");
            const data = await getPlayerDashboard();
            setDashboard(data);
        } catch (err) {
            console.error("Failed to load dashboard:", err);

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
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
                    <StatCard label="Total Bookings" value={stats?.total_bookings ?? 0} />
                    <StatCard label="Upcoming" value={stats?.upcoming_bookings ?? 0} />
                    <StatCard label="Confirmed" value={stats?.confirmed_bookings ?? 0} />
                    <StatCard label="Cancelled" value={stats?.cancelled_bookings ?? 0} />
                    <StatCard label="Attended" value={stats?.attended_sessions ?? 0} />
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 pb-14 lg:px-10">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <Card className="border-white/10 bg-white/5 shadow-xl backdrop-blur">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-2xl font-extrabold text-white">
                                    Next Session
                                </h2>

                                {next_booking && <StatusBadge status={next_booking.status} />}
                            </div>

                            {next_booking ? (
                                <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
                                    <p className="text-sm font-semibold uppercase tracking-wide text-yellow-400">
                                        {next_booking.program_title}
                                    </p>

                                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
                                            <p className="text-xs uppercase tracking-wide text-neutral-400">
                                                Coach
                                            </p>
                                            <p className="mt-2 font-semibold text-white">
                                                {next_booking.coach_full_name}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
                                            <p className="text-xs uppercase tracking-wide text-neutral-400">
                                                Date
                                            </p>
                                            <p className="mt-2 font-semibold text-white">
                                                {next_booking.session_date}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
                                            <p className="text-xs uppercase tracking-wide text-neutral-400">
                                                Time
                                            </p>
                                            <p className="mt-2 font-semibold text-white">
                                                {next_booking.start_time} - {next_booking.end_time}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
                                            <p className="text-xs uppercase tracking-wide text-neutral-400">
                                                Location
                                            </p>
                                            <p className="mt-2 font-semibold text-white">
                                                {next_booking.location}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <Link to="/my-bookings">
                                            <Button
                                                variant="outline"
                                                className="rounded-full border-white/10 bg-transparent text-white hover:border-yellow-400 hover:text-yellow-400"
                                            >
                                                View All My Bookings
                                            </Button>
                                        </Link>

                                        <Link to="/training-sessions">
                                            <Button className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300">
                                                Book Another Session
                                            </Button>
                                        </Link>
                                    </div>
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
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-2xl font-extrabold text-white">
                                    Recent Bookings
                                </h2>

                                <Link to="/my-bookings" className="text-sm text-yellow-400 hover:text-yellow-300">
                                    View all
                                </Link>
                            </div>

                            {recent_bookings?.length ? (
                                <div className="mt-6 space-y-4">
                                    {recent_bookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="rounded-2xl border border-white/10 bg-neutral-900/70 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="text-lg font-bold text-white">
                                                        {booking.program_title}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-neutral-400">
                                                        {booking.session_date} • {booking.start_time}
                                                    </p>
                                                </div>

                                                <StatusBadge status={booking.status} />
                                            </div>

                                            <div className="mt-4 space-y-1 text-sm text-neutral-300">
                                                <p>Coach: {booking.coach_full_name}</p>
                                                <p>Location: {booking.location}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-6 rounded-2xl border border-white/10 bg-neutral-900/70 p-6">
                                    <p className="text-neutral-300">No bookings yet.</p>

                                    <Link to="/training-sessions">
                                        <Button className="mt-4 rounded-full bg-yellow-400 text-black hover:bg-yellow-300">
                                            Browse Sessions
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}

export default PlayerDashboardPage;