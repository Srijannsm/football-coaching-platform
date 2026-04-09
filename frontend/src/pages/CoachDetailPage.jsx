import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEO, { buildCoachSchema } from "../components/SEO";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { Card, CardContent } from "../components/ui/Card";
import { getCoachProfile } from "../services/coachService";
import { getErrorMessage } from "../utils/getErrorMessage";
import { Award, Briefcase, Star, CalendarDays } from "lucide-react";

function getCoachName(coach) {
  return (
    coach?.full_name ||
    [coach?.first_name, coach?.last_name].filter(Boolean).join(" ") ||
    coach?.username ||
    "Coach"
  );
}

function DetailChip({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
        <Icon size={15} />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-app-text-muted">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-app-text">{value}</p>
      </div>
    </div>
  );
}

function CoachDetailPage() {
  const { id } = useParams();
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCoachProfile(id);
        setCoach(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(getErrorMessage(err, "Failed to load coach profile."));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const name = coach ? getCoachName(coach) : "";

  if (loading) {
    return (
      <div className="app-shell flex min-h-screen flex-col bg-app-bg">
        <Navbar />
        <main className="flex-1 pt-20">
          <section className="border-b border-app-border bg-app-surface/70">
            <div className="mx-auto max-w-5xl px-6 py-6 lg:px-10 lg:py-8">
              <div className="mb-4 h-8 w-28 animate-pulse rounded-full bg-app-surface-2" />
              <div className="flex items-center gap-6">
                <div className="h-28 w-28 animate-pulse rounded-2xl bg-app-surface-2" />
                <div className="space-y-3">
                  <div className="h-3 w-24 animate-pulse rounded bg-app-surface-2" />
                  <div className="h-8 w-52 animate-pulse rounded-xl bg-app-surface-2" />
                  <div className="h-4 w-36 animate-pulse rounded bg-app-surface-2" />
                </div>
              </div>
            </div>
          </section>
          <section className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              <div className="space-y-3 rounded-2xl border border-app-border bg-app-card p-8">
                <div className="h-5 w-16 animate-pulse rounded bg-app-surface-2" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 animate-pulse rounded bg-app-surface-2" style={{ width: `${70 + (i % 3) * 10}%` }} />
                ))}
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-2xl bg-app-surface-2" />
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || error) {
    return (
      <div className="app-shell flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-6 pt-20">
          <EmptyState
            title={notFound ? "Coach not found" : "Something went wrong"}
            description={
              notFound
                ? "This coach profile doesn't exist or is no longer active."
                : error
            }
            action={
              <Link to="/coaches">
                <Button>All Coaches</Button>
              </Link>
            }
          />
        </main>
        <Footer />
      </div>
    );
  }

  const coachUrl = `${window.location.origin}/coaches/${coach.id}`;
  const coachName = getCoachName(coach);
  const coachSchema = buildCoachSchema({ coach, url: coachUrl });

  return (
    <div className="app-shell flex min-h-screen flex-col bg-app-bg">
      <SEO
        title={coachName}
        description={coach.bio ? coach.bio.slice(0, 160) : `${coachName} — professional football coach at Football Academy. ${coach.coaching_level || ""} ${coach.years_experience ? `${coach.years_experience} years experience.` : ""}`}
        canonical={coachUrl}
        type="profile"
        jsonLd={[coachSchema]}
      />
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="border-b border-app-border bg-app-surface/70">
          <div className="mx-auto max-w-5xl px-6 py-6 lg:px-10 lg:py-8">
            <Link
              to="/coaches"
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-app-border bg-app-card px-3 py-1.5 text-sm font-medium text-app-text-soft transition hover:border-brand-primary hover:text-app-text"
            >
              <span>←</span>
              <span>All Coaches</span>
            </Link>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              {/* Avatar */}
              {coach.image_url ? (
                <img
                  src={coach.image_url}
                  alt={name}
                  loading="lazy"
                  decoding="async"
                  className="h-20 w-20 rounded-2xl border border-app-border object-cover shadow-soft sm:h-24 sm:w-24"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-brand-primary/20 bg-brand-primary/10 text-3xl font-black text-brand-primary shadow-soft sm:h-24 sm:w-24">
                  {name.slice(0, 1).toUpperCase()}
                </div>
              )}

              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
                  Coach Profile
                </p>
                <h1 className="text-2xl font-black tracking-tight text-app-text sm:text-3xl">
                  {name}
                </h1>
                {coach.coaching_level && (
                  <p className="mt-1.5 text-sm font-medium text-app-text-soft">
                    {coach.coaching_level}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Bio */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <h2 className="text-lg font-bold text-app-text">About</h2>
                <p className="mt-4 text-sm leading-7 text-app-text-soft">
                  {coach.bio?.trim()
                    ? coach.bio
                    : "No bio has been added for this coach yet."}
                </p>

                {coach.specialties?.trim() && (
                  <>
                    <h3 className="mt-8 text-base font-bold text-app-text">
                      Specialties
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-app-text-soft">
                      {coach.specialties}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Info chips */}
            <div className="space-y-3">
              {typeof coach.total_sessions === "number" && (
                <DetailChip
                  icon={CalendarDays}
                  label="Total Sessions"
                  value={`${coach.total_sessions} session${coach.total_sessions !== 1 ? "s" : ""}`}
                />
              )}
              <DetailChip
                icon={Briefcase}
                label="Experience"
                value={
                  coach.years_experience
                    ? `${coach.years_experience} year${coach.years_experience !== 1 ? "s" : ""}`
                    : null
                }
              />
              <DetailChip
                icon={Award}
                label="Coaching Level"
                value={coach.coaching_level || null}
              />
              <DetailChip
                icon={Star}
                label="Specialties"
                value={coach.specialties || null}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default CoachDetailPage;
