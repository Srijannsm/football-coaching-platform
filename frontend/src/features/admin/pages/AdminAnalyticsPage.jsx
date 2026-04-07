import Alert from "../../../components/ui/Alert";
import AdminPageHeader from "../components/layout/AdminPageHeader";
import AdminSectionCard from "../components/ui/AdminSectionCard";
import AdminSkeleton from "../components/ui/AdminSkeleton";
import AdminEmptyState from "../components/ui/AdminEmptyState";
import BookingsChart from "../components/charts/BookingsChart";
import RevenueChart from "../components/charts/RevenueChart";
import UtilizationChart from "../components/charts/UtilizationChart";
import { useAdminAnalytics } from "../hooks/useAdminAnalytics";

function AdminAnalyticsPage() {
  const { data, isLoading, error } = useAdminAnalytics();

  const bookingsData = data?.bookings_per_week ?? [];
  const revenueData = data?.revenue_per_week ?? [];
  const utilizationData = data?.session_utilization ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <AdminSkeleton className="h-8 w-36 rounded-lg" />
          <AdminSkeleton className="h-5 w-80 rounded-lg" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <AdminSkeleton key={i} className="h-[360px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const hasAnyData =
    bookingsData.length > 0 || revenueData.length > 0 || utilizationData.length > 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Track bookings, revenue, and session utilization trends over the last 12 weeks."
      />

      {error && <Alert variant="error">{error}</Alert>}

      {!hasAnyData ? (
        <AdminEmptyState
          title="No analytics data yet"
          description="Charts will appear once players start booking sessions and payments are processed."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminSectionCard
            title="Bookings per Week"
            description="New bookings over time"
          >
            <BookingsChart data={bookingsData} />
          </AdminSectionCard>

          <AdminSectionCard
            title="Revenue Trend"
            description="Income from completed payments"
          >
            <RevenueChart data={revenueData} />
          </AdminSectionCard>

          <AdminSectionCard
            title="Session Utilization"
            description="Average session fill-rate (color-coded: green >= 70%, yellow 40-70%, red < 40%)"
          >
            <UtilizationChart data={utilizationData} />
          </AdminSectionCard>
        </div>
      )}
    </div>
  );
}

export default AdminAnalyticsPage;
