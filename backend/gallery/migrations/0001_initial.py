import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="GalleryCategory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("slug", models.SlugField(blank=True, unique=True)),
                ("description", models.TextField(blank=True)),
                ("display_order", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "Gallery Category",
                "verbose_name_plural": "Gallery Categories",
                "ordering": ["display_order", "name"],
            },
        ),
        migrations.CreateModel(
            name="GalleryItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "media_type",
                    models.CharField(
                        choices=[("photo", "Photo"), ("video", "Video")],
                        default="photo",
                        max_length=10,
                    ),
                ),
                ("image", models.ImageField(blank=True, null=True, upload_to="gallery/photos/")),
                ("video_url", models.URLField(blank=True, null=True)),
                ("thumbnail", models.ImageField(blank=True, null=True, upload_to="gallery/thumbnails/")),
                ("caption", models.CharField(blank=True, max_length=255)),
                ("display_order", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "category",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="items",
                        to="gallery.gallerycategory",
                    ),
                ),
            ],
            options={
                "verbose_name": "Gallery Item",
                "verbose_name_plural": "Gallery Items",
                "ordering": ["display_order", "-created_at"],
            },
        ),
    ]
