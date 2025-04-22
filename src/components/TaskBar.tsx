import React from "react";
import { cn } from "@/lib/utils";

interface TaskBarProps {
  activeWindows: string[];
  currentWindow: string | null;
  minimizedWindows?: string[];
  onWindowSelect: (windowId: string) => void;
  openStartMenu?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function TaskBar({
  activeWindows,
  currentWindow,
  minimizedWindows = [],
  onWindowSelect,
  openStartMenu,
  className,
  children
}: TaskBarProps) {
  // Map window IDs to readable names
  const getWindowName = (windowId: string): string => {
    const names: Record<string, string> = {
      '2d-arts': '2D Arts',
      '3d-works': '3D Works',
      'pixel-arts': 'Pixel Arts',
      'animations': 'Animations',
      'tattoos': 'Tattoo Designs'
    };
    return names[windowId] || windowId;
  };

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 h-10 bg-[#000000] border-t-4 border-[#6D6DD0] flex items-center px-1 py-1 z-50 shadow-[inset_0_2px_0_#6D6DD0]",
        className
      )}
    >
      {/* Start Button - Use children if provided, otherwise use default */}
      {children || (
        <button 
          className="h-8 px-2 flex items-center justify-center mr-1 font-bold text-sm border-[#6D6DD0] bg-[#000000] text-[#6D6DD0]"
          onClick={openStartMenu}
        >
          <img 
            src="/images/icons/windows.png" 
            alt="Windows"
            className="w-6 h-6 mr-1"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              // Show fallback if image fails to load
              const fallbackDiv = document.createElement('div');
              fallbackDiv.className = "w-6 h-6 mr-1 bg-[#252547] grid grid-cols-2 grid-rows-2";
              fallbackDiv.innerHTML = `
                <div class="bg-[#6D6DD0]"></div>
                <div class="bg-[#6D6DD0]"></div>
                <div class="bg-[#6D6DD0]"></div>
                <div class="bg-[#6D6DD0]"></div>
              `;
              e.currentTarget.parentElement?.insertBefore(fallbackDiv, e.currentTarget.nextSibling);
            }}
          />
          <div className="flex items-center h-full">
            <div className="px-2 font-bold text-[#6D6DD0] bg-[#000000] border-t-1 border-l-1 border-r-1 border-[#6D6DD0] rounded-t-sm h-full flex items-center">
              <span className="font-minecraft flex items-center leading-none mt-0.5">START</span>
            </div>
          </div>
        </button>
      )}

      {/* Divider */}
      <div className="w-1 h-8 mx-1 bg-[#6D6DD0] shadow-[1px_0_0_#6D6DD0]"></div>

      {/* Window Buttons */}
      <div className="flex-1 flex items-center overflow-x-auto space-x-1 px-1">
        {activeWindows.map((windowId) => (
          <button
            key={windowId}
            className={cn(
              "h-8 px-2 flex-shrink-0 min-w-24 max-w-40 flex items-center justify-center text-sm truncate text-[#6D6DD0]",
              minimizedWindows.includes(windowId)
                ? "border-2 border-[#6D6DD0] shadow-[opacity-70 bg-[#000000]" 
                : currentWindow === windowId 
                  ? "border-2 border-[#6D6DD0] shadow-[bg-[#000000]" 
                  : "border-2 border-[#6D6DD0] shadow-[bg-[#000000]"
            )}
            onClick={() => onWindowSelect(windowId)}
          >
            <div className="w-4 h-4 mr-2 bg-[#252547] border-2 border-[#6D6DD0]"></div>
            <span className="truncate font-minecraft flex items-center leading-none mt-0.5">{getWindowName(windowId)}</span>
          </button>
        ))}
      </div>

      {/* Empty System Tray (without time) */}
      <div className="h-8 w-6 flex items-center"></div>
    </div>
  );
} 