import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import DaySidebar from "../DaySidebar";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#191d20] text-[#f4f7f8] lg:flex">
      <DaySidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <section className="min-w-0 flex-1">
        <Navbar onOpenMenu={() => setSidebarOpen(true)} />
        <Outlet />
      </section>
    </div>
  );
}
