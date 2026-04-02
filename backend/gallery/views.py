import random

from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import GalleryCategory, GalleryItem
from .serializers import GalleryCategorySerializer, GalleryItemSerializer


class GalleryCategoryListView(generics.ListAPIView):
    serializer_class = GalleryCategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return GalleryCategory.objects.filter(is_active=True).prefetch_related("items")


class RandomGalleryItemsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        count = min(int(request.query_params.get("count", 8)), 20)
        items = list(GalleryItem.objects.filter(is_active=True).select_related("category"))
        sample = random.sample(items, min(len(items), count))
        serializer = GalleryItemSerializer(sample, many=True, context={"request": request})
        return Response(serializer.data)
