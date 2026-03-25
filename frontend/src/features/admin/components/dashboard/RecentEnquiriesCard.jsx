import { CalendarDays, Mail, MessageSquareMore, Phone } from "lucide-react";
import AdminSectionCard from "../ui/AdminSectionCard";
import AdminStatusBadge from "../ui/AdminStatusBadge";
import AdminEmptyState from "../ui/AdminEmptyState";
import { formatDate } from "../../../../utils/formatDate";

function MetaPill({ icon: Icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-app-border bg-app-card px-3 py-1.5 text-xs font-medium text-app-text-muted">
      <Icon size={14} className="text-app-text-muted" />
      <span className="truncate">{text}</span>
    </div>
  );
}

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
          {enquiries.map((enquiry) => {
            const createdDate = enquiry.created_at
              ? formatDate(enquiry.created_at)
              : "Unknown date";

            return (
              <div
                key={enquiry.id}
                className="group rounded-3xl border border-app-border bg-app-surface-2 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/30 hover:bg-app-surface hover:shadow-[var(--shadow-soft)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-base font-bold tracking-tight text-app-text">
                      {enquiry.name || "Unknown Lead"}
                    </h4>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {enquiry.email ? (
                        <MetaPill icon={Mail} text={enquiry.email} />
                      ) : null}

                      {enquiry.phone ? (
                        <MetaPill icon={Phone} text={enquiry.phone} />
                      ) : null}

                      <MetaPill icon={CalendarDays} text={createdDate} />
                    </div>
                  </div>

                  <div className="shrink-0">
                    <AdminStatusBadge label={enquiry.status || "New"} />
                  </div>
                </div>

                {enquiry.program_title ? (
                  <div className="mt-3">
                    <MetaPill
                      icon={MessageSquareMore}
                      text={`Program: ${enquiry.program_title}`}
                    />
                  </div>
                ) : null}

                {enquiry.message ? (
                  <div className="mt-4 rounded-2xl border border-app-border bg-app-card/80 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-app-text-muted">
                      Message Preview
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-app-text-soft">
                      {enquiry.message}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </AdminSectionCard>
  );
}

export default RecentEnquiriesCard;