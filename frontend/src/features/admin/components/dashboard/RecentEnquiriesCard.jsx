import AdminSectionCard from "../ui/AdminSectionCard";
import AdminStatusBadge from "../ui/AdminStatusBadge";
import AdminEmptyState from "../ui/AdminEmptyState";
import { formatDate } from "../../../../utils/formatDate";

function RecentEnquiriesCard({ enquiries = [] }) {
  return (
    <AdminSectionCard
      title="Recent Enquiries"
      description="Newest incoming leads and communication status."
    >
      {!enquiries.length ? (
        <AdminEmptyState
          title="No enquiries yet"
          description="New enquiries will appear here."
        />
      ) : (
        <div className="space-y-4">
          {enquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 transition hover:bg-app-surface-2/80"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-app-text">{enquiry.name}</p>

                  <p className="mt-1 text-sm text-app-text-muted">
                    {enquiry.email}
                  </p>

                  <p className="mt-1 text-xs text-app-text-muted">
                    {formatDate(enquiry.created_at)}
                  </p>
                </div>

                <AdminStatusBadge label={enquiry.status || "New"} />
              </div>

              {enquiry.message ? (
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-app-text-muted">
                  {enquiry.message}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </AdminSectionCard>
  );
}

export default RecentEnquiriesCard;