from rest_framework import serializers

from .models import GalleryCategory, GalleryItem


class GalleryItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    image_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = GalleryItem
        fields = "__all__"

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

    def get_thumbnail_url(self, obj):
        request = self.context.get("request")
        if obj.thumbnail and hasattr(obj.thumbnail, "url"):
            return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url
        return None


class GalleryCategorySerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = GalleryCategory
        fields = ["id", "name", "slug", "description", "display_order", "item_count", "items"]

    def get_items(self, obj):
        active_items = obj.items.filter(is_active=True)
        return GalleryItemSerializer(active_items, many=True, context=self.context).data

    def get_item_count(self, obj):
        return obj.items.filter(is_active=True).count()
