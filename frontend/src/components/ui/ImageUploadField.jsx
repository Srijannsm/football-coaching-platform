function ImageUploadField({
  label = "Profile Image",
  previewUrl = "",
  onFileSelect,
  onRemove,
  error = "",
  helperText = "JPG, PNG, or WEBP. Maximum size 2MB.",
  accept = "image/jpeg,image/png,image/webp",
  size = "md",
}) {
  const sizeClasses = {
    sm: "h-20 w-20",
    md: "h-24 w-24",
    lg: "h-28 w-28",
  };

  function handleChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeInBytes = 2 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      onFileSelect?.(null, "Only JPG, PNG, and WEBP images are allowed.");
      return;
    }

    if (file.size > maxSizeInBytes) {
      onFileSelect?.(null, "Image size must be 2MB or less.");
      return;
    }

    onFileSelect?.(file, "");
  }

  return (
    <div>
      <label className="mb-3 block text-sm font-semibold text-white">
        {label}
      </label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className={`${sizeClasses[size]} overflow-hidden rounded-full border border-white/10 bg-neutral-900`}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
              No Image
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white">
            <span>Upload Image</span>
            <input
              type="file"
              accept={accept}
              onChange={handleChange}
              className="hidden"
            />
          </label>

          {previewUrl && (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center rounded-full border border-red-500/20 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
            >
              Remove Image
            </button>
          )}
        </div>
      </div>

      {helperText && (
        <p className="mt-3 text-xs text-neutral-500">{helperText}</p>
      )}

      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}

export default ImageUploadField;