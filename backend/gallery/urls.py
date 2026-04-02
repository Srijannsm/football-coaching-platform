from django.urls import path

from .views import GalleryCategoryListView, RandomGalleryItemsView

urlpatterns = [
    path("gallery/categories/", GalleryCategoryListView.as_view(), name="gallery-categories"),
    path("gallery/random/", RandomGalleryItemsView.as_view(), name="gallery-random"),
]
