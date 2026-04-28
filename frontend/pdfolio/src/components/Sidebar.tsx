import React from "react";
import { useProfile } from "../contexts/ProfileContext";
import { Link, useLocation } from "react-router";

const Sidebar = () => {
  const { profileData } = useProfile();
  const location = useLocation();
  const sidebarLinks = [
    { label: "Documents", href: "/", icon: "" },
    { label: "Workspaces", href: "/worspaces", icon: "" },
    { label: "Settings", href: "/settings", icon: "" },
  ];
  console.log(location.pathname.split("/"));
  return (
    <div className="bg-gray-400 h-screen w-1/4 px-4 py-6 flex flex-col gap-3">
      {sidebarLinks.map((l) => {
        return (
          <div
            key={l.href}
            className={`px-3 py-4 bg-white rounded-xl shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${location.pathname.split("/")[1] === l.href.split("/")[1] ? "ring-2 ring-purple-600 font-bold text-purple-600" : "ok"}`}
          >
            <Link to={l.href}>{l.label}</Link>
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;
