import { Link } from "react-router-dom";
import { usePlayerProfile } from "../hooks/usePlayerProfile";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import { Card, CardContent } from "../components/ui/Card";

function SectionHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
            {eyebrow}
          </p>
        ) : null}

        <h2 className="text-2xl font-black tracking-tight text-app-text md:text-3xl">
          {title}
        </h2>

        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-app-text-soft md:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

function StatCard({ label, value, helper }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm font-medium text-app-text-soft">{label}</p>
        <h3 className="mt-2 text-2xl font-black tracking-tight text-app-text">
          {value}
        </h3>
        {helper ? (
          <p className="mt-2 text-sm leading-6 text-app-text-soft">{helper}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function InfoGridItem({ label, value }) {
  return (
    <div className="rounded-[1rem] border border-app-border bg-app-surface/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-app-text-soft">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-app-text">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function MiniInfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-app-text-soft">{label}</span>
      <span className="text-right text-sm font-semibold text-app-text">
        {value || "Not provided"}
      </span>
    </div>
  );
}

function ProfileBadge({ children }) {
  if (!children) return null;

  return (
    <span className="inline-flex items-center rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
      {children}
    </span>
  );
}

function ChecklistItem({ done, children }) {
  return (
    <div className="flex items-start gap-3 rounded-[1rem] border border-app-border bg-app-surface/60 p-3">
      <div
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done
            ? "bg-brand-primary text-white"
            : "border border-app-border bg-app-card text-app-text-soft"
          }`}
      >
        {done ? "✓" : ""}
      </div>
      <p className="text-sm leading-6 text-app-text">{children}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-64 animate-pulse rounded-[1.75rem] bg-app-card" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-28 animate-pulse rounded-[1.25rem] bg-app-card" />
        <div className="h-28 animate-pulse rounded-[1.25rem] bg-app-card" />
        <div className="h-28 animate-pulse rounded-[1.25rem] bg-app-card" />
        <div className="h-28 animate-pulse rounded-[1.25rem] bg-app-card" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="h-72 animate-pulse rounded-[1.25rem] bg-app-card" />
          <div className="h-56 animate-pulse rounded-[1.25rem] bg-app-card" />
          <div className="h-56 animate-pulse rounded-[1.25rem] bg-app-card" />
        </div>
        <div className="space-y-6">
          <div className="h-72 animate-pulse rounded-[1.25rem] bg-app-card" />
          <div className="h-72 animate-pulse rounded-[1.25rem] bg-app-card" />
          <div className="h-48 animate-pulse rounded-[1.25rem] bg-app-card" />
        </div>
      </div>
    </div>
  );
}

function PlayerProfileViewPage() {
  const {
    profile,
    isLoading,
    error,
    refetch,
    completion,
    completionItems,
    heroSummary,
    initials,
    formatPreferredFoot,
  } = usePlayerProfile();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <EmptyState
        title="Profile Error"
        description={error}
        action={
          <div className="flex flex-wrap gap-3">
            <Button onClick={refetch}>Try Again</Button>
            <Link to="/player-dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        }
      />
    );
  }

  if (!profile) {
    return (
      <EmptyState
        title="Profile not found"
        description="We could not load your player profile."
        action={
          <Link to="/player-dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-brand-primary/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),rgba(255,255,255,0.00))]">
        <CardContent className="p-6 md:p-8 lg:p-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-center">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
                Player Profile
              </p>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt="Player profile"
                    loading="lazy"
                    decoding="async"
                    className="h-24 w-24 rounded-[1.5rem] object-cover ring-4 ring-brand-primary/10"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-brand-primary/10 text-3xl font-black text-brand-primary ring-4 ring-brand-primary/10">
                    {initials}
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="text-3xl font-black tracking-tight text-app-text md:text-4xl">
                    {profile.first_name || profile.last_name
                      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                      : "Your Profile"}
                  </h2>

                  <p className="mt-3 max-w-3xl text-base leading-7 text-app-text-soft md:text-lg md:leading-8">
                    {heroSummary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <ProfileBadge>{profile.primary_position}</ProfileBadge>
                    <ProfileBadge>
                      {profile.preferred_foot
                        ? formatPreferredFoot(profile.preferred_foot)
                        : ""}
                    </ProfileBadge>
                    <ProfileBadge>
                      {profile.age ? `${profile.age} yrs` : ""}
                    </ProfileBadge>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/player-dashboard/profile/edit">
                  <Button>Edit Profile</Button>
                </Link>

                <Link to="/player-dashboard/bookings">
                  <Button variant="outline">My Bookings</Button>
                </Link>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-app-border bg-app-surface/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-app-text-soft">
                    Profile completion
                  </p>
                  <h3 className="mt-1 text-3xl font-black tracking-tight text-app-text">
                    {completion}%
                  </h3>
                </div>

                <div className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary">
                  Academy Ready
                </div>
              </div>

              <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-app-border">
                <div
                  className="h-full rounded-full bg-brand-primary transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>

              <div className="mt-5 space-y-3">
                {completionItems.slice(0, 3).map((item) => (
                  <ChecklistItem key={item.label} done={item.done}>
                    {item.label}
                  </ChecklistItem>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Preferred Foot"
          value={formatPreferredFoot(profile.preferred_foot)}
          helper="Technical preference"
        />
        <StatCard
          label="Primary Position"
          value={profile.primary_position || "--"}
          helper="Main playing role"
        />
        <StatCard
          label="Height"
          value={profile.height_cm ? `${profile.height_cm} cm` : "--"}
          helper="Physical profile"
        />
        <StatCard
          label="Weight"
          value={profile.weight_kg ? `${profile.weight_kg} kg` : "--"}
          helper="Physical profile"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-black tracking-tight text-app-text">
                Player Snapshot
              </h2>
              <p className="mt-2 text-sm leading-6 text-app-text-soft">
                A quick overview of your academy identity.
              </p>

              <div className="mt-5 divide-y divide-app-border">
                <MiniInfoRow label="Username" value={profile.username} />
                <MiniInfoRow label="Email" value={profile.email} />
                <MiniInfoRow label="Phone Number" value={profile.phone_number} />
                <MiniInfoRow label="Age" value={profile.age} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-black tracking-tight text-app-text">
                Complete Your Profile
              </h2>
              <p className="mt-2 text-sm leading-6 text-app-text-soft">
                Stronger player data leads to better personalization later.
              </p>

              <div className="mt-5 space-y-3">
                {completionItems.map((item) => (
                  <ChecklistItem key={item.label} done={item.done}>
                    {item.label}
                  </ChecklistItem>
                ))}
              </div>

              <div className="mt-5">
                <Link to="/player-dashboard/profile/edit">
                  <Button className="w-full">Update Details</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 to-transparent">
            <CardContent className="p-6">
              <h2 className="text-lg font-black tracking-tight text-app-text">
                Quick Actions
              </h2>
              <p className="mt-2 text-sm leading-6 text-app-text-soft">
                Go where players usually need to go next.
              </p>

              <div className="mt-5 space-y-3">
                <Link to="/player-dashboard/profile/edit" className="block">
                  <Button className="w-full">Edit Profile</Button>
                </Link>

                <Link to="/player-dashboard/bookings" className="block">
                  <Button variant="outline" className="w-full">
                    View My Bookings
                  </Button>
                </Link>

                <Link to="/training-sessions" className="block">
                  <Button variant="outline" className="w-full">
                    Browse Sessions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 md:p-7">
              <SectionHeader
                eyebrow="Personal"
                title="Personal Information"
                description="Your main contact and account identity details."
              />

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoGridItem label="First Name" value={profile.first_name} />
                <InfoGridItem label="Last Name" value={profile.last_name} />
                <InfoGridItem label="Email Address" value={profile.email} />
                <InfoGridItem label="Phone Number" value={profile.phone_number} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 md:p-7">
              <SectionHeader
                eyebrow="Football"
                title="Football Details"
                description="Your player-specific information for academy use."
              />

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoGridItem
                  label="Primary Position"
                  value={profile.primary_position}
                />
                <InfoGridItem
                  label="Secondary Position"
                  value={profile.secondary_position}
                />
                <InfoGridItem
                  label="Preferred Foot"
                  value={formatPreferredFoot(profile.preferred_foot)}
                />
                <InfoGridItem label="Age" value={profile.age} />
                <InfoGridItem
                  label="Height"
                  value={profile.height_cm ? `${profile.height_cm} cm` : ""}
                />
                <InfoGridItem
                  label="Weight"
                  value={profile.weight_kg ? `${profile.weight_kg} kg` : ""}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-brand-primary/20 bg-gradient-to-r from-brand-primary/5 via-transparent to-brand-primary/10">
            <CardContent className="p-6 md:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                    Future Ready
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-app-text">
                    Keep your profile match-ready
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-app-text-soft">
                    Complete player details help the platform support better
                    UX today and prepare for future features like training
                    recommendations, player insights, and smarter dashboard
                    experiences.
                  </p>
                </div>

                <div className="shrink-0">
                  <Link to="/player-dashboard/profile/edit">
                    <Button>Edit Profile</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PlayerProfileViewPage;