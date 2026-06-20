import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
