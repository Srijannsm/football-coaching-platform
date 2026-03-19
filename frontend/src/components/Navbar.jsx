import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Button from "./ui/Button";
import ThemeToggle from "./ThemeToggle";

function Navbar({ mode = "solid" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("accessToken");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isAtTop, setIsAtTop] = useState(mode === "overlay");

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    closeMobileMenu();
    navigate("/");
  }

  function handleGoHome(event) {
    if (location.pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      closeMobileMenu();
    }
  }

  function handleAnchorNavigation(event, sectionId) {
    if (location.pathname === "/") {
      event.preventDefault();
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      closeMobileMenu();
      return;
    }

    closeMobileMenu();
  }

  useEffect(() => {
    let lastScrollY = window.scrollY;

    function handleResize() {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    }

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY;

      if (mode === "overlay") {
        setIsAtTop(currentScrollY < 40);
      } else {
        setIsAtTop(false);
      }

      if (mobileMenuOpen) {
        setIsHidden(false);
        lastScrollY = currentScrollY;
        return;
      }

      if (Math.abs(scrollDiff) < 8) return;

      if (currentScrollY < 40) {
        setIsHidden(false);
      } else if (scrollDiff > 0 && currentScrollY > 120) {
        setIsHidden(true);
      } else if (scrollDiff < 0) {
        setIsHidden(false);
      }

      lastScrollY = currentScrollY;
    }

    handleScroll();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mobileMenuOpen, mode]);

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-medium transition-colors duration-200 ${
      isAtTop
        ? isActive
          ? "text-white"
          : "text-white/80 hover:text-white"
        : isActive
          ? "text-brand-primary"
          : "text-app-text-soft hover:text-app-text"
    } after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:rounded-full after:transition ${
      isActive
        ? isAtTop
          ? "after:bg-white"
          : "after:bg-brand-primary"
        : "after:bg-transparent"
    }`;

  const desktopAnchorClass = `text-sm font-medium transition-colors duration-200 ${
    isAtTop
      ? "text-white/80 hover:text-white"
      : "text-app-text-soft hover:text-app-text"
  }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-brand-primary-soft text-app-text"
        : "text-app-text-soft hover:bg-app-surface-2 hover:text-app-text"
    }`;

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out ${
        isHidden ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div
        className={`mx-4 mt-4 rounded-[1.5rem] border transition-all duration-300 lg:mx-6 ${
          isAtTop
            ? "border-white/12 bg-white/8 text-white backdrop-blur-md"
            : "border-app-border bg-app-surface/88 text-app-text backdrop-blur-xl"
        }`}
      >
        <div className="flex items-center gap-4 px-5 py-3 lg:px-8">
          {/* Brand */}
          <div className="flex min-w-0 flex-1">
            <NavLink
              to="/"
              onClick={(event) => {
                closeMobileMenu();
                handleGoHome(event);
              }}
              className="flex min-w-0 items-center gap-3"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-black text-black shadow-[var(--shadow-soft)]">
                FA
              </div>

              <div className="min-w-0 leading-tight">
                <p
                  className={`truncate text-base font-extrabold tracking-tight sm:text-lg ${
                    isAtTop ? "text-white" : "text-app-text"
                  }`}
                >
                  Football Academy
                </p>
                <p
                  className={`hidden text-xs sm:block ${
                    isAtTop ? "text-white/70" : "text-app-text-muted"
                  }`}
                >
                  Train. Book. Improve.
                </p>
              </div>
            </NavLink>
          </div>

          {/* Desktop nav */}
          <div className="hidden items-center justify-center gap-8 md:flex">
            <NavLink
              to="/"
              end
              className={navLinkClass}
              onClick={handleGoHome}
            >
              Home
            </NavLink>

            <NavLink to="/training-sessions" className={navLinkClass}>
              Sessions
            </NavLink>

            <a
              href="/#about"
              onClick={(event) => handleAnchorNavigation(event, "about")}
              className={desktopAnchorClass}
            >
              About Us
            </a>

            <a
              href="/#gallery"
              onClick={(event) => handleAnchorNavigation(event, "gallery")}
              className={desktopAnchorClass}
            >
              Gallery
            </a>

            <a
              href="/#contact"
              onClick={(event) => handleAnchorNavigation(event, "contact")}
              className={desktopAnchorClass}
            >
              Contact Us
            </a>
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />

            {!token ? (
              <>
                <NavLink to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      isAtTop
                        ? "border-white/25 bg-white/8 text-white hover:border-white/40 hover:bg-white/14 hover:text-white"
                        : ""
                    }
                  >
                    Login
                  </Button>
                </NavLink>

                <NavLink to="/register">
                  <Button size="sm">Join Academy</Button>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/player-dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      isAtTop
                        ? "border-white/25 bg-white/8 text-white hover:border-white/40 hover:bg-white/14 hover:text-white"
                        : ""
                    }
                  >
                    Dashboard
                  </Button>
                </NavLink>

                <Button
                  size="sm"
                  onClick={handleLogout}
                  variant="danger-outline"
                  className={isAtTop ? "bg-white/92" : ""}
                >
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`ml-auto inline-flex items-center justify-center rounded-2xl border px-3 py-2 transition md:hidden ${
              isAtTop
                ? "border-white/20 bg-white/10 text-white hover:border-white/40"
                : "border-app-border bg-app-card text-app-text hover:border-brand-primary hover:text-brand-primary"
            }`}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="text-lg">{mobileMenuOpen ? "✕" : "☰"}</span>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-app-border bg-app-surface px-5 py-5 md:hidden">
            <div className="mb-5">
              <ThemeToggle />
            </div>

            <div className="flex flex-col gap-2">
              <NavLink
                to="/"
                end
                className={mobileNavLinkClass}
                onClick={(event) => {
                  handleGoHome(event);
                  closeMobileMenu();
                }}
              >
                Home
              </NavLink>

              <NavLink
                to="/training-sessions"
                className={mobileNavLinkClass}
                onClick={closeMobileMenu}
              >
                Sessions
              </NavLink>

              <a
                href="/#about"
                onClick={(event) => handleAnchorNavigation(event, "about")}
                className="rounded-2xl px-3 py-2.5 text-sm font-medium text-app-text-soft transition hover:bg-app-surface-2 hover:text-app-text"
              >
                About Us
              </a>

              <a
                href="/#gallery"
                onClick={(event) => handleAnchorNavigation(event, "gallery")}
                className="rounded-2xl px-3 py-2.5 text-sm font-medium text-app-text-soft transition hover:bg-app-surface-2 hover:text-app-text"
              >
                Gallery
              </a>

              <a
                href="/#contact"
                onClick={(event) => handleAnchorNavigation(event, "contact")}
                className="rounded-2xl px-3 py-2.5 text-sm font-medium text-app-text-soft transition hover:bg-app-surface-2 hover:text-app-text"
              >
                Contact Us
              </a>

              {token && (
                <>
                  <NavLink
                    to="/player-dashboard"
                    className={mobileNavLinkClass}
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </NavLink>

                  <NavLink
                    to="/player-dashboard/bookings"
                    className={mobileNavLinkClass}
                    onClick={closeMobileMenu}
                  >
                    My Bookings
                  </NavLink>

                  <NavLink
                    to="/player-dashboard/profile"
                    className={mobileNavLinkClass}
                    onClick={closeMobileMenu}
                  >
                    Profile
                  </NavLink>
                </>
              )}
            </div>

            <div className="mt-5 border-t border-app-border pt-5">
              {!token ? (
                <div className="flex flex-col gap-3">
                  <NavLink to="/login" onClick={closeMobileMenu}>
                    <Button fullWidth variant="outline">
                      Login
                    </Button>
                  </NavLink>

                  <NavLink to="/register" onClick={closeMobileMenu}>
                    <Button fullWidth>Join Academy</Button>
                  </NavLink>
                </div>
              ) : (
                <Button
                  fullWidth
                  onClick={handleLogout}
                  variant="danger-outline"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;