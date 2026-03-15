import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

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

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive ? "text-yellow-400" : "text-white hover:text-yellow-400"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <NavLink
          to="/"
          onClick={handleCloseMenu}
          className="text-xl font-extrabold tracking-tight text-white sm:text-2xl"
        >
          Football Academy
        </NavLink>

        <div className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/training-sessions" className={navLinkClass}>
            Sessions
          </NavLink>

          {token && (
            <NavLink to="/my-bookings" className={navLinkClass}>
              My Bookings
            </NavLink>
          )}

          {!token ? (
            <>
              <NavLink
                to="/login"
                className="text-sm font-semibold text-white transition hover:text-yellow-400"
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-300"
              >
                Join Now
              </NavLink>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-300"
            >
              Logout
            </button>
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
        <div className="border-t border-white/10 bg-neutral-950/95 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <NavLink
              to="/"
              end
              className={navLinkClass}
              onClick={handleCloseMenu}
            >
              Home
            </NavLink>

            <NavLink
              to="/training-sessions"
              className={navLinkClass}
              onClick={handleCloseMenu}
            >
              Sessions
            </NavLink>

            {token && (
              <NavLink
                to="/my-bookings"
                className={navLinkClass}
                onClick={handleCloseMenu}
              >
                My Bookings
              </NavLink>
            )}

            {!token ? (
              <div className="flex flex-col gap-3 pt-2">
                <NavLink
                  to="/login"
                  onClick={handleCloseMenu}
                  className="rounded-full border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-400"
                >
                  Login
                </NavLink>

                <NavLink
                  to="/register"
                  onClick={handleCloseMenu}
                  className="rounded-full bg-yellow-400 px-4 py-3 text-center text-sm font-bold text-black transition hover:bg-yellow-300"
                >
                  Join Now
                </NavLink>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="mt-2 rounded-full bg-yellow-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-yellow-300"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;