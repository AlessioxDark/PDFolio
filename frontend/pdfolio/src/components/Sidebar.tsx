import React from "react";
import { useProfile } from "../contexts/ProfileContext";
import { Link, useLocation } from "react-router";
import SidebarLink from "../features/sidebar/SidebarLink";

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
    <div className="bg-neutral-2 h-screen w-1/4 px-4 py-6 flex flex-col justify-between  border-r border-neutral-4 pt-20">
      <div className="w-full flex flex-col gap-3">
        {sidebarLinks.map((l) => {
          return <SidebarLink key={l.href} label={l.label} href={l.href} />;
        })}
      </div>
      <SidebarLink label="Profile" href="/profile" />
    </div>
  );
};

export default Sidebar;
