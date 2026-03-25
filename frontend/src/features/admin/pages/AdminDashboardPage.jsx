import {
  CalendarRange,
  ClipboardList,
  MessageSquareMore,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import AdminPageHeader from "../components/layout/AdminPageHeader";
import AdminStatCard from "../components/ui/AdminStatCard";
import RecentBookingsCard from "../components/dashboard/RecentBookingsCard";
import RecentEnquiriesCard from "../components/dashboard/RecentEnquiriesCard";
import UpcomingSessionsCard from "../components/dashboard/UpcomingSessionsCard";
import QuickActionsCard from "../components/dashboard/QuickActionsCard";
import AdminSkeleton from "../components/ui/AdminSkeleton";
import AdminCard from "../components/ui/AdminCard";
import { useAdminDashboard } from "../hooks/useAdminDashboard";

function OverviewChip({ label, value, tone = "default" }) {
  const toneMap = {
    default: "border-app-border bg-app-surface-2 text-app-text",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneMap[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard();

  const stats = data?.stats || {};
  const recentBookings = data?.recent_bookings || [];
  const recentEnquiries = data?.recent_enquiries || [];
  const upcomingSessions = data?.upcoming_sessions_preview || [];

  // ✅ Centralized stat config (NO duplication)
  const statItems = [
    {
      title: "Total Players",
      value: stats.total_players,
      helperText: "Registered academy accounts",
      icon: Users,
      accent: "yellow",
    },
    {
      title: "Upcoming Sessions",
      value: stats.upcoming_sessions,
      helperText: "Published training sessions",
      icon: CalendarRange,
      accent: "blue",
    },
    {
      title: "Total Bookings",
      value: stats.confirmed_bookings,
      helperText: "Bookings across programs",
      icon: ClipboardList,
      accent: "emerald",
    },
    {
      title: "New Enquiries",
      value: stats.new_enquiries,
      helperText: "Leads waiting for action",
      icon: MessageSquareMore,
      accent: "purple",
    },
  ];


  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Admin Dashboard" />

        <AdminSkeleton className="h-52 w-full rounded-3xl" />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AdminSkeleton key={i} className="h-36 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admin Dashboard"
        description="Monitor academy activity, player growth, bookings, enquiries, and daily session operations."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/admin-dashboard/sessions">
              <Button variant="outline">Manage Sessions</Button>
            </Link>
            <Link to="/admin-dashboard/enquiries">
              <Button>Review Enquiries</Button>
            </Link>
          </div>
        }
      />

      {error && <Alert variant="error">{error}</Alert>}


      {/* ✅ Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => (
          <AdminStatCard
            key={item.title}
            title={item.title}
            value={item.value ?? 0}
            helperText={item.helperText}
            icon={item.icon}
            accent={item.accent}
          />
        ))}
      </div>

      {/* ✅ Activity */}
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <RecentBookingsCard bookings={recentBookings} />
          <UpcomingSessionsCard sessions={upcomingSessions} />
        </div>

        <div className="space-y-6">
          <RecentEnquiriesCard enquiries={recentEnquiries} />
          <QuickActionsCard />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;