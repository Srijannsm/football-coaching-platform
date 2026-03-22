import { useContext } from "react";
import { AdminLayoutContext } from "../../../context/AdminLayoutContext";

export function useAdminSidebar() {
  const context = useContext(AdminLayoutContext);

  if (!context) {
    throw new Error("useAdminSidebar must be used within AdminLayoutProvider.");
  }

  return context;
}
