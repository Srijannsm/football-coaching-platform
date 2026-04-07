from django.urls import path
from .dashboard_views import (
    AdminDashboardView,
    AdminPlayerListView,
    AdminPlayerDetailView,
    AdminBookingListView,
    AdminBookingDetailView,
    AdminBookingStatusUpdateView,
    AdminBulkBookingStatusUpdateView,
    AdminBulkBookingDeleteView,
    AdminBulkEnquiryDeleteView,
    AdminBulkEnquiryStatusUpdateView,
    AdminBulkSessionDeleteView,
    AdminBulkSessionStatusUpdateView,
    AdminBulkProgramDeleteView,
    AdminTrainingProgramListCreateView,
    AdminTrainingProgramDetailView,
    AdminTrainingSessionListCreateView,
    AdminTrainingSessionDetailView,
    AdminEnquiryListView,
    AdminEnquiryDetailView,
    AdminCoachListView,
    AdminCoachDirectoryListView,
    AdminCoachDetailView,
    AdminNotificationListView,
    AdminNotificationMarkReadView,
    AdminNotificationMarkAllReadView,
    AdminGalleryCategoryListCreateView,
    AdminGalleryCategoryDetailView,
    AdminGalleryItemListCreateView,
    AdminGalleryItemDetailView,
    AdminAuditLogView,
    AdminAnalyticsView,
)

urlpatterns = [
    path("dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),

    path("players/", AdminPlayerListView.as_view(), name="admin-players"),
    path("players/<int:pk>/", AdminPlayerDetailView.as_view(), name="admin-player-detail"),

    path("programs/", AdminTrainingProgramListCreateView.as_view(), name="admin-programs"),
    path("programs/<int:pk>/", AdminTrainingProgramDetailView.as_view(), name="admin-program-detail"),
    path("programs/bulk-delete/", AdminBulkProgramDeleteView.as_view(), name="admin-program-bulk-delete"),

    path("sessions/", AdminTrainingSessionListCreateView.as_view(), name="admin-sessions"),
    path("sessions/<int:pk>/", AdminTrainingSessionDetailView.as_view(), name="admin-session-detail"),
    path("sessions/bulk-delete/", AdminBulkSessionDeleteView.as_view(), name="admin-session-bulk-delete"),
    path("sessions/bulk-status/", AdminBulkSessionStatusUpdateView.as_view(), name="admin-session-bulk-status"),

    path("bookings/", AdminBookingListView.as_view(), name="admin-bookings"),
    path("bookings/<int:pk>/", AdminBookingDetailView.as_view(), name="admin-booking-detail"),
    path("bookings/<int:pk>/status/", AdminBookingStatusUpdateView.as_view(), name="admin-booking-status-update"),
    path("bookings/bulk-status/", AdminBulkBookingStatusUpdateView.as_view(), name="admin-booking-bulk-status"),
    path("bookings/bulk-delete/", AdminBulkBookingDeleteView.as_view(), name="admin-booking-bulk-delete"),

    path("enquiries/", AdminEnquiryListView.as_view(), name="admin-enquiries"),
    path("enquiries/<int:pk>/", AdminEnquiryDetailView.as_view(), name="admin-enquiry-detail"),
    path("enquiries/bulk-delete/", AdminBulkEnquiryDeleteView.as_view(), name="admin-enquiry-bulk-delete"),
    path("enquiries/bulk-status/", AdminBulkEnquiryStatusUpdateView.as_view(), name="admin-enquiry-bulk-status"),

    # path("coaches/", AdminCoachListView.as_view(), name="admin-coaches"),
    path("coaches/directory/", AdminCoachDirectoryListView.as_view(), name="admin-coach-directory"),
    path("coaches/directory/<int:pk>/", AdminCoachDetailView.as_view(), name="admin-coach-detail"),

    path("notifications/", AdminNotificationListView.as_view(), name="admin-notifications"),
    path("notifications/<int:pk>/read/", AdminNotificationMarkReadView.as_view(), name="admin-notification-read"),
    path("notifications/mark-all-read/", AdminNotificationMarkAllReadView.as_view(), name="admin-notifications-mark-all-read"),

    path("gallery/categories/", AdminGalleryCategoryListCreateView.as_view(), name="admin-gallery-categories"),
    path("gallery/categories/<int:pk>/", AdminGalleryCategoryDetailView.as_view(), name="admin-gallery-category-detail"),
    path("gallery/items/", AdminGalleryItemListCreateView.as_view(), name="admin-gallery-items"),
    path("gallery/items/<int:pk>/", AdminGalleryItemDetailView.as_view(), name="admin-gallery-item-detail"),

    path("audit-log/", AdminAuditLogView.as_view(), name="admin-audit-log"),
    
    path("analytics/", AdminAnalyticsView.as_view(), name="admin-analytics"),
]