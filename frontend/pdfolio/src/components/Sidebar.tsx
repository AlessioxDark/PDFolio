import React, { useRef, useState } from "react";
import ProfileContext, { useProfile } from "../contexts/ProfileContext";
import { Link, useLocation } from "react-router";
import SidebarLink from "../features/sidebar/SidebarLink";
import { useDocumentsAndFolders } from "@/contexts/DocumentsAndFolderContext";
import TrashIcon from "@/icons/TrashIcon";
import { useAuth } from "@/contexts/AuthContext";
import { EllipsisVertical, LogOut, Moon, Settings } from "lucide-react";

const Sidebar = () => {
  const { profileData } = useProfile();
  const location = useLocation();
  const sidebarLinks = [{ label: "Home", href: "/", icon: "" }];
  const { activeTag, setActiveTag, tagsList } = useDocumentsAndFolders();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
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
          href="/trashbin"
        />
        <div
          ref={menuRef}
          className="relative mt-auto w-full font-inter  rounded-xl "
        >
          {/* Dropdown Menu (Popup verso l'alto) */}
          {menuOpen && (
            <div className="absolute bottom-16 left-4 right-4 bg-white border border-neutral-200 rounded-xl shadow-xl p-1 flex flex-col gap-0.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg w-full text-left transition-colors cursor-pointer">
                <Settings size={14} />
                Impostazioni
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg w-full text-left transition-colors cursor-pointer">
                <Moon size={14} />
                Modalità Scura
              </button>
              <div className="h-[1px] bg-neutral-100 my-1" />
              <button
                // onClick={signOut}
                className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg w-full text-left font-semibold transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                Disconnetti
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-2.5 bg-neutral-50/40 hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 p-2 rounded-xl transition-all duration-200 px-3 py-4">
            {/* Avatar e Dati */}
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Cerchio Avatar */}
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0 border border-purple-200 select-none">
                {/* {profileData?.avatarUrl ? (
                  <img
                    src={profileData.avatarUrl}
                    alt={profileData.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <p>ij</p>
                )} */}
              </div>

              {/* Testi troncati con i punti di sospensione (...) se troppo lunghi */}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-neutral-800 truncate">
                  {profileData?.handle}
                </span>
                <span className="text-[10px] text-neutral-400 font-medium truncate">
                  {profileData?.email}
                </span>
              </div>
            </div>

            {/* Bottone Opzioni */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                menuOpen
                  ? "bg-neutral-100 text-neutral-700"
                  : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              }`}
            >
              <EllipsisVertical size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
