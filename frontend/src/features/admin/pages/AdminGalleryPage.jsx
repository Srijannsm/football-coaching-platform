import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import AdminPageHeader from "../components/layout/AdminPageHeader";
import AdminSectionCard from "../components/ui/AdminSectionCard";
import AdminTable from "../components/table/AdminTable";
import AdminModal from "../components/ui/AdminModal";
import AdminConfirmDialog from "../components/ui/AdminConfirmDialog";
import AdminEmptyState from "../components/ui/AdminEmptyState";
import AdminStatusBadge from "../components/ui/AdminStatusBadge";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import { galleryReducer, initialState } from "../components/gallery/galleryReducer";
import GalleryStatsBar from "../components/gallery/GalleryStatsBar";
import GalleryToolbar from "../components/gallery/GalleryToolbar";
import GalleryDropZone from "../components/gallery/GalleryDropZone";
import GalleryCard from "../components/gallery/GalleryCard";
import GalleryListRow from "../components/gallery/GalleryListRow";
import GalleryBulkBar from "../components/gallery/GalleryBulkBar";
import {
  getAdminGalleryCategories,
  createAdminGalleryCategory,
  updateAdminGalleryCategory,
  deleteAdminGalleryCategory,
  getAdminGalleryItems,
  createAdminGalleryItem,
  updateAdminGalleryItem,
  deleteAdminGalleryItem,
  bulkDeleteAdminGalleryItems,
} from "../services/adminGalleryService";

// Lazy-load the detail panel
const GalleryDetailPanel = lazy(() =>
  import("../components/gallery/GalleryDetailPanel")
);

// ── Form initial values ────────────────────────────────────────────────────────
const EMPTY_CATEGORY_FORM = {
  name: "",
  description: "",
  display_order: 0,
  is_active: true,
};
const EMPTY_ITEM_FORM = {
  category: "",
  media_type: "photo",
  image: null,
  video_url: "",
  video_file: null,
  thumbnail: null,
  caption: "",
  display_order: 0,
  is_active: true,
};

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

function ImagePreview({ src, alt = "Preview", className = "" }) {
  if (!src) return null;
  return (
    <img src={src} alt={alt} loading="lazy" decoding="async" className={`rounded-xl object-cover ${className}`} />
  );
}

// ── Category columns ──────────────────────────────────────────────────────────
const categoryColumns = [
  { key: "name", label: "Name" },
  { key: "items", label: "Items" },
  { key: "order", label: "Order" },
  { key: "status", label: "Status" },
  { key: "actions", label: "" },
];

// ── List view table columns ───────────────────────────────────────────────────
const itemListColumns = [
  { key: "select", label: "" },
  { key: "preview", label: "Preview" },
  { key: "type", label: "Type" },
  { key: "caption", label: "Caption" },
  { key: "category", label: "Category" },
  { key: "date", label: "Added" },
  { key: "status", label: "Status" },
  { key: "actions", label: "" },
];

// ─────────────────────────────────────────────────────────────────────────────

function AdminGalleryPage() {
  const [state, dispatch] = useReducer(galleryReducer, initialState);

  // Local form state (not worth putting in the reducer)
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM);
  const [categoryFormErrors, setCategoryFormErrors] = useState({});
  const [itemForm, setItemForm] = useState(EMPTY_ITEM_FORM);
  const [itemFormErrors, setItemFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  // Upload modal form
  const [uploadCategory, setUploadCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const imageInputRef = useRef(null);
  const videoFileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const {
    categories,
    items,
    viewMode,
    searchQuery,
    typeFilter,
    categoryFilter,
    selectedIds,
    detailItem,
    isLoadingCategories,
    isLoadingItems,
    isSavingCategory,
    isSavingItem,
    isDeletingCategory,
    isDeletingItem,
    isBulkDeleting,
    categoryModal,
    itemModal,
    categoryToDelete,
    itemToDelete,
    uploadModal,
    isDragging,
    pageError,
    activeTab,
  } = state;

  // ── Derived / filtered items ─────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter((item) => {
      if (typeFilter !== "all" && item.media_type !== typeFilter) return false;
      if (categoryFilter && String(item.category) !== categoryFilter) return false;
      if (q && !item.caption?.toLowerCase().includes(q) && !item.category_name?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, searchQuery, typeFilter, categoryFilter]);

  // ── Data loaders ─────────────────────────────────────────────────────────────
  const loadCategories = useCallback(async () => {
    dispatch({ type: "SET_LOADING", key: "isLoadingCategories", value: true });
    try {
      const data = await getAdminGalleryCategories();
      dispatch({ type: "SET_CATEGORIES", payload: normalizeList(data) });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to load categories." });
    } finally {
      dispatch({ type: "SET_LOADING", key: "isLoadingCategories", value: false });
    }
  }, []);

  const loadItems = useCallback(async () => {
    dispatch({ type: "SET_LOADING", key: "isLoadingItems", value: true });
    try {
      const data = await getAdminGalleryItems();
      dispatch({ type: "SET_ITEMS", payload: normalizeList(data) });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to load gallery items." });
    } finally {
      dispatch({ type: "SET_LOADING", key: "isLoadingItems", value: false });
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadCategories();
    loadItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Category CRUD ─────────────────────────────────────────────────────────────
  function openCreateCategory() {
    setCategoryForm(EMPTY_CATEGORY_FORM);
    setCategoryFormErrors({});
    dispatch({ type: "OPEN_CATEGORY_MODAL", mode: "create" });
  }

  function openEditCategory(cat) {
    setCategoryForm({
      name: cat.name,
      description: cat.description ?? "",
      display_order: cat.display_order ?? 0,
      is_active: cat.is_active,
    });
    setCategoryFormErrors({});
    dispatch({ type: "OPEN_CATEGORY_MODAL", mode: "edit", data: cat });
  }

  async function handleSaveCategory() {
    const errors = {};
    if (!categoryForm.name.trim()) errors.name = "Name is required.";
    if (Object.keys(errors).length) { setCategoryFormErrors(errors); return; }

    dispatch({ type: "SET_LOADING", key: "isSavingCategory", value: true });
    try {
      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        display_order: Number(categoryForm.display_order) || 0,
        is_active: categoryForm.is_active,
      };
      if (categoryModal.mode === "create") {
        await createAdminGalleryCategory(payload);
      } else {
        await updateAdminGalleryCategory(categoryModal.data.id, payload);
      }
      dispatch({ type: "CLOSE_CATEGORY_MODAL" });
      await loadCategories();
    } catch (err) {
      const detail = err?.response?.data;
      setCategoryFormErrors(detail && typeof detail === "object" ? detail : { non_field: "Save failed." });
    } finally {
      dispatch({ type: "SET_LOADING", key: "isSavingCategory", value: false });
    }
  }

  async function handleDeleteCategory() {
    if (!categoryToDelete) return;
    dispatch({ type: "SET_LOADING", key: "isDeletingCategory", value: true });
    try {
      await deleteAdminGalleryCategory(categoryToDelete.id);
      dispatch({ type: "SET_CATEGORY_TO_DELETE", payload: null });
      await Promise.all([loadCategories(), loadItems()]);
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to delete category." });
    } finally {
      dispatch({ type: "SET_LOADING", key: "isDeletingCategory", value: false });
    }
  }

  // ── Item CRUD ─────────────────────────────────────────────────────────────────
  function openCreateItem() {
    setItemForm({ ...EMPTY_ITEM_FORM, category: categories[0]?.id ?? "" });
    setItemFormErrors({});
    setImagePreview(null);
    setThumbnailPreview(null);
    [imageInputRef, videoFileInputRef, thumbnailInputRef].forEach((r) => {
      if (r.current) r.current.value = "";
    });
    dispatch({ type: "OPEN_ITEM_MODAL", mode: "create" });
  }

  function openEditItem(item) {
    setItemForm({
      category: item.category,
      media_type: item.media_type,
      image: null,
      video_url: item.video_url ?? "",
      video_file: null,
      thumbnail: null,
      caption: item.caption ?? "",
      display_order: item.display_order ?? 0,
      is_active: item.is_active,
    });
    setImagePreview(item.image_url ?? null);
    setThumbnailPreview(item.thumbnail_url ?? null);
    setItemFormErrors({});
    [imageInputRef, videoFileInputRef, thumbnailInputRef].forEach((r) => {
      if (r.current) r.current.value = "";
    });
    dispatch({ type: "OPEN_ITEM_MODAL", mode: "edit", data: item });
    // If the detail panel is showing this item, close it so it reopens fresh after save
    if (detailItem?.id === item.id) dispatch({ type: "SET_DETAIL_ITEM", payload: null });
  }

  function handleItemFieldChange(field, value) {
    if (field === "media_type") {
      setImagePreview(null);
      setThumbnailPreview(null);
      [imageInputRef, videoFileInputRef, thumbnailInputRef].forEach((r) => {
        if (r.current) r.current.value = "";
      });
      setItemForm((prev) => ({
        ...prev,
        media_type: value,
        image: null,
        video_file: null,
        thumbnail: null,
      }));
    } else {
      setItemForm((prev) => ({ ...prev, [field]: value }));
    }
  }

  async function handleSaveItem() {
    const errors = {};
    if (!itemForm.category) errors.category = "Category is required.";
    if (itemForm.media_type === "photo" && itemModal.mode === "create" && !itemForm.image)
      errors.image = "An image is required for photo items.";
    if (
      itemForm.media_type === "video" &&
      !itemForm.video_url.trim() &&
      !(itemForm.video_file instanceof File)
    )
      errors.video_url = "Provide a video URL or upload a video file.";
    if (Object.keys(errors).length) { setItemFormErrors(errors); return; }

    dispatch({ type: "SET_LOADING", key: "isSavingItem", value: true });
    try {
      const fd = new FormData();
      fd.append("category", itemForm.category);
      fd.append("media_type", itemForm.media_type);
      fd.append("caption", itemForm.caption.trim());
      fd.append("display_order", String(Number(itemForm.display_order) || 0));
      fd.append("is_active", String(itemForm.is_active));

      if (itemForm.media_type === "photo") {
        if (itemForm.image instanceof File) fd.append("image", itemForm.image);
        fd.append("video_url", "");
      } else {
        fd.append("video_url", itemForm.video_url.trim());
        if (itemForm.video_file instanceof File) fd.append("video_file", itemForm.video_file);
        if (itemForm.thumbnail instanceof File) fd.append("thumbnail", itemForm.thumbnail);
      }

      if (itemModal.mode === "create") {
        await createAdminGalleryItem(fd);
      } else {
        await updateAdminGalleryItem(itemModal.data.id, fd);
      }
      dispatch({ type: "CLOSE_ITEM_MODAL" });
      await loadItems();
    } catch (err) {
      const detail = err?.response?.data;
      setItemFormErrors(detail && typeof detail === "object" ? detail : { non_field: "Save failed." });
    } finally {
      dispatch({ type: "SET_LOADING", key: "isSavingItem", value: false });
    }
  }

  async function handleDeleteItem() {
    if (!itemToDelete) return;
    dispatch({ type: "SET_LOADING", key: "isDeletingItem", value: true });
    try {
      await deleteAdminGalleryItem(itemToDelete.id);
      dispatch({ type: "SET_ITEM_TO_DELETE", payload: null });
      if (detailItem?.id === itemToDelete.id)
        dispatch({ type: "SET_DETAIL_ITEM", payload: null });
      await loadItems();
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to delete item." });
    } finally {
      dispatch({ type: "SET_LOADING", key: "isDeletingItem", value: false });
    }
  }

  // ── Detail panel quick-caption-save ──────────────────────────────────────────
  async function handleDetailEdit(item) {
    if (item._captionOnly) {
      // Inline caption save from the detail panel
      const fd = new FormData();
      fd.append("caption", item.caption);
      try {
        await updateAdminGalleryItem(item.id, fd);
        await loadItems();
        // Refresh detail panel
        dispatch({
          type: "SET_DETAIL_ITEM",
          payload: { ...detailItem, caption: item.caption },
        });
      } catch {
        dispatch({ type: "SET_ERROR", payload: "Failed to update caption." });
      }
    } else {
      openEditItem(item);
    }
  }

  // ── Bulk delete ───────────────────────────────────────────────────────────────
  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    dispatch({ type: "SET_LOADING", key: "isBulkDeleting", value: true });
    try {
      await bulkDeleteAdminGalleryItems(ids);
      dispatch({ type: "CLEAR_SELECTION" });
      if (detailItem && ids.includes(detailItem.id))
        dispatch({ type: "SET_DETAIL_ITEM", payload: null });
      await loadItems();
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Bulk delete failed." });
    } finally {
      dispatch({ type: "SET_LOADING", key: "isBulkDeleting", value: false });
    }
  }

  // ── Drag-and-drop ─────────────────────────────────────────────────────────────
  function handleDropZone(files, event) {
    if (event === "enter") { dispatch({ type: "SET_DRAGGING", payload: true }); return; }
    if (event === "leave") { dispatch({ type: "SET_DRAGGING", payload: false }); return; }
    dispatch({ type: "SET_DRAGGING", payload: false });
    if (files && files.length) {
      dispatch({ type: "OPEN_UPLOAD_MODAL", files });
      setUploadCategory(categories[0]?.id ?? "");
    }
  }

  async function handleBatchUpload() {
    if (!uploadCategory) return;
    setIsUploading(true);
    try {
      await Promise.all(
        uploadModal.files.map((file) => {
          const isVideo = file.type.startsWith("video/");
          const fd = new FormData();
          fd.append("category", uploadCategory);
          fd.append("media_type", isVideo ? "video" : "photo");
          fd.append("caption", file.name.replace(/\.[^.]+$/, ""));
          fd.append("display_order", "0");
          fd.append("is_active", "true");
          if (isVideo) {
            fd.append("video_file", file);
            fd.append("video_url", "");
          } else {
            fd.append("image", file);
          }
          return createAdminGalleryItem(fd);
        })
      );
      dispatch({ type: "CLOSE_UPLOAD_MODAL" });
      await loadItems();
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Some files failed to upload." });
    } finally {
      setIsUploading(false);
    }
  }

  // ── Select all visible ────────────────────────────────────────────────────────
  function handleSelectAll() {
    if (selectedIds.size === filteredItems.length) {
      dispatch({ type: "CLEAR_SELECTION" });
    } else {
      dispatch({ type: "SELECT_ALL", ids: filteredItems.map((i) => i.id) });
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 p-6">
      <AdminPageHeader
        title="Gallery"
        description="Manage gallery categories and media items."
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => dispatch({ type: "SET_TAB", payload: "categories" })}>
              Categories
            </Button>
            <Button size="sm" onClick={openCreateItem} disabled={categories.length === 0}>
              + Add Item
            </Button>
          </div>
        }
      />

      {pageError && (
        <Alert variant="error" onClose={() => dispatch({ type: "CLEAR_ERROR" })}>
          {pageError}
        </Alert>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 rounded-2xl border border-app-border bg-app-card p-1 w-fit">
        {["items", "categories"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => dispatch({ type: "SET_TAB", payload: tab })}
            className={`rounded-xl px-5 py-2 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? "bg-brand-primary text-black shadow-sm"
                : "text-app-text-soft hover:text-app-text"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          ITEMS TAB
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "items" && (
        <div className={`flex gap-5 ${detailItem ? "lg:flex-row" : ""}`}>
          {/* Main column */}
          <div className="min-w-0 flex-1 space-y-4">
            {/* Stats bar */}
            <GalleryStatsBar items={items} selectedCount={selectedIds.size} />

            {/* Drop zone */}
            <GalleryDropZone
              isDragging={isDragging}
              onDrop={handleDropZone}
              disabled={categories.length === 0}
            />

            {/* Toolbar */}
            <AdminSectionCard contentClassName="py-4">
              <GalleryToolbar
                searchQuery={searchQuery}
                onSearchChange={(v) => dispatch({ type: "SET_SEARCH", payload: v })}
                typeFilter={typeFilter}
                onTypeFilterChange={(v) => dispatch({ type: "SET_TYPE_FILTER", payload: v })}
                viewMode={viewMode}
                onViewModeChange={(v) => dispatch({ type: "SET_VIEW_MODE", payload: v })}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={(v) => dispatch({ type: "SET_CATEGORY_FILTER", payload: v })}
                categories={categories}
              />
            </AdminSectionCard>

            {/* Grid / List */}
            {isLoadingItems ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "space-y-2"
                }
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`animate-pulse rounded-2xl bg-app-surface-2 ${
                      viewMode === "grid" ? "aspect-square" : "h-14"
                    }`}
                  />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <AdminEmptyState
                title="No items found"
                description={
                  searchQuery || typeFilter !== "all" || categoryFilter
                    ? "Try adjusting your search or filters."
                    : "Add your first photo or video using the button above."
                }
                action={
                  !searchQuery && typeFilter === "all" && !categoryFilter ? (
                    <Button size="sm" onClick={openCreateItem} disabled={categories.length === 0}>
                      + Add Item
                    </Button>
                  ) : null
                }
              />
            ) : viewMode === "grid" ? (
              <div>
                {/* Select-all row */}
                <div className="mb-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-medium text-app-text-muted hover:text-app-text transition"
                  >
                    {selectedIds.size === filteredItems.length && filteredItems.length > 0
                      ? "Deselect all"
                      : `Select all (${filteredItems.length})`}
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {filteredItems.map((item) => (
                    <GalleryCard
                      key={item.id}
                      item={item}
                      isSelected={selectedIds.has(item.id)}
                      onSelect={(id) => dispatch({ type: "TOGGLE_SELECT", id })}
                      onClick={(it) => dispatch({ type: "SET_DETAIL_ITEM", payload: it })}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* List view */
              <AdminSectionCard contentClassName="p-0 overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="text-left">
                      <th className="w-10 px-3 py-3">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="text-[11px] font-semibold text-app-text-muted hover:text-brand-primary transition"
                        >
                          {selectedIds.size === filteredItems.length && filteredItems.length > 0
                            ? "✓"
                            : "☐"}
                        </button>
                      </th>
                      {itemListColumns.slice(1).map((col) => (
                        <th
                          key={col.key}
                          className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-app-text-muted"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <GalleryListRow
                        key={item.id}
                        item={item}
                        isSelected={selectedIds.has(item.id)}
                        onSelect={(id) => dispatch({ type: "TOGGLE_SELECT", id })}
                        onClick={(it) => dispatch({ type: "SET_DETAIL_ITEM", payload: it })}
                        onEdit={openEditItem}
                        onDelete={(it) => dispatch({ type: "SET_ITEM_TO_DELETE", payload: it })}
                      />
                    ))}
                  </tbody>
                </table>
              </AdminSectionCard>
            )}
          </div>

          {/* Detail sidebar (lazy) */}
          {detailItem && (
            <div className="w-full lg:w-80 xl:w-96 shrink-0">
              <div className="sticky top-6">
                <Suspense
                  fallback={
                    <div className="h-96 animate-pulse rounded-3xl bg-app-surface-2" />
                  }
                >
                  <GalleryDetailPanel
                    item={detailItem}
                    onClose={() => dispatch({ type: "SET_DETAIL_ITEM", payload: null })}
                    onEdit={handleDetailEdit}
                    onDelete={(it) => dispatch({ type: "SET_ITEM_TO_DELETE", payload: it })}
                  />
                </Suspense>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          CATEGORIES TAB
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "categories" && (
        <AdminSectionCard
          title="Categories"
          actions={
            <Button size="sm" onClick={openCreateCategory}>
              + Add Category
            </Button>
          }
        >
          <AdminTable
            columns={categoryColumns}
            data={categories}
            isLoading={isLoadingCategories}
            emptyTitle="No categories yet"
            emptyDescription="Create your first gallery category to get started."
            renderRow={(cat) => (
              <tr key={cat.id} className="border-t border-app-border hover:bg-app-surface-2/40 transition">
                <td className="px-4 py-3 text-sm font-medium text-app-text">
                  <div>{cat.name}</div>
                  {cat.description && (
                    <div className="mt-0.5 text-xs text-app-text-muted line-clamp-1">
                      {cat.description}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-app-text-soft">{cat.item_count ?? 0}</td>
                <td className="px-4 py-3 text-sm text-app-text-soft">{cat.display_order}</td>
                <td className="px-4 py-3">
                  <AdminStatusBadge label={cat.is_active ? "Active" : "Inactive"} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditCategory(cat)}>Edit</Button>
                    <Button size="sm" variant="danger-outline" onClick={() => dispatch({ type: "SET_CATEGORY_TO_DELETE", payload: cat })}>Delete</Button>
                  </div>
                </td>
              </tr>
            )}
          />
        </AdminSectionCard>
      )}

      {/* ── BULK BAR ── */}
      <GalleryBulkBar
        count={selectedIds.size}
        isDeleting={isBulkDeleting}
        onDelete={handleBulkDelete}
        onClear={() => dispatch({ type: "CLEAR_SELECTION" })}
      />

      {/* ── CATEGORY MODAL ── */}
      <AdminModal
        open={categoryModal.open}
        title={categoryModal.mode === "create" ? "Add Category" : "Edit Category"}
        onClose={() => dispatch({ type: "CLOSE_CATEGORY_MODAL" })}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => dispatch({ type: "CLOSE_CATEGORY_MODAL" })}>Cancel</Button>
            <Button onClick={handleSaveCategory} disabled={isSavingCategory}>
              {isSavingCategory ? "Saving…" : "Save"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {categoryFormErrors.non_field && (
            <Alert variant="error">{categoryFormErrors.non_field}</Alert>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-app-text">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Training Sessions"
              className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-sm text-app-text placeholder-app-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            {categoryFormErrors.name && (
              <p className="mt-1 text-xs text-red-400">{categoryFormErrors.name}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-app-text">Description</label>
            <textarea
              rows={3}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Optional short description"
              className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-sm text-app-text placeholder-app-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-app-text">Display Order</label>
              <input
                type="number"
                min={0}
                value={categoryForm.display_order}
                onChange={(e) => setCategoryForm((p) => ({ ...p, display_order: e.target.value }))}
                className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div className="flex flex-col justify-end pb-0.5">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-app-text">
                <input
                  type="checkbox"
                  checked={categoryForm.is_active}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded accent-brand-primary"
                />
                Active
              </label>
            </div>
          </div>
        </div>
      </AdminModal>

      {/* ── ITEM MODAL ── */}
      <AdminModal
        open={itemModal.open}
        title={itemModal.mode === "create" ? "Add Gallery Item" : "Edit Gallery Item"}
        onClose={() => dispatch({ type: "CLOSE_ITEM_MODAL" })}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => dispatch({ type: "CLOSE_ITEM_MODAL" })}>Cancel</Button>
            <Button onClick={handleSaveItem} disabled={isSavingItem}>
              {isSavingItem ? "Saving…" : "Save"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {itemFormErrors.non_field && (
            <Alert variant="error">{itemFormErrors.non_field}</Alert>
          )}

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-app-text">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={itemForm.category}
              onChange={(e) => handleItemFieldChange("category", e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {itemFormErrors.category && (
              <p className="mt-1 text-xs text-red-400">{itemFormErrors.category}</p>
            )}
          </div>

          {/* Media type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-app-text">Type</label>
            <div className="flex gap-3">
              {["photo", "video"].map((t) => (
                <label
                  key={t}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    itemForm.media_type === t
                      ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                      : "border-app-border text-app-text-soft hover:border-brand-primary/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="media_type"
                    value={t}
                    checked={itemForm.media_type === t}
                    onChange={() => handleItemFieldChange("media_type", t)}
                    className="sr-only"
                  />
                  {t === "photo" ? "📷 Photo" : "▶ Video"}
                </label>
              ))}
            </div>
          </div>

          {/* Photo fields */}
          {itemForm.media_type === "photo" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-app-text">
                Image {itemModal.mode === "create" && <span className="text-red-400">*</span>}
              </label>
              {imagePreview && (
                <ImagePreview src={imagePreview} alt="Preview" className="mb-2 h-32 w-full" />
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  handleItemFieldChange("image", file);
                  setImagePreview(file ? URL.createObjectURL(file) : null);
                }}
                className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-sm text-app-text file:mr-3 file:rounded-lg file:border-0 file:bg-brand-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-brand-primary"
              />
              {itemFormErrors.image && (
                <p className="mt-1 text-xs text-red-400">{itemFormErrors.image}</p>
              )}
            </div>
          )}

          {/* Video fields */}
          {itemForm.media_type === "video" && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-app-text">Video URL</label>
                <input
                  type="url"
                  value={itemForm.video_url}
                  onChange={(e) => handleItemFieldChange("video_url", e.target.value)}
                  placeholder="https://youtube.com/watch?v=…"
                  className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-sm text-app-text placeholder-app-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                {itemFormErrors.video_url && (
                  <p className="mt-1 text-xs text-red-400">{itemFormErrors.video_url}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-app-text">
                  Or upload a video file
                </label>
                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    handleItemFieldChange("video_file", file);
                  }}
                  className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-sm text-app-text file:mr-3 file:rounded-lg file:border-0 file:bg-brand-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-brand-primary"
                />
                {itemForm.video_file instanceof File && (
                  <p className="mt-1 text-xs text-app-text-muted">{itemForm.video_file.name}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-app-text">
                  Thumbnail (optional)
                </label>
                {thumbnailPreview && (
                  <ImagePreview src={thumbnailPreview} alt="Thumbnail" className="mb-2 h-24 w-40" />
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    handleItemFieldChange("thumbnail", file);
                    setThumbnailPreview(file ? URL.createObjectURL(file) : null);
                  }}
                  className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-sm text-app-text file:mr-3 file:rounded-lg file:border-0 file:bg-brand-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-brand-primary"
                />
              </div>
            </>
          )}

          {/* Caption */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-app-text">Caption</label>
            <input
              type="text"
              value={itemForm.caption}
              onChange={(e) => handleItemFieldChange("caption", e.target.value)}
              placeholder="Optional caption"
              className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-sm text-app-text placeholder-app-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Order + Active */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-app-text">Display Order</label>
              <input
                type="number"
                min={0}
                value={itemForm.display_order}
                onChange={(e) => handleItemFieldChange("display_order", e.target.value)}
                className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div className="flex flex-col justify-end pb-0.5">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-app-text">
                <input
                  type="checkbox"
                  checked={itemForm.is_active}
                  onChange={(e) => handleItemFieldChange("is_active", e.target.checked)}
                  className="h-4 w-4 rounded accent-brand-primary"
                />
                Active
              </label>
            </div>
          </div>
        </div>
      </AdminModal>

      {/* ── UPLOAD MODAL (DnD) ── */}
      <AdminModal
        open={uploadModal.open}
        title="Upload Files"
        description={`${uploadModal.files.length} file${uploadModal.files.length !== 1 ? "s" : ""} ready to upload`}
        onClose={() => dispatch({ type: "CLOSE_UPLOAD_MODAL" })}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => dispatch({ type: "CLOSE_UPLOAD_MODAL" })}>Cancel</Button>
            <Button onClick={handleBatchUpload} disabled={!uploadCategory || isUploading}>
              {isUploading ? "Uploading…" : "Upload All"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-app-text">
              Upload to category <span className="text-red-400">*</span>
            </label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-sm text-app-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1.5 rounded-xl border border-app-border bg-app-surface p-3">
            {uploadModal.files.map((file, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-app-text-soft">
                <span className="text-xs">
                  {file.type.startsWith("video/") ? "▶" : "📷"}
                </span>
                <span className="truncate flex-1">{file.name}</span>
                <span className="shrink-0 text-xs text-app-text-muted">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </div>
            ))}
          </div>
        </div>
      </AdminModal>

      {/* ── DELETE CATEGORY ── */}
      <AdminConfirmDialog
        open={!!categoryToDelete}
        title="Delete Category"
        description={`Delete "${categoryToDelete?.name}"? All items will also be deleted.`}
        confirmLabel="Delete"
        isLoading={isDeletingCategory}
        onConfirm={handleDeleteCategory}
        onCancel={() => dispatch({ type: "SET_CATEGORY_TO_DELETE", payload: null })}
      />

      {/* ── DELETE ITEM ── */}
      <AdminConfirmDialog
        open={!!itemToDelete}
        title="Delete Gallery Item"
        description={`Delete this ${itemToDelete?.media_type ?? "item"}${itemToDelete?.caption ? ` ("${itemToDelete.caption}")` : ""}? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeletingItem}
        onConfirm={handleDeleteItem}
        onCancel={() => dispatch({ type: "SET_ITEM_TO_DELETE", payload: null })}
      />
    </div>
  );
}

export default AdminGalleryPage;
