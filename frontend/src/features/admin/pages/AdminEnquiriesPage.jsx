import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import { formatDate } from "../../../utils/formatDate";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import AdminPageHeader from "../components/layout/AdminPageHeader";
import AdminToolbar from "../components/ui/AdminToolbar";
import AdminSectionCard from "../components/ui/AdminSectionCard";
import AdminTable from "../components/table/AdminTable";
import AdminRowActions from "../components/table/AdminRowActions";
import AdminStatusBadge from "../components/ui/AdminStatusBadge";
import AdminFormAlert from "../components/form/AdminFormAlert";
import AdminTextareaField from "../components/form/AdminTextareaField";
import AdminSelectField from "../components/form/AdminSelectField";
import AdminConfirmDialog from "../components/ui/AdminConfirmDialog";
import AdminModal from "../components/ui/AdminModal";
import {
  getAdminEnquiries,
  updateAdminEnquiry,
  deleteAdminEnquiry,
} from "../services/adminEnquiriesService";
import { normalizeApiErrors } from "../utils/normalizeApiErrors";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

const initialForm = {
  status: "new",
  admin_notes: "",
};

const initialFormErrors = {
  fields: {},
  nonField: "",
};

function normalizeList(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function getProgramLabel(enquiry) {
  return enquiry?.program_title || enquiry?.program?.title || "General enquiry";
}

function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState(initialFormErrors);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [pageError, setPageError] = useState("");

  const enquiryCountLabel = useMemo(() => {
    if (isLoading) return "Loading enquiries...";
    return `${enquiries.length} enquir${enquiries.length === 1 ? "y" : "ies"}`;
  }, [isLoading, enquiries.length]);

  async function loadEnquiries() {
    try {
      setIsLoading(true);
      setPageError("");

      const response = await getAdminEnquiries();
      console.log("ENQUIRIES RESPONSE:", response);
      setEnquiries(normalizeList(response));
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to load enquiries."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEnquiries();
  }, []);

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

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      nonField: "",
      fields: {
        ...prev.fields,
        [name]: "",
      },
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

  function handleDeleteClick(enquiry) {
    setEnquiryToDelete(enquiry);
  }

  function handleDeleteCancel() {
    setEnquiryToDelete(null);
  }

  async function handleDeleteConfirm() {
    if (!enquiryToDelete) return;

    try {
      setIsDeleting(true);

      await deleteAdminEnquiry(enquiryToDelete.id);

      if (selectedEnquiry?.id === enquiryToDelete.id) {
        closeManageModal();
      }

      setEnquiryToDelete(null);
      await loadEnquiries();
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to delete enquiry."));
    } finally {
      setIsDeleting(false);
    }
  }

  const modalFooter = (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={closeManageModal}
        disabled={isSaving}
      >
        Cancel
      </Button>

      <Button
        type="submit"
        form="enquiry-form"
        loading={isSaving}
        loadingText="Saving..."
      >
        Save Enquiry
      </Button>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {/* <AdminPageHeader
          title="Enquiries"
          description="Track and manage academy interest, leads, and inbound messages."
          actions={
            <Button variant="outline" onClick={loadEnquiries}>
              Refresh
            </Button>
          }
        /> */}

        {pageError ? <Alert variant="error">{pageError}</Alert> : null}

        <AdminToolbar
          right={
            <div className="inline-flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface-2 px-4 py-2.5 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/12 text-brand-primary">
                <span className="text-sm font-semibold">#</span>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-app-text-muted">
                  Total enquiries
                </p>
                <p className="text-sm font-semibold text-app-text">
                  {enquiryCountLabel}
                </p>
              </div>
            </div>
          }
        />

        <AdminSectionCard
          title="Enquiry List"
          description="Review the latest inbound leads and messages."
          contentClassName="p-0"
        >
          <AdminTable
            columns={[
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
            renderRow={(enquiry) => (
              <tr
                key={enquiry.id}
                className="border-b border-app-border text-app-text transition hover:bg-app-surface-2/40"
              >
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
                      onClick={() => handleDeleteClick(enquiry)}
                    >
                      Delete
                    </Button>
                  </AdminRowActions>
                </td>
              </tr>
            )}
          />
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
                  <h3 className="text-sm font-semibold text-app-text">
                    Enquiry Details
                  </h3>
                  <p className="mt-1 text-xs text-app-text-muted">
                    Contact information and enquiry source details.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">
                      Name
                    </p>
                    <p className="mt-1 text-sm text-app-text">{selectedEnquiry.name}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">
                      Email
                    </p>
                    <p className="mt-1 text-sm text-app-text">{selectedEnquiry.email}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">
                      Phone
                    </p>
                    <p className="mt-1 text-sm text-app-text">
                      {selectedEnquiry.phone || "No phone provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">
                      Program
                    </p>
                    <p className="mt-1 text-sm text-app-text">
                      {getProgramLabel(selectedEnquiry)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">
                      Created
                    </p>
                    <p className="mt-1 text-sm text-app-text">
                      {formatDate(selectedEnquiry.created_at)}
                    </p>
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
                  <h3 className="text-sm font-semibold text-app-text">
                    Message
                  </h3>
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
                  <h3 className="text-sm font-semibold text-app-text">
                    Lead Management
                  </h3>
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
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
      />
    </>
  );
}

export default AdminEnquiriesPage;