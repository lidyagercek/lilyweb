import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFolder: (folderId: string) => void;
  className?: string;
}

const FOLDERS = [
  { id: "about-me", name: "About Me", icon: "/images/icons/lily_icon.png" },
  { id: "2d-arts", name: "2D Arts", icon: "/images/icons/2d_art_icon.png" },
  { id: "3d-works", name: "3D Works", icon: "/images/icons/3d_art_icon.png" },
  { id: "pixel-arts", name: "Pixel Arts", icon: "/images/icons/pixel_icon.png" },
  { id: "animations", name: "Animations", icon: "/images/icons/animation_icon.png" },
  { id: "tattoos", name: "Tattoos", icon: "/images/icons/tattoo_icon.png" },
];

export function StartMenu({
  isOpen,
  onClose,
  onOpenFolder,
  className
}: StartMenuProps) {
  const startMenuRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        startMenuRef.current && 
        !startMenuRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Play sound effect when menu item is clicked
  const handleMenuItemClick = (folderId: string) => {
    // Play folder open sound if available
    // @ts-ignore - Using global function defined in BootSequence
    if (window.playSound) {
      // @ts-ignore
      window.playSound('folder');
    }
    
    onOpenFolder(folderId);
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div 
      ref={startMenuRef}
      className={cn(
        "absolute bottom-10 left-0 w-64 bg-[#000000] border-2 border-[#6D6DD0] shadow-lg z-50",
        className
      )}
    >
      {/* User profile banner */}
      <div className="flex items-center bg-[#252547] border-b-2 border-[#6D6DD0] p-2">
        <div className="w-12 h-12 rounded overflow-hidden bg-[#6D6DD0] mr-2">
          <img
            src="/images/about-me/about/profile.png"
            alt="User"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `
                <div class="w-full h-full flex items-center justify-center bg-[#6D6DD0]">
                  <span class="text-white text-2xl">L</span>
                </div>
              `;
            }}
          />
        </div>
        <div className="text-[#6D6DD0] font-semibold font-minecraft">User</div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        {/* Folder items */}
        {FOLDERS.map((folder) => (
          <button
            key={folder.id}
            className="w-full flex items-center px-3 py-2 text-[#6D6DD0] hover:bg-[#6D6DD0] hover:text-[#000000] text-left"
            onClick={() => handleMenuItemClick(folder.id)}
          >
            <div className="w-6 h-6 mr-3 flex-shrink-0">
              <img
                src={folder.icon}
                alt={folder.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  // Fallback to default folder icon
                  const fallbackDiv = document.createElement('div');
                  fallbackDiv.className = "w-6 h-6 bg-[#252547] border-2 border-[#6D6DD0]";
                  e.currentTarget.parentElement?.appendChild(fallbackDiv);
                }}
              />
            </div>
            <span className="font-minecraft leading-none mt-0.5">{folder.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 