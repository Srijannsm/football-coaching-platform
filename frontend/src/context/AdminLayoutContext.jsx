import { useCallback, useMemo, useState } from "react";
import { AdminLayoutContext } from "./admin-layout-context";

export function AdminLayoutProvider({ children }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const toggleSidebarCollapsed = useCallback(() => {
        setIsSidebarCollapsed((prev) => !prev);
    }, []);

    const openMobileSidebar = useCallback(() => {
        setIsMobileSidebarOpen(true);
    }, []);

    const closeMobileSidebar = useCallback(() => {
        setIsMobileSidebarOpen(false);
    }, []);

    const toggleMobileSidebar = useCallback(() => {
        setIsMobileSidebarOpen((prev) => !prev);
    }, []);

    const value = useMemo(
        () => ({
            isSidebarCollapsed,
            isMobileSidebarOpen,
            toggleSidebarCollapsed,
            openMobileSidebar,
            closeMobileSidebar,
            toggleMobileSidebar,
        }),
        [
            isSidebarCollapsed,
            isMobileSidebarOpen,
            toggleSidebarCollapsed,
            openMobileSidebar,
            closeMobileSidebar,
            toggleMobileSidebar,
        ]
    );

    return (
        <AdminLayoutContext.Provider value={value}>
            {children}
        </AdminLayoutContext.Provider>
    );
}