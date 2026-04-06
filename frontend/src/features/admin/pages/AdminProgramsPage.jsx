import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";
import { formatDate } from "../../../utils/formatDate";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import AdminSectionCard from "../components/ui/AdminSectionCard";
import AdminTable from "../components/table/AdminTable";
import AdminPagination from "../components/table/AdminPagination";
import AdminRowActions from "../components/table/AdminRowActions";
import AdminStatusBadge from "../components/ui/AdminStatusBadge";
import AdminFormAlert from "../components/form/AdminFormAlert";
import AdminInputField from "../components/form/AdminInputField";
import AdminTextareaField from "../components/form/AdminTextareaField";
import AdminSelectField from "../components/form/AdminSelectField";
import AdminCheckboxField from "../components/form/AdminCheckboxField";
import AdminToolbar from "../components/ui/AdminToolbar";
import AdminConfirmDialog from "../components/ui/AdminConfirmDialog";
import AdminModal from "../components/ui/AdminModal";
import BulkActionBar from "../components/ui/BulkActionBar";
import { useAdminTable } from "../hooks/useAdminTable";
import { useRowSelection } from "../hooks/useRowSelection";
import { normalizeApiErrors } from "../utils/normalizeApiErrors";
import {
    getAdminPrograms,
    createAdminProgram,
    updateAdminProgram,
    deleteAdminProgram,
    buildProgramFormData,
    bulkDeleteAdminPrograms,
} from "../services/adminProgramsService";

const PROGRAM_STATUS_OPTIONS = [
    { value: "", label: "All programs" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

const SESSION_TYPE_OPTIONS = [
    { value: "group", label: "Group" },
    { value: "one_to_one", label: "One to One" },
];

const initialForm = {
    title: "",
    description: "",
    short_description: "",
    display_order: 0,
    session_type: "group",
    default_duration_minutes: 60,
    default_price: "",
    is_active: true,
    hero_image: null,
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

function AdminProgramsPage() {
    const table = useAdminTable({ initialFilters: { status: "" } });

    const [programs, setPrograms] = useState([]);
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const [editingProgramId, setEditingProgramId] = useState(null);
    const [programToDelete, setProgramToDelete] = useState(null);
    const [bulkDeletePending, setBulkDeletePending] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    const {
        selectedIds,
        allPageSelected,
        somePageSelected,
        toggleSelectAll,
        toggleSelectRow,
        clearSelection,
    } = useRowSelection(programs);

    const [form, setForm] = useState(initialForm);
    const [formErrors, setFormErrors] = useState(initialFormErrors);
    const [pageError, setPageError] = useState("");

    const isEditing = Boolean(editingProgramId);

    async function loadPrograms() {
        try {
            setIsLoading(true);
            setPageError("");

            const response = await getAdminPrograms(table.queryState);
            const normalized = normalizeResponse(response);
            setPrograms(normalized.results);
            setCount(normalized.count);
        } catch (err) {
            setPageError(getErrorMessage(err, "Failed to load programs."));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadPrograms();
        clearSelection();
    }, [
        table.queryState.page,
        table.queryState.page_size,
        table.queryState.search,
        table.queryState.status,
    ]); // eslint-disable-line react-hooks/exhaustive-deps

    function resetForm() {
        setEditingProgramId(null);
        setForm(initialForm);
        setFormErrors(initialFormErrors);
    }

    function closeFormModal() {
        if (isSaving) return;
        setIsFormModalOpen(false);
        resetForm();
    }

    function openCreateModal() {
        resetForm();
        setIsFormModalOpen(true);
    }

    function openEditModal(program) {
        setEditingProgramId(program.id);
        setFormErrors(initialFormErrors);

        setForm({
            title: program.title || "",
            description: program.description || "",
            short_description: program.short_description || "",
            display_order: program.display_order ?? 0,
            session_type: program.session_type || "group",
            default_duration_minutes: program.default_duration_minutes ?? 60,
            default_price: program.default_price || "",
            is_active: Boolean(program.is_active),
            hero_image: null,
        });

        setIsFormModalOpen(true);
    }

    function handleInputChange(event) {
        const { name, value, type, checked, files } = event.target;

        const nextValue =
            type === "checkbox"
                ? checked
                : type === "file"
                    ? files?.[0] || null
                    : value;

        setForm((prev) => ({
            ...prev,
            [name]: nextValue,
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

        try {
            setIsSaving(true);
            setFormErrors(initialFormErrors);

            const payload = buildProgramFormData(form);

            if (editingProgramId) {
                await updateAdminProgram(editingProgramId, payload);
            } else {
                await createAdminProgram(payload);
            }

            closeFormModal();
            await loadPrograms();
        } catch (err) {
            setFormErrors(normalizeApiErrors(err));
        } finally {
            setIsSaving(false);
        }
    }

    function handleDeleteClick(program) {
        setProgramToDelete(program);
    }

    function handleDeleteCancel() {
        setProgramToDelete(null);
    }

    async function handleDeleteConfirm() {
        if (!programToDelete) return;

        try {
            setIsDeleting(true);

            await deleteAdminProgram(programToDelete.id);

            if (editingProgramId === programToDelete.id) {
                closeFormModal();
            }

            setProgramToDelete(null);
            await loadPrograms();
        } catch (err) {
            setPageError(getErrorMessage(err, "Failed to delete program."));
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleBulkDeleteConfirm() {
        setBulkDeletePending(false);
        try {
            setIsBulkDeleting(true);
            await bulkDeleteAdminPrograms(Array.from(selectedIds));
            clearSelection();
            await loadPrograms();
        } catch (err) {
            setPageError(getErrorMessage(err, "Failed to delete programs."));
        } finally {
            setIsBulkDeleting(false);
        }
    }

    const programCountLabel = useMemo(() => {
        if (isLoading) return "Loading programs...";
        return `${count} program${count === 1 ? "" : "s"}`;
    }, [isLoading, count]);

    const modalFooter = (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
                type="button"
                variant="outline"
                onClick={closeFormModal}
                disabled={isSaving}
            >
                Cancel
            </Button>

            <Button
                type="submit"
                form="program-form"
                loading={isSaving}
                loadingText={isEditing ? "Updating..." : "Creating..."}
            >
                {isEditing ? "Update Program" : "Create Program"}
            </Button>
        </div>
    );

    return (
        <>
            <div className="space-y-6">

                {pageError ? <Alert variant="error">{pageError}</Alert> : null}

                <AdminSectionCard
                    title="Program List"
                    description="Review and manage all academy programs."
                    contentClassName="p-0"
                    actions={<AdminToolbar
                        left={
                            <div className="flex flex-wrap items-center gap-3 ml-auto">
                                <input
                                    type="text"
                                    placeholder="Search by title or description"
                                    className="h-10 min-w-[280px] rounded-xl border border-app-border bg-app-card px-4 text-sm text-app-text outline-none transition placeholder:text-app-text-muted focus:border-brand-primary"
                                />

                                <div className="inline-flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface-2 px-4 py-2.5 shadow-sm">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/12 text-brand-primary">
                                        <span className="text-sm font-semibold">#</span>
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-app-text-muted">
                                            Total programs
                                        </p>
                                        <p className="text-sm font-semibold text-app-text">
                                            {programCountLabel}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl border border-app-border bg-app-surface-2 px-3 py-2 shadow-sm">
                                    <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-app-text-muted">
                                        Status
                                    </span>

                                    <select
                                        value={table.filters.status}
                                        onChange={(event) => table.updateFilter("status", event.target.value)}
                                        className="h-10 rounded-xl border border-app-border bg-app-card px-3 text-sm font-medium text-app-text outline-none transition focus:border-brand-primary"
                                    >
                                        {PROGRAM_STATUS_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button onClick={openCreateModal}>Add New Program</Button>
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
                                    onDelete={() => setBulkDeletePending(true)}
                                    onClear={clearSelection}
                                    isLoading={isBulkDeleting}
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
                            { key: "title", label: "Program" },
                            { key: "type", label: "Type" },
                            { key: "price", label: "Price" },
                            { key: "status", label: "Status" },
                            { key: "created", label: "Created" },
                            { key: "actions", label: "Actions" },
                        ]}
                        data={programs}
                        isLoading={isLoading}
                        emptyTitle="No programs found"
                        emptyDescription="Create your first program to get started."
                        className="pb-5"
                        renderRow={(program) => {
                            const isSelected = selectedIds.has(program.id);
                            return (
                            <tr
                                key={program.id}
                                className={`border-b border-app-border text-app-text transition hover:bg-app-surface-2/40 ${isSelected ? "bg-brand-primary/5" : ""}`}
                            >
                                <td className="w-10 px-3 py-3">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleSelectRow(program.id)}
                                        className="h-4 w-4 cursor-pointer rounded border-app-border accent-brand-primary"
                                    />
                                </td>

                                <td className="px-3 py-3">
                                    <p className="font-medium text-app-text">{program.title}</p>
                                    <p className="text-xs text-app-text-muted">
                                        {program.short_description || "No short description"}
                                    </p>
                                </td>

                                <td className="px-3 py-3">{program.session_type}</td>

                                <td className="px-3 py-3">Rs. {program.default_price}</td>

                                <td className="px-3 py-3">
                                    <AdminStatusBadge
                                        label={program.is_active ? "Active" : "Inactive"}
                                    />
                                </td>

                                <td className="px-3 py-3 text-app-text-muted">
                                    {formatDate(program.created_at)}
                                </td>

                                <td className="px-3 py-3">
                                    <AdminRowActions>
                                        <Button size="sm" onClick={() => openEditModal(program)}>
                                            Edit
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="danger-outline"
                                            onClick={() => handleDeleteClick(program)}
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
                open={isFormModalOpen}
                onClose={closeFormModal}
                size="lg"
                title={isEditing ? "Edit Program" : "Create Program"}
                description={
                    isEditing
                        ? "Update program details, pricing, and visibility settings."
                        : "Create a new training program with pricing, session type, and visibility settings."
                }
                footer={modalFooter}
            >
                <form id="program-form" onSubmit={handleSubmit} className="space-y-6">
                    <AdminFormAlert message={formErrors.nonField} />

                    <section className="rounded-3xl border border-app-border bg-app-surface-2/40 p-4 sm:p-5">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-app-text">
                                Basic Information
                            </h3>
                            <p className="mt-1 text-xs text-app-text-muted">
                                Define the core content shown to users for this program.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <AdminInputField
                                label="Title"
                                name="title"
                                value={form.title}
                                onChange={handleInputChange}
                                error={formErrors.fields.title}
                            />

                            <AdminInputField
                                label="Short Description"
                                name="short_description"
                                value={form.short_description}
                                onChange={handleInputChange}
                                error={formErrors.fields.short_description}
                            />

                            <div className="md:col-span-2">
                                <AdminTextareaField
                                    label="Description"
                                    name="description"
                                    value={form.description}
                                    onChange={handleInputChange}
                                    error={formErrors.fields.description}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-app-border bg-app-surface-2/40 p-4 sm:p-5">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-app-text">
                                Configuration
                            </h3>
                            <p className="mt-1 text-xs text-app-text-muted">
                                Set the session structure, ordering, default duration, and pricing.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <AdminInputField
                                label="Display Order"
                                name="display_order"
                                type="number"
                                value={form.display_order}
                                onChange={handleInputChange}
                                error={formErrors.fields.display_order}
                            />

                            <AdminSelectField
                                label="Session Type"
                                name="session_type"
                                value={form.session_type}
                                onChange={handleInputChange}
                                options={SESSION_TYPE_OPTIONS}
                                error={formErrors.fields.session_type}
                            />

                            <AdminInputField
                                label="Default Duration (minutes)"
                                name="default_duration_minutes"
                                type="number"
                                value={form.default_duration_minutes}
                                onChange={handleInputChange}
                                error={formErrors.fields.default_duration_minutes}
                            />

                            <AdminInputField
                                label="Default Price"
                                name="default_price"
                                type="number"
                                step="0.01"
                                value={form.default_price}
                                onChange={handleInputChange}
                                error={formErrors.fields.default_price}
                            />
                        </div>
                    </section>

                    <section className="rounded-3xl border border-app-border bg-app-surface-2/40 p-4 sm:p-5">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-app-text">
                                Media & Status
                            </h3>
                            <p className="mt-1 text-xs text-app-text-muted">
                                Upload a visual asset and control whether the program is active.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-app-text">
                                    Hero Image
                                </label>

                                <input
                                    name="hero_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleInputChange}
                                    className="block w-full rounded-2xl border border-app-border bg-app-surface-2 px-3 py-2 text-sm text-app-text file:mr-3 file:rounded-xl file:border-0 file:bg-brand-primary-soft file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-primary"
                                />

                                <p className="mt-2 text-xs text-app-text-muted">
                                    Recommended for program cards and landing section visuals.
                                </p>
                            </div>

                            <div className="flex items-end">
                                <AdminCheckboxField
                                    label="Active"
                                    name="is_active"
                                    checked={form.is_active}
                                    onChange={handleInputChange}
                                    error={formErrors.fields.is_active}
                                />
                            </div>
                        </div>
                    </section>
                </form>
            </AdminModal>

            <AdminConfirmDialog
                open={bulkDeletePending}
                title={`Delete ${selectedIds.size} Program${selectedIds.size === 1 ? "" : "s"}`}
                description={`This action cannot be undone. ${selectedIds.size} program${selectedIds.size === 1 ? "" : "s"} will be permanently removed.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleBulkDeleteConfirm}
                onCancel={() => setBulkDeletePending(false)}
                isLoading={isBulkDeleting}
            />

            <AdminConfirmDialog
                open={Boolean(programToDelete)}
                title="Delete Program"
                description={
                    programToDelete
                        ? `This action cannot be undone. The program "${programToDelete.title}" will be permanently removed.`
                        : ""
                }
                confirmLabel="Delete Program"
                cancelLabel="Cancel"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                isLoading={isDeleting}
            />
        </>
    );
}

export default AdminProgramsPage;
