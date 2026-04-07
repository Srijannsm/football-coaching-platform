import { Link } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import AdminSectionCard from "../ui/AdminSectionCard";
import AdminStatusBadge from "../ui/AdminStatusBadge";
import AdminEmptyState from "../ui/AdminEmptyState";
import { formatDate } from "../../../../utils/formatDate";

function RecentEnquiriesCard({ enquiries = [] }) {
  return (
    <AdminSectionCard
      title="Recent Enquiries"
      description="Newest incoming leads."
      actions={
        <Link to="/admin-dashboard/enquiries">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            View All
          </Button>
        </Link>
      }
      contentClassName="!p-0"
    >
      {!enquiries.length ? (
        <div className="p-6">
          <AdminEmptyState
            title="No enquiries yet"
            description="New enquiries will appear here."
          />
        </div>
      ) : (
        <div className="divide-y divide-app-border">
          {enquiries.map((enquiry) => {
            const createdDate = enquiry.created_at
              ? formatDate(enquiry.created_at)
              : "—";

            return (
              <div
                key={enquiry.id}
                className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-app-surface-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-app-accent-violet-bg text-sm font-semibold text-app-accent-violet-text">
                    {(enquiry.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-app-text">
                      {enquiry.name || "Unknown Lead"}
                    </p>
                    <p className="truncate text-xs text-app-text-muted">
                      {enquiry.email || enquiry.phone || "No contact info"} · {createdDate}
                    </p>
                    {enquiry.program_title && (
                      <p className="mt-0.5 truncate text-xs text-app-text-muted">
                        Program: {enquiry.program_title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 pt-0.5">
                  <AdminStatusBadge label={enquiry.status || "New"} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminSectionCard>
  );
}

export default RecentEnquiriesCard;
