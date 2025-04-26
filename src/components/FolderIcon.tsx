import React from "react";
import { cn } from "@/lib/utils";

interface FolderIconProps {
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  label?: string;
  iconPath?: string;
}

export function FolderIcon({
  className,
  onClick,
  selected = false,
  label = "Folder",
  iconPath
}: FolderIconProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center gap-0 cursor-pointer select-none", 
        selected && "text-white", 
        className
      )} 
      onClick={onClick}
    >
      {/* Win95 folder icon with smaller purple glow */}
      <div className={cn(
        "relative w-24 h-22 flex items-center justify-center",
        selected && ""
      )}>
        {iconPath ? (
          // Use custom icon if provided
          <img 
            src={iconPath} 
            alt={label}
            className="w-22 h-22 object-contain select-none pointer-events-none"
            draggable="false"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              // Fallback to default folder icon
              e.currentTarget.parentElement!.dataset.fallback = 'true';
            }}
          />
        ) : (
          // Default folder icon
          <div className="absolute inset-0 select-none pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-2.5 bg-[#252547] border-t border-l border-r border-[#6D6DD0] border-2"></div>
            <div className="absolute top-2.5 left-0 right-0 bottom-0 bg-[#252547] border-2 border-[#6D6DD0] shadow-[inset_-2px_-2px_0_0_#000000,2px_2px_0_0_#6D6DD0]">
              {/* Tab part */}
              <div className="absolute -top-1.5 left-2.5 w-6 h-2.5 bg-[#252547] border-t border-l border-r border-[#6D6DD0] border-2"></div>
            </div>
          </div>
        )}
      </div>

      {/* Label */}
      <span className={cn(
        "text-sm text-center max-w-24 px-1.5 py-1 -mt-3 truncate font-minecraft flex items-center justify-center leading-tight", 
        selected ? "bg-[#6D6DD0] text-[#000000]" : "text-[#6D6DD0]"
      )}>
        {label}
      </span>
    </div>
  );
} 