import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import { formatDate } from "../../../utils/formatDate";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import AdminToolbar from "../components/ui/AdminToolbar";
import AdminSectionCard from "../components/ui/AdminSectionCard";
import AdminTable from "../components/table/AdminTable";
import AdminPagination from "../components/table/AdminPagination";
import AdminRowActions from "../components/table/AdminRowActions";
import AdminStatusBadge from "../components/ui/AdminStatusBadge";
import AdminFormAlert from "../components/form/AdminFormAlert";
import AdminTextareaField from "../components/form/AdminTextareaField";
import AdminSelectField from "../components/form/AdminSelectField";
import AdminConfirmDialog from "../components/ui/AdminConfirmDialog";
import AdminModal from "../components/ui/AdminModal";
import BulkActionBar from "../components/ui/BulkActionBar";
import { useAdminTable } from "../hooks/useAdminTable";
import { useRowSelection } from "../hooks/useRowSelection";
import {
  getAdminEnquiries,
  updateAdminEnquiry,
  deleteAdminEnquiry,
  bulkDeleteAdminEnquiries,
  bulkUpdateAdminEnquiryStatus,
} from "../services/adminEnquiriesService";
import { normalizeApiErrors } from "../utils/normalizeApiErrors";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

const BULK_STATUS_OPTIONS = [
  { value: "new", label: "Mark as New" },
  { value: "contacted", label: "Mark as Contacted" },
  { value: "closed", label: "Mark as Closed" },
];

const initialForm = {
  status: "new",
  admin_notes: "",
};

const initialFormErrors = {
  fields: {},
  nonField: "",
};

function normalizeResponse(response) {
  if (Array.isArray(response)) {
    return { results: response, count: response.length };
  }
  return {
    results: response?.results || [],
    count: response?.count || 0,
  };
}

function getProgramLabel(enquiry) {
  return enquiry?.program_title || enquiry?.program?.title || "General enquiry";
}

function AdminEnquiriesPage() {
  const table = useAdminTable({ initialFilters: { status: "" } });

  const [enquiries, setEnquiries] = useState([]);
  const [count, setCount] = useState(0);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);
  const [bulkDeletePending, setBulkDeletePending] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState(initialFormErrors);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [pageError, setPageError] = useState("");

  const {
    selectedIds,
    allPageSelected,
    somePageSelected,
    toggleSelectAll,
    toggleSelectRow,
    clearSelection,
  } = useRowSelection(enquiries);

  const enquiryCountLabel = useMemo(() => {
    if (isLoading) return "Loading enquiries...";
    return `${count} enquir${count === 1 ? "y" : "ies"}`;
  }, [isLoading, count]);

  async function loadEnquiries() {
    try {
      setIsLoading(true);
      setPageError("");
      const response = await getAdminEnquiries(table.queryState);
      const normalized = normalizeResponse(response);
      setEnquiries(normalized.results);
      setCount(normalized.count);
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to load enquiries."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEnquiries();
    clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    table.queryState.page,
    table.queryState.page_size,
    table.queryState.search,
    table.queryState.status,
  ]);

  function resetEditor() {
    setSelectedEnquiry(null);
    setForm(initialForm);
    setFormErrors(initialFormErrors);
  }

  function closeManageModal() {
    if (isSaving) return;
    setIsManageModalOpen(false);
    resetEditor();
  }

  function openManageModal(enquiry) {
    setSelectedEnquiry(enquiry);
    setForm({
      status: enquiry.status || "new",
      admin_notes: enquiry.admin_notes || "",
    });
    setFormErrors(initialFormErrors);
    setIsManageModalOpen(true);
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({
      ...prev,
      nonField: "",
      fields: { ...prev.fields, [name]: "" },
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedEnquiry) return;
    try {
      setIsSaving(true);
      setFormErrors(initialFormErrors);
      await updateAdminEnquiry(selectedEnquiry.id, form);
      closeManageModal();
      await loadEnquiries();
    } catch (err) {
      setFormErrors(normalizeApiErrors(err));
    } finally {
      setIsSaving(false);
    }
  }

  // ── Single delete ─────────────────────────────────────────────────────────

  async function handleDeleteConfirm() {
    if (!enquiryToDelete) return;
    try {
      setIsDeleting(true);
      await deleteAdminEnquiry(enquiryToDelete.id);
      if (selectedEnquiry?.id === enquiryToDelete.id) closeManageModal();
      setEnquiryToDelete(null);
      await loadEnquiries();
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to delete enquiry."));
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Bulk actions ──────────────────────────────────────────────────────────

  async function handleBulkStatusApply(status) {
    if (selectedIds.size === 0) return;
    try {
      setIsBulkUpdating(true);
      await bulkUpdateAdminEnquiryStatus(Array.from(selectedIds), status);
      clearSelection();
      await loadEnquiries();
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to update enquiries."));
    } finally {
      setIsBulkUpdating(false);
    }
  }

  async function handleBulkDeleteConfirm() {
    setBulkDeletePending(false);
    try {
      setIsBulkUpdating(true);
      await bulkDeleteAdminEnquiries(Array.from(selectedIds));
      clearSelection();
      await loadEnquiries();
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to delete enquiries."));
    } finally {
      setIsBulkUpdating(false);
    }
  }

  const modalFooter = (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
      <Button type="button" variant="outline" onClick={closeManageModal} disabled={isSaving}>
        Cancel
      </Button>
      <Button type="submit" form="enquiry-form" loading={isSaving} loadingText="Saving...">
        Save Enquiry
      </Button>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {pageError ? <Alert variant="error">{pageError}</Alert> : null}

        <AdminSectionCard
          title="Enquiry List"
          description="Review the latest inbound leads and messages."
          contentClassName="p-0"
          actions={
            <AdminToolbar
              left={
                <div className="flex flex-wrap items-center gap-3 ml-auto">
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface-2 px-4 py-2.5 shadow-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/12 text-brand-primary">
                      <span className="text-sm font-semibold">#</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-app-text-muted">
                        Total enquiries
                      </p>
                      <p className="text-sm font-semibold text-app-text">
                        {enquiryCountLabel}
                      </p>
                    </div>
                  </div>
                </div>
              }
            />
          }
        >
          <AdminTable
            bulkBar={
              selectedIds.size > 0 ? (
                <BulkActionBar
                  selectedCount={selectedIds.size}
                  statusOptions={BULK_STATUS_OPTIONS}
                  onApplyStatus={handleBulkStatusApply}
                  onDelete={() => setBulkDeletePending(true)}
                  onClear={clearSelection}
                  isLoading={isBulkUpdating}
                />
              ) : null
            }
            columns={[
              {
                key: "select",
                label: (
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = somePageSelected;
                    }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 cursor-pointer rounded border-app-border accent-brand-primary"
                  />
                ),
              },
              { key: "name", label: "Name" },
              { key: "contact", label: "Contact" },
              { key: "message", label: "Message" },
              { key: "status", label: "Status" },
              { key: "created", label: "Created" },
              { key: "actions", label: "Actions" },
            ]}
            data={enquiries}
            isLoading={isLoading}
            emptyTitle="No enquiries found"
            emptyDescription="New website enquiries will appear here."
            className="pb-5"
            renderRow={(enquiry) => {
              const isSelected = selectedIds.has(enquiry.id);
              return (
                <tr
                  key={enquiry.id}
                  className={`border-b border-app-border text-app-text transition hover:bg-app-surface-2/40 ${
                    isSelected ? "bg-brand-primary/5" : ""
                  }`}
                >
                  <td className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(enquiry.id)}
                      className="h-4 w-4 cursor-pointer rounded border-app-border accent-brand-primary"
                    />
                  </td>

                  <td className="px-3 py-3">
                    <p className="font-medium text-app-text">{enquiry.name}</p>
                    <p className="text-xs text-app-text-muted">
                      {getProgramLabel(enquiry)}
                    </p>
                  </td>

                  <td className="px-3 py-3">
                    <p>{enquiry.email}</p>
                    <p className="text-xs text-app-text-muted">
                      {enquiry.phone || "No phone"}
                    </p>
                  </td>

                  <td className="px-3 py-3 text-app-text-muted">
                    <p className="line-clamp-2 max-w-md">{enquiry.message}</p>
                  </td>

                  <td className="px-3 py-3">
                    <AdminStatusBadge label={enquiry.status || "new"} />
                  </td>

                  <td className="px-3 py-3 text-app-text-muted">
                    {formatDate(enquiry.created_at)}
                  </td>

                  <td className="px-3 py-3">
                    <AdminRowActions>
                      <Button size="sm" onClick={() => openManageModal(enquiry)}>
                        Manage
                      </Button>
                      <Button
                        size="sm"
                        variant="danger-outline"
                        onClick={() => setEnquiryToDelete(enquiry)}
                      >
                        Delete
                      </Button>
                    </AdminRowActions>
                  </td>
                </tr>
              );
            }}
          />

          <div className="px-5 pb-5">
            <AdminPagination
              page={table.page}
              count={count}
              pageSize={table.pageSize}
              onPageChange={table.setPage}
            />
          </div>
        </AdminSectionCard>
      </div>

      <AdminModal
        open={isManageModalOpen}
        onClose={closeManageModal}
        size="lg"
        title={selectedEnquiry ? `Manage Enquiry — ${selectedEnquiry.name}` : "Manage Enquiry"}
        description={
          selectedEnquiry
            ? "Review enquiry details, update lead status, and save internal notes."
            : "Review enquiry details and update status."
        }
        footer={modalFooter}
      >
        <form id="enquiry-form" onSubmit={handleSubmit} className="space-y-6">
          <AdminFormAlert message={formErrors.nonField} />

          {selectedEnquiry ? (
            <>
              <section className="rounded-3xl border border-app-border bg-app-surface-2/40 p-4 sm:p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-app-text">Enquiry Details</h3>
                  <p className="mt-1 text-xs text-app-text-muted">
                    Contact information and enquiry source details.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">Name</p>
                    <p className="mt-1 text-sm text-app-text">{selectedEnquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">Email</p>
                    <p className="mt-1 text-sm text-app-text">{selectedEnquiry.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">Phone</p>
                    <p className="mt-1 text-sm text-app-text">
                      {selectedEnquiry.phone || "No phone provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">Program</p>
                    <p className="mt-1 text-sm text-app-text">{getProgramLabel(selectedEnquiry)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">Created</p>
                    <p className="mt-1 text-sm text-app-text">{formatDate(selectedEnquiry.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">
                      Current Status
                    </p>
                    <div className="mt-2">
                      <AdminStatusBadge label={selectedEnquiry.status || "new"} />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-app-border bg-app-surface-2/40 p-4 sm:p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-app-text">Message</h3>
                  <p className="mt-1 text-xs text-app-text-muted">
                    Full message submitted by the lead.
                  </p>
                </div>
                <div className="rounded-2xl border border-app-border bg-app-card px-4 py-3 text-sm leading-6 text-app-text">
                  {selectedEnquiry.message || "No message provided."}
                </div>
              </section>

              <section className="rounded-3xl border border-app-border bg-app-surface-2/40 p-4 sm:p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-app-text">Lead Management</h3>
                  <p className="mt-1 text-xs text-app-text-muted">
                    Update the enquiry status and save internal follow-up notes.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <AdminSelectField
                    label="Status"
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                    options={STATUS_OPTIONS}
                    error={formErrors.fields.status}
                  />
                  <div className="md:col-span-2">
                    <AdminTextareaField
                      label="Admin Notes"
                      name="admin_notes"
                      value={form.admin_notes}
                      onChange={handleInputChange}
                      error={formErrors.fields.admin_notes}
                    />
                  </div>
                </div>
              </section>
            </>
          ) : null}
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={bulkDeletePending}
        title={`Delete ${selectedIds.size} Enquir${selectedIds.size === 1 ? "y" : "ies"}`}
        description={`This action cannot be undone. ${selectedIds.size} enquir${selectedIds.size === 1 ? "y" : "ies"} will be permanently removed.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setBulkDeletePending(false)}
        isLoading={isBulkUpdating}
      />

      <AdminConfirmDialog
        open={Boolean(enquiryToDelete)}
        title="Delete Enquiry"
        description={
          enquiryToDelete
            ? `This action cannot be undone. The enquiry from "${enquiryToDelete.name}" will be permanently removed.`
            : ""
        }
        confirmLabel="Delete Enquiry"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setEnquiryToDelete(null)}
        isLoading={isDeleting}
      />
    </>
  );
}

export default AdminEnquiriesPage;
