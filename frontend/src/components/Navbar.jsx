import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        navigate("/");
    };

    const getNavLinkStyle = ({ isActive }) => ({
        color: isActive ? "#d4af37" : "#fff",
        textDecoration: "none",
        fontSize: "1rem",
        fontWeight: isActive ? "700" : "500",
    });

    return (
        <nav style={styles.navbar}>
            <div style={styles.logo}>
                <NavLink to="/" style={styles.logoLink}>
                    Football Academy
                </NavLink>
            </div>

            <div style={styles.navLinks}>
                <NavLink to="/" end style={getNavLinkStyle}>
                    Home
                </NavLink>

                {!token ? (
                    <>
                    <NavLink to="/" style={getNavLinkStyle}>
                        
                    </NavLink>
                    </>
                ):(
                    <>
                    <NavLink to="/training-sessions" style={getNavLinkStyle}>
                        Sessions
                    </NavLink>
                    </> 
                )}

                {token && (
                    <NavLink to="/my-bookings" style={getNavLinkStyle}>
                        My Bookings
                    </NavLink>
                )}

                {!token ? (
                    <>
                        <NavLink to="/login" style={styles.loginBtn}>
                            Login
                        </NavLink>

                        {/* <NavLink to="/register" style={styles.registerBtn}>
                            Register
                        </NavLink> */}
                    </>
                ) : (
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
}

const styles = {
    navbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 32px",
        backgroundColor: "#111",
        color: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 1000,
    },

    logo: {
        fontSize: "1.3rem",
        fontWeight: "bold",
    },

    logoLink: {
        color: "#fff",
        textDecoration: "none",
    },

    navLinks: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },

    loginBtn: {
        backgroundColor: "#63d437",
        color: "#111",
        padding: "10px 16px",
        borderRadius: "6px",
        textDecoration: "none",
        fontWeight: "bold",
    },

    logoutBtn: {
        backgroundColor: "#d43737",
        color: "#111",
        border: "none",
        padding: "10px 16px",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
    },
};

export default Navbar;