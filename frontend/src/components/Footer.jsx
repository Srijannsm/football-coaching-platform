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

          {/* Programs / Platform */}
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

          {/* Contact / CTA */}
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
            {/* <Link to="/privacy" className="transition hover:text-brand-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition hover:text-brand-primary">
              Terms & Conditions
            </Link> */}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;