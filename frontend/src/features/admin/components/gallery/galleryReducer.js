const VIEW_MODE_KEY = "gallery_admin_view_mode";

export const initialState = {
  // Data
  categories: [],
  items: [],

  // View / filters
  viewMode: localStorage.getItem(VIEW_MODE_KEY) || "grid",
  searchQuery: "",
  typeFilter: "all",       // "all" | "photo" | "video"
  categoryFilter: "",

  // Selection
  selectedIds: new Set(),

  // Detail sidebar
  detailItem: null,

  // Loading flags
  isLoadingCategories: false,
  isLoadingItems: false,
  isSavingCategory: false,
  isSavingItem: false,
  isDeletingCategory: false,
  isDeletingItem: false,
  isBulkDeleting: false,

  // Modals
  categoryModal: { open: false, mode: "create", data: null },
  itemModal: { open: false, mode: "create", data: null },
  categoryToDelete: null,
  itemToDelete: null,
  uploadModal: { open: false, files: [] },

  // Drag state
  isDragging: false,

  // Error
  pageError: null,

  // Active tab
  activeTab: "items",
};

export function galleryReducer(state, action) {
  switch (action.type) {
    // ── Data ─────────────────────────────────────────────────────────────────
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };

    case "SET_ITEMS":
      return { ...state, items: action.payload };

    // ── View / filters ────────────────────────────────────────────────────────
    case "SET_VIEW_MODE": {
      localStorage.setItem(VIEW_MODE_KEY, action.payload);
      return { ...state, viewMode: action.payload };
    }

    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload };

    case "SET_TYPE_FILTER":
      return { ...state, typeFilter: action.payload };

    case "SET_CATEGORY_FILTER":
      return { ...state, categoryFilter: action.payload };

    // ── Selection ─────────────────────────────────────────────────────────────
    case "TOGGLE_SELECT": {
      const next = new Set(state.selectedIds);
      if (next.has(action.id)) next.delete(action.id);
      else next.add(action.id);
      return { ...state, selectedIds: next };
    }

    case "SELECT_ALL":
      return { ...state, selectedIds: new Set(action.ids) };

    case "CLEAR_SELECTION":
      return { ...state, selectedIds: new Set() };

    // ── Detail panel ──────────────────────────────────────────────────────────
    case "SET_DETAIL_ITEM":
      return { ...state, detailItem: action.payload };

    // ── Loading ───────────────────────────────────────────────────────────────
    case "SET_LOADING":
      return { ...state, [action.key]: action.value };

    // ── Category modal ────────────────────────────────────────────────────────
    case "OPEN_CATEGORY_MODAL":
      return {
        ...state,
        categoryModal: { open: true, mode: action.mode, data: action.data ?? null },
      };

    case "CLOSE_CATEGORY_MODAL":
      return { ...state, categoryModal: { open: false, mode: "create", data: null } };

    // ── Item modal ────────────────────────────────────────────────────────────
    case "OPEN_ITEM_MODAL":
      return {
        ...state,
        itemModal: { open: true, mode: action.mode, data: action.data ?? null },
      };

    case "CLOSE_ITEM_MODAL":
      return { ...state, itemModal: { open: false, mode: "create", data: null } };

    // ── Delete targets ────────────────────────────────────────────────────────
    case "SET_CATEGORY_TO_DELETE":
      return { ...state, categoryToDelete: action.payload };

    case "SET_ITEM_TO_DELETE":
      return { ...state, itemToDelete: action.payload };

    // ── Upload modal (DnD) ────────────────────────────────────────────────────
    case "OPEN_UPLOAD_MODAL":
      return { ...state, uploadModal: { open: true, files: action.files } };

    case "CLOSE_UPLOAD_MODAL":
      return { ...state, uploadModal: { open: false, files: [] } };

    // ── Drag state ────────────────────────────────────────────────────────────
    case "SET_DRAGGING":
      return { ...state, isDragging: action.payload };

    // ── Errors ────────────────────────────────────────────────────────────────
    case "SET_ERROR":
      return { ...state, pageError: action.payload };

    case "CLEAR_ERROR":
      return { ...state, pageError: null };

    // ── Tab ───────────────────────────────────────────────────────────────────
    case "SET_TAB":
      return { ...state, activeTab: action.payload };

    default:
      return state;
  }
}
