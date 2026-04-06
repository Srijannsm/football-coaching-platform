"""
Image processing utilities for uploaded images.

Provides validation (magic-byte check), EXIF stripping, resizing,
and WebP conversion so every uploaded image is safe and optimised.
"""

import io
import logging

from PIL import Image, UnidentifiedImageError
from django.conf import settings as django_settings
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import InMemoryUploadedFile

logger = logging.getLogger(__name__)

# Allowed image formats (checked via Pillow, not file extension)
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP", "GIF"}


def _setting(name, default):
    return getattr(django_settings, name, default)


def validate_image_file(image_file):
    """
    Validate an uploaded image by actually opening it with Pillow.
    Catches malicious files disguised as images, corrupt files, and
    unsupported formats.

    Raises ValidationError if the file is invalid.
    """
    if not image_file:
        return

    max_file_size = _setting("IMAGE_MAX_FILE_SIZE", 5 * 1024 * 1024)
    if hasattr(image_file, "size") and image_file.size > max_file_size:
        raise ValidationError(
            f"Image file too large. Maximum size is "
            f"{max_file_size // (1024 * 1024)}MB."
        )

    try:
        image_file.seek(0)
        img = Image.open(image_file)
        img.verify()  # verify without fully loading pixel data
        image_file.seek(0)
    except (UnidentifiedImageError, Exception) as exc:
        raise ValidationError(
            "Upload a valid image. The file you uploaded was either not an "
            "image or a corrupted image."
        ) from exc

    # Re-open after verify (verify leaves the file in an unusable state)
    image_file.seek(0)
    img = Image.open(image_file)

    if img.format not in ALLOWED_FORMATS:
        raise ValidationError(
            f"Unsupported image format '{img.format}'. "
            f"Allowed formats: {', '.join(sorted(ALLOWED_FORMATS))}."
        )

    image_file.seek(0)


def process_image(image_file, *, max_dimension=None, quality=None):
    """
    Process an uploaded image:
      1. Validate it (magic-byte check via Pillow).
      2. Strip all EXIF / metadata.
      3. Downscale if any dimension exceeds *max_dimension*.
      4. Convert to WebP for smaller file size.

    Returns a new InMemoryUploadedFile ready to be saved to an ImageField,
    or None if *image_file* is falsy.
    """
    if not image_file:
        return None

    if max_dimension is None:
        max_dimension = _setting("IMAGE_MAX_DIMENSION", 1920)
    if quality is None:
        quality = _setting("IMAGE_WEBP_QUALITY", 82)

    validate_image_file(image_file)

    image_file.seek(0)
    img = Image.open(image_file)

    # Handle transparency: convert palette/RGBA modes appropriately
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        # Keep alpha channel for WebP
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")

    # Honour EXIF orientation then strip all metadata
    from PIL import ImageOps
    img = ImageOps.exif_transpose(img) or img

    # Downscale if needed (preserves aspect ratio)
    if max(img.size) > max_dimension:
        img.thumbnail((max_dimension, max_dimension), Image.LANCZOS)

    # Encode to WebP
    buffer = io.BytesIO()
    img.save(buffer, format="WEBP", quality=quality, method=4)
    buffer.seek(0)

    # Build a new filename with .webp extension
    original_name = getattr(image_file, "name", "image.webp")
    stem = original_name.rsplit(".", 1)[0] if "." in original_name else original_name
    new_name = f"{stem}.webp"

    return InMemoryUploadedFile(
        file=buffer,
        field_name="image",
        name=new_name,
        content_type="image/webp",
        size=buffer.getbuffer().nbytes,
        charset=None,
    )


def make_thumbnail(image_file, *, size=None, quality=None):
    """
    Create a thumbnail from an uploaded image.
    Returns an InMemoryUploadedFile, or None if *image_file* is falsy.
    """
    if not image_file:
        return None

    if size is None:
        size = _setting("IMAGE_THUMBNAIL_SIZE", (300, 300))
    if quality is None:
        quality = _setting("IMAGE_WEBP_QUALITY", 82)

    image_file.seek(0)
    img = Image.open(image_file)

    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        img = img.convert("RGBA")
    else:
        img = img.convert("RGB")

    from PIL import ImageOps
    img = ImageOps.exif_transpose(img) or img
    img.thumbnail(size, Image.LANCZOS)

    buffer = io.BytesIO()
    img.save(buffer, format="WEBP", quality=quality, method=4)
    buffer.seek(0)

    original_name = getattr(image_file, "name", "thumb.webp")
    stem = original_name.rsplit(".", 1)[0] if "." in original_name else original_name
    new_name = f"{stem}_thumb.webp"

    return InMemoryUploadedFile(
        file=buffer,
        field_name="image",
        name=new_name,
        content_type="image/webp",
        size=buffer.getbuffer().nbytes,
        charset=None,
    )
