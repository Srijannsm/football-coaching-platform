from rest_framework import serializers


class AdminDashboardStatsSerializer(serializers.Serializer):
    total_players = serializers.IntegerField()
    total_coaches = serializers.IntegerField()
    total_admins = serializers.IntegerField()
    total_programs = serializers.IntegerField()
    active_programs = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    pending_bookings = serializers.IntegerField()
    confirmed_bookings = serializers.IntegerField()
    cancelled_bookings = serializers.IntegerField()
    upcoming_sessions = serializers.IntegerField()
    cancelled_sessions = serializers.IntegerField()
    unpublished_sessions = serializers.IntegerField()
    total_enquiries = serializers.IntegerField()
    new_enquiries = serializers.IntegerField()
    contacted_enquiries = serializers.IntegerField()
    closed_enquiries = serializers.IntegerField()


class RecentBookingSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    player_name = serializers.CharField()
    session_title = serializers.CharField()
    session_date = serializers.DateField(allow_null=True)
    status = serializers.CharField()
    booked_at = serializers.DateTimeField()


class RecentEnquirySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()
    program_title = serializers.CharField(allow_null=True)
    status = serializers.CharField()
    created_at = serializers.DateTimeField()


class UpcomingSessionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    program_title = serializers.CharField()
    coach_name = serializers.CharField()
    session_date = serializers.DateField(allow_null=True)
    start_time = serializers.TimeField(allow_null=True)
    location = serializers.CharField()
    max_players = serializers.IntegerField()
    booked_players_count = serializers.IntegerField()
    available_slots = serializers.IntegerField()


class AdminDashboardSerializer(serializers.Serializer):
    stats = AdminDashboardStatsSerializer()
    recent_bookings = RecentBookingSerializer(many=True)
    recent_enquiries = RecentEnquirySerializer(many=True)
    upcoming_sessions_preview = UpcomingSessionSerializer(many=True)