import { Helmet } from "react-helmet-async";

const SITE_NAME = "Football Academy";
const DEFAULT_DESCRIPTION =
  "Professional football coaching academy offering group sessions, 1-to-1 coaching, and goalkeeper training for all skill levels. Book your session online.";
const DEFAULT_IMAGE = "https://i.pinimg.com/1200x/81/d9/b5/81d9b59b6a53801b9c94bbb5df584cc2.jpg";

/**
 * SEO component — add to every page to manage <head> meta tags.
 *
 * Props:
 *   title        – page-specific title (appended with "| Football Academy")
 *   description  – meta description (max ~160 chars)
 *   canonical    – canonical URL (e.g. "https://example.com/training-sessions")
 *   image        – OG image URL (absolute)
 *   type         – OG type: "website" | "article" | "profile" (default: "website")
 *   noindex      – set true for auth/dashboard pages
 *   jsonLd       – array of JSON-LD schema objects to inject as structured data
 */
function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  jsonLd = [],
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* JSON-LD structured data */}
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

/**
 * Pre-built JSON-LD schemas for common use cases.
 */

export function buildOrganizationSchema({ name, url, logo, phone, email, address }) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name,
    url,
    logo,
    telephone: phone,
    email,
    address: address
      ? {
          "@type": "PostalAddress",
          addressLocality: address.city,
          addressCountry: address.country || "NP",
        }
      : undefined,
  };
}

export function buildTrainingSessionSchema({ session, url }) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: session.program_title || "Training Session",
    description: session.description || `${session.session_type?.replace("_", " ")} training session`,
    url,
    startDate: session.session_date
      ? `${session.session_date}T${session.start_time || "00:00:00"}`
      : undefined,
    endDate: session.session_date && session.end_time
      ? `${session.session_date}T${session.end_time}`
      : undefined,
    location: session.location
      ? {
          "@type": "Place",
          name: session.location,
        }
      : undefined,
    organizer: {
      "@type": "Organization",
      name: "Football Academy",
    },
    offers: {
      "@type": "Offer",
      price: session.price,
      priceCurrency: "NPR",
      availability: session.is_full
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url,
    },
  };
}

export function buildCoachSchema({ coach, url }) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: coach.full_name || `${coach.first_name} ${coach.last_name}`.trim(),
    jobTitle: "Football Coach",
    url,
    worksFor: {
      "@type": "Organization",
      name: "Football Academy",
    },
    description: coach.bio,
  };
}

export default SEO;
