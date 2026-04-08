from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone

from training.models import TrainingSession
from accounts.models import CoachProfile


def robots_txt(request):
    frontend_url = getattr(settings, "FRONTEND_URL", "").rstrip("/")
    lines = [
        "User-agent: *",
        "Allow: /",
        "",
        # Block admin and private areas
        "Disallow: /admin/",
        "Disallow: /api/",
        "Disallow: /player-dashboard/",
        "Disallow: /admin-dashboard/",
        "Disallow: /login",
        "Disallow: /register",
        "Disallow: /forgot-password",
        "Disallow: /reset-password",
        "Disallow: /verify-email",
        "",
        f"Sitemap: {frontend_url}/sitemap.xml",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")


def sitemap_xml(request):
    frontend_url = getattr(settings, "FRONTEND_URL", "").rstrip("/")
    today = timezone.localdate().isoformat()

    static_urls = [
        ("", "1.0", "weekly"),
        ("/training-sessions", "0.9", "daily"),
        ("/coaches", "0.8", "weekly"),
        ("/gallery", "0.7", "weekly"),
    ]

    urls = []
    for path, priority, changefreq in static_urls:
        urls.append(
            f"  <url>\n"
            f"    <loc>{frontend_url}{path}</loc>\n"
            f"    <lastmod>{today}</lastmod>\n"
            f"    <changefreq>{changefreq}</changefreq>\n"
            f"    <priority>{priority}</priority>\n"
            f"  </url>"
        )

    # Dynamic: published upcoming training sessions
    sessions = (
        TrainingSession.objects.filter(is_published=True, is_cancelled=False)
        .select_related("program")
        .only("id", "created_at")
        .order_by("-created_at")[:200]
    )
    for session in sessions:
        lastmod = session.created_at.date().isoformat() if session.created_at else today
        urls.append(
            f"  <url>\n"
            f"    <loc>{frontend_url}/training-sessions/{session.id}</loc>\n"
            f"    <lastmod>{lastmod}</lastmod>\n"
            f"    <changefreq>daily</changefreq>\n"
            f"    <priority>0.8</priority>\n"
            f"  </url>"
        )

    # Dynamic: coach profiles
    coaches = (
        CoachProfile.objects.filter(user__is_active=True, user__role="coach")
        .select_related("user")
        .only("id", "updated_at")
        .order_by("id")
    )
    for coach in coaches:
        lastmod = coach.updated_at.date().isoformat() if coach.updated_at else today
        urls.append(
            f"  <url>\n"
            f"    <loc>{frontend_url}/coaches/{coach.id}</loc>\n"
            f"    <lastmod>{lastmod}</lastmod>\n"
            f"    <changefreq>monthly</changefreq>\n"
            f"    <priority>0.6</priority>\n"
            f"  </url>"
        )

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>"
    )
    return HttpResponse(xml, content_type="application/xml")
