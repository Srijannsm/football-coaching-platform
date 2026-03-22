import {
  CalendarRange,
  ClipboardList,
  MessageSquareMore,
  Users,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import AdminPageHeader from "../components/layout/AdminPageHeader";
// import AdminToolbar from "../components/ui/AdminToolbar";
import AdminHeroSummary from "../components/dashboard/AdminHeroSummary";
import AdminStatCard from "../components/ui/AdminStatCard";
import RecentBookingsCard from "../components/dashboard/RecentBookingsCard";
import RecentEnquiriesCard from "../components/dashboard/RecentEnquiriesCard";
import UpcomingSessionsCard from "../components/dashboard/UpcomingSessionsCard";
import QuickActionsCard from "../components/dashboard/QuickActionsCard";
import AdminSectionCard from "../components/ui/AdminSectionCard";
import AdminSkeleton from "../components/ui/AdminSkeleton";
import { useAdminDashboard } from "../hooks/useAdminDashboard";

function AdminDashboardPage() {
  const { data, isLoading, error, refetch } = useAdminDashboard();

  const stats = data?.stats || {};
  const recentBookings = data?.recent_bookings || [];
  const recentEnquiries = data?.recent_enquiries || [];
  const upcomingSessions = data?.upcoming_sessions || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Admin Dashboard"
          description="Monitor academy activity, player growth, and day-to-day operations from one place."
        />

        <AdminSkeleton className="h-44 w-full rounded-3xl" />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminSkeleton className="h-36 w-full rounded-3xl" />
          <AdminSkeleton className="h-36 w-full rounded-3xl" />
          <AdminSkeleton className="h-36 w-full rounded-3xl" />
          <AdminSkeleton className="h-36 w-full rounded-3xl" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AdminSkeleton className="h-80 w-full rounded-3xl" />
          <AdminSkeleton className="h-80 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <AdminPageHeader
        title="Admin Dashboard"
        description="Monitor academy activity, player growth, and day-to-day operations from one place."
        actions={
          <Button variant="outline" onClick={refetch}>
            Refresh Overview
          </Button>
        }
      /> */}

      {error ? <Alert variant="error">{error}</Alert> : null}

      {/* <AdminToolbar
        left={
          <span className="text-sm text-app-text-muted">
            Central overview of players, sessions, bookings, and enquiries
          </span>
        }
        right={
          <Button onClick={refetch}>Sync Latest Data</Button>
        }
      /> */}

      {/* <AdminHeroSummary
        title="Your academy operations are under control."
        description="Track registrations, bookings, enquiries, and session planning with a cleaner SaaS-style management workspace."
        actions={
          <Button onClick={refetch}>Refresh Dashboard</Button>
        }
      /> */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Total Players"
          value={stats.total_players ?? 0}
          helperText="Registered academy accounts"
          icon={Users}
          accent="yellow"
        />

        <AdminStatCard
          title="Upcoming Sessions"
          value={stats.upcoming_sessions ?? 0}
          helperText="Published training sessions"
          icon={CalendarRange}
          accent="blue"
        />

        <AdminStatCard
          title="Total Bookings"
          value={stats.confirmed_bookings ?? 0}
          helperText="Bookings across programs"
          icon={ClipboardList}
          accent="emerald"
        />

        <AdminStatCard
          title="New Enquiries"
          value={stats.new_enquiries ?? 0}
          helperText="Leads waiting for action"
          icon={MessageSquareMore}
          accent="purple"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RecentBookingsCard bookings={recentBookings} />
        <RecentEnquiriesCard enquiries={recentEnquiries} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <UpcomingSessionsCard sessions={upcomingSessions} />
        <QuickActionsCard />
      </div>

      <AdminSectionCard
        title="Dashboard Notes"
        description="Reserved for future reporting, analytics, and AI-powered insights."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-app-border bg-app-surface-2 px-4 py-4">
            <p className="text-sm font-semibold text-app-text">
              Operations
            </p>
            <p className="mt-2 text-sm text-app-text-muted">
              Keep published sessions accurate and review booking activity frequently.
            </p>
          </div>

          <div className="rounded-2xl border border-app-border bg-app-surface-2 px-4 py-4">
            <p className="text-sm font-semibold text-app-text">
              Growth
            </p>
            <p className="mt-2 text-sm text-app-text-muted">
              Watch new enquiries and player signups to improve conversion.
            </p>
          </div>

          <div className="rounded-2xl border border-app-border bg-app-surface-2 px-4 py-4">
            <p className="text-sm font-semibold text-app-text">
              Future AI
            </p>
            <p className="mt-2 text-sm text-app-text-muted">
              This space can later show trends, lead quality signals, and session recommendations.
            </p>
          </div>
        </div>
      </AdminSectionCard>
    </div>
  );
}

export default AdminDashboardPage;