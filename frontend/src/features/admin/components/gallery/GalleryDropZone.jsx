import { memo, useRef } from "react";
import { UploadCloud } from "lucide-react";

function GalleryDropZone({ isDragging, onDrop, disabled = false }) {
  const inputRef = useRef(null);

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    onDrop(null, "enter");
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    // Only fire if leaving the drop zone itself (not a child)
    if (e.currentTarget.contains(e.relatedTarget)) return;
    onDrop(null, "leave");
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    onDrop(files, "drop");
  }

  function handleBrowse() {
    inputRef.current?.click();
  }

  function handleInputChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length) onDrop(files, "drop");
    e.target.value = "";
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        "relative flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200",
        isDragging
          ? "border-brand-primary bg-brand-primary/6 scale-[1.01]"
          : "border-app-border bg-app-surface-2/50 hover:border-brand-primary/40 hover:bg-app-surface-2",
        disabled ? "pointer-events-none opacity-50" : "cursor-pointer",
      ].join(" ")}
      onClick={handleBrowse}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
          isDragging ? "bg-brand-primary/20 text-brand-primary" : "bg-app-surface-2 text-app-text-muted"
        }`}
      >
        <UploadCloud size={22} />
      </div>

      <div>
        <p className="text-sm font-semibold text-app-text">
          {isDragging ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="mt-0.5 text-xs text-app-text-muted">
          or{" "}
          <span className="font-medium text-brand-primary underline-offset-2 hover:underline">
            browse
          </span>{" "}
          — images &amp; videos supported
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="sr-only"
        onChange={handleInputChange}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export default memo(GalleryDropZone);
