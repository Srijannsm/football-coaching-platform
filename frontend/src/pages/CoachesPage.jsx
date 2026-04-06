import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { Card, CardContent } from "../components/ui/Card";
import { getCoachProfiles } from "../services/coachService";
import { getErrorMessage } from "../utils/getErrorMessage";

function getCoachName(coach) {
    return (
        coach?.full_name ||
        [coach?.first_name, coach?.last_name].filter(Boolean).join(" ") ||
        coach?.username ||
        "Coach"
    );
}

function CoachCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-[1.5rem] border border-app-border bg-app-card shadow-soft">
            <div className="h-28 animate-pulse bg-app-surface-2" />
            <div className="p-6">
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 animate-pulse rounded-2xl bg-app-surface-2" />
                    <div className="flex-1 space-y-3">
                        <div className="h-5 w-40 animate-pulse rounded bg-app-surface-2" />
                        <div className="h-4 w-24 animate-pulse rounded bg-app-surface-2" />
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-app-surface-2" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-app-surface-2" />
                    <div className="h-4 w-full animate-pulse rounded bg-app-surface-2" />
                    <div className="h-4 w-full animate-pulse rounded bg-app-surface-2" />
                </div>
            </div>
        </div>
    );
}

function CoachAvatar({ coach }) {
    const name = getCoachName(coach);

    if (coach.image_url) {
        return (
            <img
                src={coach.image_url}
                alt={name}
                loading="lazy"
                decoding="async"
                className="h-20 w-20 rounded-2xl border border-app-border object-cover shadow-soft"
            />
        );
    }

    return (
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-brand-primary/20 bg-brand-primary/10 text-2xl font-black text-brand-primary shadow-soft">
            {name.slice(0, 1).toUpperCase()}
        </div>
    );
}

function CoachesPage() {
    const [coaches, setCoaches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadCoaches() {
        try {
            setIsLoading(true);
            setError("");
            const data = await getCoachProfiles();
            setCoaches(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(getErrorMessage(err, "Failed to load coach profiles."));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadCoaches();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="app-shell flex min-h-screen flex-col bg-app-bg">
            <Navbar />

            <main className="flex-1 pt-28">
                <section className="border-b border-app-border bg-app-surface/70">
                    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
                        <div className="max-w-3xl">
                            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-brand-primary">
                                Our Coaching Team
                            </p>

                            <h1 className="text-4xl font-black tracking-tight text-app-text sm:text-5xl">
                                Learn from experienced football coaches
                            </h1>

                            <p className="mt-5 text-base leading-8 text-app-text-soft sm:text-lg">
                                Meet the coaches registered on the platform and explore their
                                experience, coaching specialties, and player development focus.
                            </p>

                            {!isLoading && !error ? (
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <div className="rounded-full border border-app-border bg-app-card px-4 py-2 text-sm font-medium text-app-text">
                                        {coaches.length} {coaches.length === 1 ? "Coach" : "Coaches"}
                                    </div>
                                    <div className="rounded-full border border-app-border bg-app-card px-4 py-2 text-sm text-app-text-soft">
                                        Verified platform profiles
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
                    {error ? (
                        <div className="space-y-4">
                            <Alert variant="error">{error}</Alert>
                            <div className="flex justify-center">
                                <Button type="button" onClick={loadCoaches}>Try Again</Button>
                            </div>
                        </div>
                    ) : isLoading ? (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <CoachCardSkeleton key={index} />
                            ))}
                        </div>
                    ) : coaches.length === 0 ? (
                        <EmptyState
                            title="No coaches available yet"
                            description="Coach profiles have not been added yet. Once coaches are registered and published, they will appear here."
                        />
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {coaches.map((coach) => (
                                <Link key={coach.id} to={`/coaches/${coach.id}`} className="group block h-full">
                                <Card
                                    className="h-full overflow-hidden rounded-[1.5rem] border border-app-border bg-app-card shadow-soft transition duration-300 group-hover:-translate-y-1 group-hover:shadow-premium"
                                >
                                    <div className="h-24 bg-gradient-to-r from-brand-primary/12 via-brand-primary/5 to-transparent" />

                                    <CardContent className="relative p-6">
                                        <div className="-mt-14 flex items-start gap-4">
                                            <CoachAvatar coach={coach} />

                                            <div className="min-w-0 pt-10">
                                                <h2 className="truncate text-xl font-bold text-app-text">
                                                    {getCoachName(coach)}
                                                </h2>
                                                <p className="mt-1 text-sm font-medium text-app-text-muted">
                                                    {coach.coaching_level || "Football Coach"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 grid gap-3">
                                            <div className="rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-text-muted">
                                                    Experience
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-app-text">
                                                    {coach.years_experience
                                                        ? `${coach.years_experience} years`
                                                        : "Not specified"}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-text-muted">
                                                    Specialties
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-app-text-soft">
                                                    {coach.specialties || "Not specified"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-text-muted">
                                                Bio
                                            </p>
                                            <p className="mt-2 line-clamp-5 text-sm leading-7 text-app-text-soft">
                                                {coach.bio || "No coach bio has been added yet."}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default CoachesPage;