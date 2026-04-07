import {
  CalendarRange,
  ClipboardList,
  MessageSquareMore,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import AdminStatCard from "../components/ui/AdminStatCard";
import RecentBookingsCard from "../components/dashboard/RecentBookingsCard";
import RecentEnquiriesCard from "../components/dashboard/RecentEnquiriesCard";
import UpcomingSessionsCard from "../components/dashboard/UpcomingSessionsCard";
import QuickActionsCard from "../components/dashboard/QuickActionsCard";
import AdminSkeleton from "../components/ui/AdminSkeleton";
import { useAdminDashboard } from "../hooks/useAdminDashboard";

function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard();

  const stats = data?.stats || {};
  const recentBookings = data?.recent_bookings || [];
  const recentEnquiries = data?.recent_enquiries || [];
  const upcomingSessions = data?.upcoming_sessions_preview || [];

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
      title: "Pending Confirmations",
      value: stats.pending_bookings,
      helperText: "Cash bookings awaiting approval",
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
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <AdminSkeleton className="h-8 w-48 rounded-lg" />
          <AdminSkeleton className="h-9 w-36 rounded-lg" />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AdminSkeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <AdminSkeleton className="h-96 w-full rounded-2xl" />
          <AdminSkeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-app-text sm:text-2xl">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-app-text-muted">
            Monitor academy activity, bookings, enquiries, and sessions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin-dashboard/sessions">
            <Button variant="outline" size="sm">
              Manage Sessions
            </Button>
          </Link>
          <Link to="/admin-dashboard/enquiries">
            <Button size="sm">Review Enquiries</Button>
          </Link>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* Activity grid */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Left column */}
        <div className="space-y-6">
          <RecentBookingsCard bookings={recentBookings} />
          <UpcomingSessionsCard sessions={upcomingSessions} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <RecentEnquiriesCard enquiries={recentEnquiries} />
          <QuickActionsCard />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
