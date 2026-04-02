import { Link } from "react-router-dom";

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-sm text-white/70 transition hover:text-brand-primary"
    >
      {children}
    </Link>
  );
}

function SocialIcon({ label, href, path }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-brand-primary hover:text-brand-primary"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d={path} />
      </svg>
    </a>
  );
}

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://facebook.com/footballacademy",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/footballacademy",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@footballacademy",
    path: "M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z",
  },
  {
    label: "X / Twitter",
    href: "https://x.com/footballacademy",
    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  },
];

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0f1720] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-primary">
              Football Academy
            </p>

            <h2 className="mt-4 text-2xl font-black tracking-tight">
              Train with purpose. Play with confidence.
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
              Professional football coaching for players who want to improve
              technique, confidence, decision-making, and overall performance.
            </p>

            {/* Social media icons */}
            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map((s) => (
                <SocialIcon key={s.label} {...s} />
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white/90">
              Quick Links
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              <FooterLink to="/#about">About Us</FooterLink>
              <FooterLink to="/#gallery">Gallery</FooterLink>
              <FooterLink to="/#contact">Contact</FooterLink>
              <FooterLink to="/training-sessions">Sessions</FooterLink>
            </div>
          </div>

          {/* Player Access */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white/90">
              Player Access
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              <FooterLink to="/register">Join Academy</FooterLink>
              <FooterLink to="/login">Login</FooterLink>
              <FooterLink to="/player-dashboard">Player Dashboard</FooterLink>
              <FooterLink to="/my-bookings">My Bookings</FooterLink>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-white/90">
              Contact
            </h3>

            <div className="mt-5 space-y-3 text-sm text-white/70">
              <p>Kathmandu, Nepal</p>
              <p>+977 98XXXXXXXX</p>
              <p>info@footballacademy.com</p>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="inline-flex items-center rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Register Now
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-white/10" />

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Football Academy. All rights reserved.</p>

          <div className="flex flex-wrap gap-5">
            {/* <Link to="/privacy" className="transition hover:text-brand-primary">Privacy Policy</Link> */}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
