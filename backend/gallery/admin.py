from django.contrib import admin

from .models import GalleryCategory, GalleryItem


class GalleryItemInline(admin.TabularInline):
    model = GalleryItem
    extra = 1
    fields = ["media_type", "image", "video_url", "thumbnail", "caption", "display_order", "is_active"]


@admin.register(GalleryCategory)
class GalleryCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "display_order", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ("name",)}
    ordering = ["display_order", "name"]
    inlines = [GalleryItemInline]


@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ["__str__", "category", "media_type", "display_order", "is_active", "created_at"]
    list_filter = ["media_type", "is_active", "category"]
    search_fields = ["caption", "category__name"]
    ordering = ["category", "display_order", "-created_at"]
