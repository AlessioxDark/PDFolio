import React from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";

const SidebarLayout = () => {
  return (
    <div className="flex min-h-screen bg-neutral-2 dark:bg-zinc-900 text-neutral-900 dark:text-zinc-50 transition-colors duration-300">
      {" "}
      {/* Sidebar fixed width or percentage */}
      <Sidebar />
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
