import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "./ui/Button";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleCloseMenu = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-medium transition ${isActive ? "text-yellow-400" : "text-neutral-200 hover:text-yellow-400"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `rounded-xl px-3 py-2 text-sm font-medium transition ${isActive
      ? "bg-yellow-400/10 text-yellow-400"
      : "text-neutral-200 hover:bg-white/5 hover:text-yellow-400"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <NavLink
          to="/"
          onClick={handleCloseMenu}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-sm font-black text-black shadow-lg shadow-yellow-400/20">
            FA
          </div>

          <div className="leading-tight">
            <p className="text-base font-extrabold tracking-tight text-white sm:text-lg">
              Football Academy
            </p>
            <p className="hidden text-xs text-neutral-400 sm:block">
              Train. Book. Improve.
            </p>
          </div>
        </NavLink>

        <div className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/training-sessions" className={navLinkClass}>
            Sessions
          </NavLink>

          <a href="/#about" className="text-sm font-medium text-neutral-200 transition hover:text-yellow-400">
            About Us
          </a>

          <a href="/#gallery" className="text-sm font-medium text-neutral-200 transition hover:text-yellow-400">
            Gallery
          </a>

          <a href="/#contact" className="text-sm font-medium text-neutral-200 transition hover:text-yellow-400">
            Contact Us
          </a>

        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!token ? (
            <>
              <NavLink to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-white/10 bg-transparent text-white hover:border-yellow-400 hover:text-yellow-400"
                >
                  Login
                </Button>
              </NavLink>

              <NavLink to="/register">
                <Button
                  size="sm"
                  className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300"
                >
                  Join Academy
                </Button>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/player-dashboard">
                <Button
                  size="sm"
                  className="rounded-full border-white/10 bg-transparent text-white hover:border-red-400 hover:text-red-400"
                >
                  Dashboard
                </Button>
              </NavLink>

              <Button
                size="sm"
                onClick={handleLogout}
                variant="outline"
                className="rounded-full border-white/10 bg-transparent text-white hover:border-red-400 hover:text-red-400"
              >
                Logout
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white transition hover:border-yellow-400 hover:text-yellow-400 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="text-lg">{mobileMenuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-neutral-950/95 px-6 py-5 md:hidden">
          <div className="flex flex-col gap-2">
            <NavLink
              to="/"
              end
              className={mobileNavLinkClass}
              onClick={handleCloseMenu}
            >
              Home
            </NavLink>

            <NavLink
              to="/training-sessions"
              className={mobileNavLinkClass}
              onClick={handleCloseMenu}
            >
              Sessions
            </NavLink>

            {token && (
              <>
                <NavLink
                  to="/player-dashboard"
                  className={mobileNavLinkClass}
                  onClick={handleCloseMenu}
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/my-bookings"
                  className={mobileNavLinkClass}
                  onClick={handleCloseMenu}
                >
                  My Bookings
                </NavLink>

                <NavLink
                  to="/player-profile"
                  className={mobileNavLinkClass}
                  onClick={handleCloseMenu}
                >
                  Profile
                </NavLink>
              </>
            )}
          </div>

          <div className="mt-5 border-t border-white/10 pt-5">
            {!token ? (
              <div className="flex flex-col gap-3">
                <NavLink to="/login" onClick={handleCloseMenu}>
                  <Button
                    fullWidth
                    variant="outline"
                    className="rounded-full border-white/10 bg-transparent text-white hover:border-yellow-400 hover:text-yellow-400"
                  >
                    Login
                  </Button>
                </NavLink>

                <NavLink to="/register" onClick={handleCloseMenu}>
                  <Button
                    fullWidth
                    className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300"
                  >
                    Join Academy
                  </Button>
                </NavLink>
              </div>
            ) : (
              <Button
                fullWidth
                onClick={handleLogout}
                variant="outline"
                className="rounded-full border-white/10 bg-transparent text-white hover:border-red-400 hover:text-red-400"
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;