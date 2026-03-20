import Alert from "../../../components/ui/Alert";
import EmptyState from "../../../components/ui/EmptyState";
import Button from "../../../components/ui/Button";
import { Card, CardContent } from "../../../components/ui/Card";
import { useAdminDashboard } from "../hooks/useAdminDashboard";

function StatCard({ label, value }) {
  return (
    <Card className="border border-white/10 bg-white/5 text-white">
      <CardContent className="p-5">
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}

function AdminDashboardPage() {
  const { data, isLoading, error, refetch } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/5 xl:col-span-2" />
          <div className="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load admin dashboard"
        description={error}
        action={
          <Button onClick={refetch}>
            Retry
          </Button>
        }
      />
    );
  }

  const stats = data?.stats || {};
  const recentBookings = data?.recent_bookings || [];
  const recentEnquiries = data?.recent_enquiries || [];
  const upcomingSessions = data?.upcoming_sessions_preview || [];

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Overview</h2>
          <p className="text-sm text-slate-400">
            Quick academy performance and operations snapshot.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Players" value={stats.total_players ?? 0} />
          <StatCard label="Total Coaches" value={stats.total_coaches ?? 0} />
          <StatCard label="Total Bookings" value={stats.total_bookings ?? 0} />
          <StatCard label="New Enquiries" value={stats.new_enquiries ?? 0} />
          <StatCard
            label="Upcoming Sessions"
            value={stats.upcoming_sessions ?? 0}
          />
          <StatCard
            label="Pending Bookings"
            value={stats.pending_bookings ?? 0}
          />
          <StatCard
            label="Active Programs"
            value={stats.active_programs ?? 0}
          />
          <StatCard
            label="Cancelled Sessions"
            value={stats.cancelled_sessions ?? 0}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="border border-white/10 bg-white/5 text-white xl:col-span-2">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Recent Bookings
                </h3>
                <p className="text-sm text-slate-400">
                  Latest player bookings across training sessions.
                </p>
              </div>
            </div>

            {recentBookings.length === 0 ? (
              <Alert type="info" message="No recent bookings found." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-slate-400">
                    <tr>
                      <th className="px-3 py-3 font-medium">Player</th>
                      <th className="px-3 py-3 font-medium">Session</th>
                      <th className="px-3 py-3 font-medium">Date</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-white/5 text-slate-200"
                      >
                        <td className="px-3 py-3">{booking.player_name}</td>
                        <td className="px-3 py-3">{booking.session_title}</td>
                        <td className="px-3 py-3">
                          {booking.session_date || "—"}
                        </td>
                        <td className="px-3 py-3 capitalize">
                          {booking.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/5 text-white">
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-white">
              Recent Enquiries
            </h3>
            <p className="mb-4 text-sm text-slate-400">
              Latest leads coming into the academy.
            </p>

            <div className="space-y-3">
              {recentEnquiries.length === 0 ? (
                <Alert type="info" message="No recent enquiries found." />
              ) : (
                recentEnquiries.map((enquiry) => (
                  <div
                    key={enquiry.id}
                    className="rounded-xl border border-white/10 bg-slate-900/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{enquiry.name}</p>
                        <p className="text-sm text-slate-400">{enquiry.email}</p>
                        <p className="text-sm text-slate-500">
                          {enquiry.program_title || "General enquiry"}
                        </p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize text-slate-200">
                        {enquiry.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border border-white/10 bg-white/5 text-white">
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-white">
              Upcoming Sessions Preview
            </h3>
            <p className="mb-4 text-sm text-slate-400">
              Next available academy sessions and slot usage.
            </p>

            {upcomingSessions.length === 0 ? (
              <Alert type="info" message="No upcoming sessions found." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                  >
                    <p className="text-base font-semibold text-white">
                      {session.program_title}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Coach: {session.coach_name}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Date: {session.session_date || "—"}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Time: {session.start_time || "—"}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Location: {session.location}
                    </p>
                    <p className="mt-3 text-sm text-slate-300">
                      {session.booked_players_count} / {session.max_players} booked
                    </p>
                    <p className="text-sm text-yellow-400">
                      {session.available_slots} slots left
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default AdminDashboardPage;