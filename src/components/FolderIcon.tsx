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
        "flex flex-col items-center justify-center gap-1 cursor-pointer select-none", 
        selected && "text-white", 
        className
      )} 
      onClick={onClick}
    >
      {/* Win95 folder icon with purple glow */}
      <div className={cn(
        "relative w-32 h-32 flex items-center justify-center",
        selected && "after:absolute after:inset-0 after:bg-[#6D6DD0]/30 after:blur-md after:rounded-md"
      )}>
        {iconPath ? (
          // Use custom icon if provided
          <img 
            src={iconPath} 
            alt={label}
            className="w-28 h-28 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              // Fallback to default folder icon
              e.currentTarget.parentElement!.dataset.fallback = 'true';
            }}
          />
        ) : (
          // Default folder icon
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 right-0 h-3 bg-[#252547] border-t border-l border-r border-[#6D6DD0] border-2"></div>
            <div className="absolute top-3 left-0 right-0 bottom-0 bg-[#252547] border-2 border-[#6D6DD0] shadow-[inset_-2px_-2px_0_0_#000000,2px_2px_0_0_#6D6DD0]">
              {/* Tab part */}
              <div className="absolute -top-2 left-3 w-8 h-3 bg-[#252547] border-t border-l border-r border-[#6D6DD0] border-2"></div>
            </div>
          </div>
        )}
      </div>

      {/* Label */}
      <span className={cn(
        "text-base font-bold text-center max-w-32 px-2 py-1 truncate", 
        selected ? "bg-[#6D6DD0] text-[#000000]" : "text-[#6D6DD0]"
      )}>
        {label}
      </span>
    </div>
  );
} 