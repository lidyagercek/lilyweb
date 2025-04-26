import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TaskBarProps {
  activeWindows: string[];
  currentWindow: string | null;
  minimizedWindows?: string[];
  onWindowSelect: (windowId: string) => void;
  onWindowClose?: (windowId: string) => void;
  openStartMenu?: () => void;
  isStartMenuOpen?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface ContextMenuPosition {
  x: number;
  y: number;
  windowId: string;
}

export function TaskBar({
  activeWindows,
  currentWindow,
  minimizedWindows = [],
  onWindowSelect,
  onWindowClose,
  openStartMenu,
  isStartMenuOpen = false,
  className,
  children
}: TaskBarProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Get and format the current time and date
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Format time (HH:MM AM/PM)
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedHours = hours % 12 || 12; // Convert to 12-hour format
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      setCurrentTime(`${formattedHours}:${formattedMinutes} ${ampm}`);
    };

    // Update time immediately and set up interval
    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Map window IDs to readable names
  const getWindowName = (windowId: string): string => {
    const names: Record<string, string> = {
      '2d-arts': '2D Arts',
      '3d-works': '3D Works',
      'pixel-arts': 'Pixel Arts',
      'animations': 'Animations',
      'tattoos': 'Tattoo Designs',
      'about-me': 'About Me',
      'wallpapers': 'Wallpapers'
    };
    return names[windowId] || windowId;
  };

  // Map window IDs to icon paths
  const getWindowIcon = (windowId: string): string => {
    const icons: Record<string, string> = {
      '2d-arts': '/images/icons/2d_art_icon.png',
      '3d-works': '/images/icons/3d_art_icon.png',
      'pixel-arts': '/images/icons/pixel_icon.png',
      'animations': '/images/icons/animation_icon.png',
      'tattoos': '/images/icons/tattoo_icon.png',
      'about-me': '/images/icons/lily_icon.png',
      'wallpapers': '/images/icons/wallpaper_icon.png'
    };
    return icons[windowId] || '';
  };

  // Play button click sound when clicking taskbar buttons
  const handleButtonClick = (windowId: string) => {
    // @ts-ignore - Using global function defined in BootSequence
    if (window.playSound) {
      // @ts-ignore
      window.playSound('button');
    }
    onWindowSelect(windowId);
  };

  // Handle start button click with sound
  const handleStartClick = () => {
    // @ts-ignore - Using global function defined in BootSequence
    if (window.playSound) {
      // @ts-ignore
      window.playSound('button');
    }
    if (openStartMenu) {
      openStartMenu();
    }
  };

  // Handle right-click on taskbar button
  const handleRightClick = (e: React.MouseEvent, windowId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      windowId
    });
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        contextMenuRef.current && 
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  // Handle context menu close action
  const handleCloseWindow = () => {
    if (contextMenu && onWindowClose) {
      onWindowClose(contextMenu.windowId);
      setContextMenu(null);
    }
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
          ref={startButtonRef}
          className={cn(
            "h-8 px-2 flex items-center justify-center mr-1 font-bold text-sm border-[#6D6DD0] bg-[#000000] text-[#6D6DD0]",
            isStartMenuOpen && ""
          )}
          onClick={handleStartClick}
        >
          <img 
            src="/images/icons/windows.png" 
            alt="Windows"
            className="w-6 h-6 mr-1"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
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
            <div className="px-2 font-bold text-[#6D6DD0] border-t-1 border-l-1 border-r-1 border-[#6D6DD0] rounded-t-sm h-full flex items-center">
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
            onClick={() => handleButtonClick(windowId)}
            onContextMenu={(e) => handleRightClick(e, windowId)}
          >
            <img 
              src={getWindowIcon(windowId)}
              alt=""
              className="w-4 h-4 mr-2 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                // Show fallback if image fails to load
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = "w-4 h-4 mr-2 bg-[#252547] border-2 border-[#6D6DD0]";
                e.currentTarget.parentElement?.insertBefore(fallbackDiv, e.currentTarget.nextSibling);
              }}
            />
            <span className="truncate font-minecraft flex items-center leading-none mt-0.5">{getWindowName(windowId)}</span>
          </button>
        ))}
      </div>

      {/* System Tray with Icons and Time */}
      <div className="flex items-center gap-2 px-2">
        {/* System Icons - removed */}
        
        {/* Divider */}
        <div className="w-px h-6 bg-[#6D6DD0]/50"></div>
        
        {/* Time */}
        <div className="text-[#6D6DD0] font-minecraft text-xs font-bold ml-2 mx-1">
          {currentTime}
        </div>
        
        {/* Show Desktop area */}
        <div className="w-px h-6 bg-[#6D6DD0]/50 ml-1"></div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          ref={contextMenuRef}
          className="fixed bg-[#000000] border-2 border-[#6D6DD0] shadow-md z-50"
          style={{ 
            top: `${contextMenu.y}px`, 
            left: `${contextMenu.x}px`,
            transform: 'translate(-50%, -100%)' // Position above cursor
          }}
        >
          <button 
            className="w-full text-left px-3 py-1 text-[#6D6DD0] hover:bg-[#6D6DD0] hover:text-[#000000] whitespace-nowrap font-minecraft flex items-center"
            onClick={handleCloseWindow}
          >
            <div className="w-4 h-4 bg-[#6D6DD0] flex items-center justify-center mr-2">
              <div className="relative w-[6px] h-[6px]">
                <div className="absolute bg-[#000000] w-[6px] h-[1px] top-[2.5px] transform rotate-45"></div>
                <div className="absolute bg-[#000000] w-[6px] h-[1px] top-[2.5px] transform -rotate-45"></div>
              </div>
            </div>
            Close Window
          </button>
        </div>
      )}
    </div>
  );
} 