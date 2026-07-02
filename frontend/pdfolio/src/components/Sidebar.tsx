import React, { useState } from "react";
import { useProfile } from "../contexts/ProfileContext";
import { Link, useLocation } from "react-router";
import SidebarLink from "../features/sidebar/SidebarLink";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import TrashIcon from "@/icons/TrashIcon";

const Sidebar = () => {
  const { profileData } = useProfile();
  const location = useLocation();
  const sidebarLinks = [{ label: "Home", href: "/", icon: "" }];
  const { activeTag, setActiveTag, tagsList } = useDocumentsAndFolders();

  console.log(location.pathname.split("/"));
  return (
    <div className="bg-neutral-2 h-screen w-1/4 px-4 py-6 flex flex-col justify-between  border-r border-neutral-4 pt-20">
      <div className="w-full flex flex-col gap-3">
        {/* Link Principali */}
        {sidebarLinks.map((l) => {
          return <SidebarLink key={l.href} label={l.label} href={l.href} />;
        })}

        <div className="w-full h-[1px] bg-neutral-4 my-2"></div>

        {/* Sezione Dinamica dei Tag */}
        <div className="flex flex-col gap-1 px-2">
          <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-1 px-1 font-inter">
            I tuoi Tag
          </span>
          <div className="flex flex-col gap-1 max-h-full overflow-y-auto pr-1">
            {tagsList.map((tag) => {
              const isSelected = activeTag === tag;
              return (
                <div
                  key={tag}
                  className={`flex cursor-pointer items-center py-2.5 px-3 text-xs rounded-lg font-inter font-semibold border border-transparent transition-all duration-200 animate-in zoom-in-95 ${
                    isSelected
                      ? "bg-purple-100 text-accent font-bold"
                      : "text-neutral-700 bg-neutral-200/70  hover:bg-neutral-200/40 "
                  }`}
                  onClick={() => {
                    setActiveTag((prev) => {
                      return prev == tag ? "" : tag;
                    });
                  }}
                >
                  <span className="truncate">#{tag}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sezione Inferiore: Cestino e Profilo */}
      <div className="w-full flex flex-col gap-2 pt-4 border-t border-neutral-4/40">
        <SidebarLink
          label={
            <div className="flex items-center gap-3 w-full">
              <TrashIcon size={20} className="text-current" />
              <span>Cestino</span>
            </div>
          }
          href="/cestino"
        />
        <SidebarLink label="Profile" href="/profile" />
      </div>
    </div>
  );
};

export default Sidebar;
