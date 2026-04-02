from django.core.exceptions import ValidationError
from django.db import models
from django.utils.text import slugify


class GalleryCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name = "Gallery Category"
        verbose_name_plural = "Gallery Categories"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while (
                GalleryCategory.objects.filter(slug=slug).exclude(pk=self.pk).exists()
            ):
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class GalleryItem(models.Model):
    TYPE_PHOTO = "photo"
    TYPE_VIDEO = "video"

    MEDIA_TYPE_CHOICES = [
        (TYPE_PHOTO, "Photo"),
        (TYPE_VIDEO, "Video"),
    ]

    category = models.ForeignKey(
        GalleryCategory,
        on_delete=models.CASCADE,
        related_name="items",
    )
    media_type = models.CharField(
        max_length=10,
        choices=MEDIA_TYPE_CHOICES,
        default=TYPE_PHOTO,
    )


    image = models.ImageField(upload_to="gallery/photos/", blank=True, null=True)
    video_file = models.FileField(upload_to="gallery/videos/", blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    thumbnail = models.ImageField(
        upload_to="gallery/thumbnails/", blank=True, null=True
    )
    caption = models.CharField(max_length=255, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["display_order", "-created_at"]
        verbose_name = "Gallery Item"
        verbose_name_plural = "Gallery Items"

    def __str__(self):
        label = self.caption or f"{self.media_type} #{self.pk}"
        return f"{self.category.name} — {label}"

    def clean(self):
        if self.media_type == self.TYPE_PHOTO and not self.image:
            raise ValidationError({"image": "Photo items require an image."})

        if self.media_type == self.TYPE_VIDEO:
            if not self.video_url and not self.video_file:
                raise ValidationError(
                    {
                        "video_url": "Provide either a video URL or upload a video file.",
                        "video_file": "Provide either a video URL or upload a video file.",
                    }
                )
