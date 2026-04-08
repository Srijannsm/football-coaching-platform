import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def _admin_email():
    return (
        getattr(settings, "ADMIN_NOTIFICATION_EMAIL", None)
        or getattr(settings, "EMAIL_HOST_USER", None)
    )


def _from_email():
    return getattr(settings, "DEFAULT_FROM_EMAIL", "Football Academy <noreply@footballacademy.com>")


def send_enquiry_admin_notification(enquiry):
    recipient = _admin_email()
    if not recipient:
        return
    try:
        program_title = enquiry.program.title if enquiry.program else "General"
        send_mail(
            subject=f"New Enquiry from {enquiry.name}",
            message=(
                f"New enquiry received on Football Academy:\n\n"
                f"Name:    {enquiry.name}\n"
                f"Email:   {enquiry.email}\n"
                f"Phone:   {enquiry.phone}\n"
                f"Program: {program_title}\n\n"
                f"Message:\n{enquiry.message}\n\n"
                f"View in admin: /admin-dashboard/enquiries"
            ),
            from_email=_from_email(),
            recipient_list=[recipient],
        )
    except Exception as exc:
        logger.error("Failed to send enquiry admin email: %s", exc)


def send_enquiry_confirmation(enquiry):
    try:
        program_title = enquiry.program.title if enquiry.program else "General"
        send_mail(
            subject="Thank you for your enquiry — Football Academy",
            message=(
                f"Hi {enquiry.name},\n\n"
                f"Thank you for reaching out to Football Academy! We've received your enquiry "
                f"and will get back to you shortly.\n\n"
                f"What you sent us:\n"
                f"  Program: {program_title}\n"
                f"  Message: {enquiry.message}\n\n"
                f"We typically respond within 24–48 hours.\n\n"
                f"Best regards,\nFootball Academy Team"
            ),
            from_email=_from_email(),
            recipient_list=[enquiry.email],
        )
    except Exception as exc:
        logger.error("Failed to send enquiry confirmation email: %s", exc)


def send_booking_admin_notification(booking):
    recipient = _admin_email()
    if not recipient:
        return
    try:
        player = booking.player.user
        player_name = f"{player.first_name} {player.last_name}".strip() or player.username
        send_mail(
            subject=f"New Booking — {player_name}",
            message=(
                f"New session booking on Football Academy:\n\n"
                f"Player:   {player_name} ({player.email})\n"
                f"Session:  {booking.session.program.title}\n"
                f"Date:     {booking.session.session_date} at {booking.session.start_time}\n"
                f"Location: {booking.session.location}\n\n"
                f"View in admin: /admin-dashboard/bookings"
            ),
            from_email=_from_email(),
            recipient_list=[recipient],
        )
    except Exception as exc:
        logger.error("Failed to send booking admin email: %s", exc)


def send_cancellation_admin_notification(booking):
    recipient = _admin_email()
    if not recipient:
        return
    try:
        player = booking.player.user
        player_name = f"{player.first_name} {player.last_name}".strip() or player.username
        send_mail(
            subject=f"Booking Cancelled — {player_name}",
            message=(
                f"A booking has been cancelled on Football Academy:\n\n"
                f"Player:   {player_name} ({player.email})\n"
                f"Session:  {booking.session.program.title}\n"
                f"Date:     {booking.session.session_date} at {booking.session.start_time}\n"
                f"Location: {booking.session.location}\n\n"
                f"View in admin: /admin-dashboard/bookings"
            ),
            from_email=_from_email(),
            recipient_list=[recipient],
        )
    except Exception as exc:
        logger.error("Failed to send cancellation admin email: %s", exc)


def send_welcome_email(user):
    try:
        player_name = f"{user.first_name} {user.last_name}".strip() or user.username
        send_mail(
            subject="Welcome to Football Academy!",
            message=(
                f"Hi {player_name},\n\n"
                f"Welcome to Football Academy! Your account has been successfully created.\n\n"
                f"You can now:\n"
                f"  • Browse and book training sessions\n"
                f"  • View your booking history\n"
                f"  • Update your player profile\n\n"
                f"Log in at any time to get started.\n\n"
                f"See you on the pitch!\n\n"
                f"Best regards,\nFootball Academy Team"
            ),
            from_email=_from_email(),
            recipient_list=[user.email],
        )
    except Exception as exc:
        logger.error("Failed to send welcome email: %s", exc)


def send_registration_admin_notification(user):
    recipient = _admin_email()
    if not recipient:
        return
    try:
        player_name = f"{user.first_name} {user.last_name}".strip() or user.username
        send_mail(
            subject=f"New Player Registered — {player_name}",
            message=(
                f"A new player has registered on Football Academy:\n\n"
                f"Name:     {player_name}\n"
                f"Username: {user.username}\n"
                f"Email:    {user.email}\n\n"
                f"View in admin: /admin-dashboard/players"
            ),
            from_email=_from_email(),
            recipient_list=[recipient],
        )
    except Exception as exc:
        logger.error("Failed to send registration admin email: %s", exc)


def send_session_cancelled_to_players(session):
    """Notify all booked players when a training session is cancelled."""
    from bookings.models import Booking

    bookings = (
        Booking.objects.filter(
            session=session,
            status__in=[Booking.STATUS_PENDING, Booking.STATUS_CONFIRMED],
        )
        .select_related("player__user")
    )

    if not bookings.exists():
        return

    try:
        program_title = session.program.title if session.program else "Training Session"
    except Exception:
        program_title = "Training Session"

    session_date = session.session_date.strftime("%B %d, %Y") if session.session_date else "TBD"
    session_time = session.start_time.strftime("%I:%M %p") if session.start_time else "TBD"
    location = session.location or "TBD"

    try:
        coach_name = (
            f"{session.coach.first_name} {session.coach.last_name}".strip()
            if session.coach
            else "Your Coach"
        )
    except Exception:
        coach_name = "Your Coach"

    for booking in bookings:
        user = booking.player.user
        player_name = f"{user.first_name} {user.last_name}".strip() or user.username
        try:
            html_message = (
                f"<p>Hi {player_name},</p>"
                f"<p>We're sorry to inform you that the following session has been <strong>cancelled</strong>:</p>"
                f"<ul>"
                f"<li><strong>Session:</strong> {program_title}</li>"
                f"<li><strong>Date:</strong> {session_date}</li>"
                f"<li><strong>Time:</strong> {session_time}</li>"
                f"<li><strong>Location:</strong> {location}</li>"
                f"<li><strong>Coach:</strong> {coach_name}</li>"
                f"</ul>"
                f"<p>We apologise for any inconvenience. Please check the platform for alternative sessions.</p>"
                f"<p>Football Academy Team</p>"
            )
            text_message = (
                f"Hi {player_name},\n\n"
                f"We're sorry to inform you that the following session has been cancelled:\n\n"
                f"  Session:  {program_title}\n"
                f"  Date:     {session_date}\n"
                f"  Time:     {session_time}\n"
                f"  Location: {location}\n"
                f"  Coach:    {coach_name}\n\n"
                f"We apologise for any inconvenience. Please check the platform for alternative sessions.\n\n"
                f"Football Academy Team"
            )
            msg = EmailMultiAlternatives(
                subject=f"Session Cancelled: {program_title} — Football Academy",
                body=text_message,
                from_email=_from_email(),
                to=[user.email],
            )
            msg.attach_alternative(html_message, "text/html")
            msg.send()
        except Exception as exc:
            logger.error("Failed to send session cancellation email to %s: %s", user.email, exc)


def send_password_reset_email(user, frontend_url, token):
    """Send a password reset link. Raises on failure so the caller can handle it."""
    reset_url = f"{frontend_url.rstrip('/')}/reset-password?token={token}"
    player_name = f"{user.first_name} {user.last_name}".strip() or user.username
    html_message = (
        f"<p>Hi {player_name},</p>"
        f"<p>We received a request to reset your Football Academy password. "
        f"Click the button below to set a new password:</p>"
        f'<p><a href="{reset_url}" style="background:#22c55e;color:#fff;padding:12px 24px;'
        f'border-radius:6px;text-decoration:none;display:inline-block;">Reset My Password</a></p>'
        f"<p>If the button doesn't work, copy and paste this link into your browser:</p>"
        f"<p>{reset_url}</p>"
        f"<p>This link will expire in 1 hour. If you didn't request a password reset, "
        f"you can safely ignore this email.</p>"
        f"<p>Football Academy Team</p>"
    )
    text_message = (
        f"Hi {player_name},\n\n"
        f"We received a request to reset your Football Academy password.\n\n"
        f"Reset link:\n{reset_url}\n\n"
        f"This link will expire in 1 hour. If you didn't request this, "
        f"you can safely ignore this email.\n\n"
        f"Football Academy Team"
    )
    msg = EmailMultiAlternatives(
        subject="Reset your password — Football Academy",
        body=text_message,
        from_email=_from_email(),
        to=[user.email],
    )
    msg.attach_alternative(html_message, "text/html")
    msg.send()


def send_verification_email(user, frontend_url):
    """Send email verification link. Raises on failure so the caller can handle it."""
    from django.core.signing import TimestampSigner

    signer = TimestampSigner()
    token = signer.sign(user.email)
    verify_url = f"{frontend_url.rstrip('/')}/verify-email?token={token}"

    player_name = f"{user.first_name} {user.last_name}".strip() or user.username
    html_message = (
        f"<p>Hi {player_name},</p>"
        f"<p>Welcome to Football Academy! Please verify your email address by clicking the link below:</p>"
        f'<p><a href="{verify_url}" style="background:#22c55e;color:#fff;padding:12px 24px;'
        f'border-radius:6px;text-decoration:none;display:inline-block;">Verify My Email</a></p>'
        f"<p>If the button doesn't work, copy and paste this link into your browser:</p>"
        f"<p>{verify_url}</p>"
        f"<p>This link will expire in 24 hours.</p>"
        f"<p>See you on the pitch!<br>Football Academy Team</p>"
    )
    text_message = (
        f"Hi {player_name},\n\n"
        f"Welcome to Football Academy! Please verify your email address by clicking this link:\n\n"
        f"{verify_url}\n\n"
        f"This link will expire in 24 hours.\n\n"
        f"See you on the pitch!\nFootball Academy Team"
    )
    msg = EmailMultiAlternatives(
        subject="Verify your email — Football Academy",
        body=text_message,
        from_email=_from_email(),
        to=[user.email],
    )
    msg.attach_alternative(html_message, "text/html")
    msg.send()
