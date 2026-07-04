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
          ? "font-bold text-accent dark:text-purple-300 bg-light-accent dark:bg-purple-950/40"
          : "text-text-1 dark:text-zinc-400 hover:bg-neutral-3 dark:hover:bg-zinc-800 hover:text-neutral-900 dark:hover:text-zinc-200"
      }`}
    >
      {label}
    </Link>
  );
};

export default SidebarLink;
