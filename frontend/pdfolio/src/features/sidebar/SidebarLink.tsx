import React from "react";
import { Link, useLocation } from "react-router";

const SidebarLink = ({ label, href }) => {
  const location = useLocation();
  const isSelected = location.pathname.split("/")[1] === href.split("/")[1];
  return (
    <Link
      to={href}
      className={`flex items-center px-3 py-4 pl-6 rounded-xl w-full font-inter text-sm transition-all duration-200 cursor-pointer ${
        isSelected
          ? "font-bold text-accent bg-light-accent"
          : "text-text-1 hover:bg-neutral-3 hover:text-neutral-900"
      }`}
    >
      {label}
    </Link>
  );
};

export default SidebarLink;
