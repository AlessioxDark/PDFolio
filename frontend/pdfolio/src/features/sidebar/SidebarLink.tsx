import React from "react";
import { Link, useLocation } from "react-router";

const SidebarLink = ({ label, href }) => {
  const location = useLocation();
  const isSelected = location.pathname.split("/")[1] === href.split("/")[1];
  return (
    <div
      key={href}
      className={`px-3 py-4 pl-6 rounded-xl  cursor-pointer  transition-colors duration-200 font-inter ${isSelected ? "font-bold text-accent bg-light-accent" : "text-text-1 hover:bg-neutral-3"}`}
    >
      <Link to={href}>{label}</Link>
    </div>
  );
};

export default SidebarLink;
