import { Outlet } from "react-router-dom";
import { AdminLayoutProvider } from "../../../../context/AdminLayoutContext";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

function AdminShell() {
  return (
    <AdminLayoutProvider>
      <div className="flex min-h-screen bg-app-bg text-app-text">
        <AdminSidebar />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <AdminTopbar />

          <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AdminLayoutProvider>
  );
}

export default AdminShell;
