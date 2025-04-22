import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Gallery } from "./Gallery";

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface RetroWindowProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  categories?: string[];
  initialCategory?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  initialPosition?: Position;
  initialSize?: Size;
  folderType: string;
  isActive?: boolean;
  onClick?: () => void;
  zIndex?: number;
}

export function RetroWindow({
  title,
  children,
  className,
  categories = [],
  initialCategory,
  onClose,
  onMinimize,
  onMaximize,
  initialPosition = { x: 50, y: 50 },
  initialSize = { width: 500, height: 400 },
  folderType,
  isActive = false,
  onClick,
  zIndex = 1
}: RetroWindowProps) {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    initialCategory || (categories.length > 0 ? categories[0] : undefined)
  );
  
  // Position and size state
  const [position, setPosition] = useState<Position>(initialPosition);
  const [size, setSize] = useState<Size>(initialSize);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Resizing state
  const [resizing, setResizing] = useState<string | null>(null);
  
  // Refs
  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
    startWidth: number;
    startHeight: number;
  }>({
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    startWidth: 0,
    startHeight: 0,
  });
  
  // Handle window dragging
  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    
    // Bring window to front when starting drag
    if (onClick) {
      onClick();
    }
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  // Handle window resizing
  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Bring window to front when starting resize
    if (onClick) {
      onClick();
    }
    
    setResizing(direction);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
      startWidth: size.width,
      startHeight: size.height,
    };
  };
  
  // Use effect for mouse move and mouse up events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Calculate new position
        let newX = e.clientX - dragOffset.x;
        let newY = e.clientY - dragOffset.y;
        
        // Keep window within viewport bounds - respect taskbar height
        const taskbarHeight = 40; // Height of the taskbar in pixels
        newX = Math.max(0, Math.min(newX, window.innerWidth - size.width));
        newY = Math.max(0, Math.min(newY, window.innerHeight - taskbarHeight - size.height));
        
        setPosition({
          x: newX,
          y: newY
        });
      } else if (resizing) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;

        // Resize based on direction
        if (resizing.includes("e")) {
          // Limit right edge to viewport width
          const newWidth = Math.min(
            window.innerWidth - position.x,
            Math.max(200, dragRef.current.startWidth + dx)
          );
          setSize({ ...size, width: newWidth });
        }
        if (resizing.includes("s")) {
          // Limit bottom edge to viewport height, accounting for taskbar
          const taskbarHeight = 40;
          const newHeight = Math.min(
            window.innerHeight - position.y - taskbarHeight,
            Math.max(150, dragRef.current.startHeight + dy)
          );
          setSize({ ...size, height: newHeight });
        }
        if (resizing.includes("w")) {
          const newWidth = Math.max(200, dragRef.current.startWidth - dx);
          const newX = dragRef.current.startPosX + dragRef.current.startWidth - newWidth;
          // Don't allow window to move out of left edge
          if (newX >= 0) {
            setSize({ ...size, width: newWidth });
            setPosition({
              ...position,
              x: newX
            });
          }
        }
        if (resizing.includes("n")) {
          const newHeight = Math.max(150, dragRef.current.startHeight - dy);
          const newY = dragRef.current.startPosY + dragRef.current.startHeight - newHeight;
          // Don't allow window to move out of top edge
          if (newY >= 0) {
            setSize({ ...size, height: newHeight });
            setPosition({
              ...position,
              y: newY
            });
          }
        }
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setResizing(null);
    };
    
    if (isDragging || resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, resizing, position, size]);

  // Convert category name to folder name (lowercase, replace spaces with hyphens)
  const getFolderName = (cat: string) => {
    return cat.toLowerCase().replace(/\s+/g, '-');
  };
  
  // Handle maximize/restore
  const toggleMaximize = () => {
    // Save current size and position before toggling
    if (!isMaximized) {
      dragRef.current = {
        startX: 0,
        startY: 0,
        startPosX: position.x,
        startPosY: position.y,
        startWidth: size.width,
        startHeight: size.height,
      };
    }
    
    setIsMaximized((prev) => {
      // Set the new size and position based on maximized state
      if (prev) {
        setPosition({ x: dragRef.current.startPosX, y: dragRef.current.startPosY });
        setSize({ width: dragRef.current.startWidth, height: dragRef.current.startHeight });
      } else {
        setPosition({ x: 0, y: 0 });
        setSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
      
      return !prev; // Toggle the state
    });
    
    // Call external handler if provided
    if (onMaximize) {
      onMaximize();
    }
  };
  
  // Handle minimize
  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize();
    }
  };
  
  // Handle close
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <div 
      ref={windowRef}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: zIndex
      }}
      className={cn(
        "flex flex-col bg-[#000000] rounded-none border-t border-l border-[#6D6DD0] border-r border-b border-[#6D6DD0] shadow-md border-4",
        "overflow-hidden",
        className
      )}
      onClick={onClick}
    >
      {/* Title Bar - Made draggable */}
      <div 
        className={cn(
          "flex items-center justify-between px-2 py-1.5 text-[#6D6DD0] bg-[#000000] text-sm font-bold border-b-4 border-[#6D6DD0]",
          !isMaximized && (isDragging ? "cursor-grabbing" : "cursor-grab")
        )}
        onMouseDown={handleTitleMouseDown}
      >
        <div className="flex items-center">
          <span className="ml-1 font-minecraft flex items-center leading-none ">{title}</span>
        </div>
        <div className="flex gap-1">
          <button 
            className="w-5 h-5 bg-[#6D6DD0] border-t-2 border-l-2 border-[#6D6DD0] border-r-2 border-b-2 border-[#6D6DD0] flex items-center justify-center text-black text-xs"
            onClick={handleMinimize}
            aria-label="Minimize"
          >
            <div className="w-[7px] h-[1px] bg-[#000000] mb-[1px] mt-auto"></div>
          </button>
          <button 
            className="w-5 h-5 bg-[#6D6DD0] border-t-2 border-l-2 border-[#6D6DD0] border-r-2 border-b-2 border-[#6D6DD0] flex items-center justify-center text-black text-xs"
            aria-label="Maximize (disabled)"
            disabled
          >
            <div className="w-[9px] h-[9px] border-2 border-[#000000] bg-transparent"></div>
          </button>
          <button 
            className="w-5 h-5 bg-[#6D6DD0] border-t-2 border-l-2 border-[#6D6DD0] border-r-2 border-b-2 border-[#6D6DD0] flex items-center justify-center text-black text-xs hover:bg-[#8080ED]"
            onClick={handleClose}
            aria-label="Close"
          >
            <div className="relative w-[9px] h-[9px]">
              <div className="absolute bg-[#000000] w-[9px] h-[2px] top-[3.5px] transform rotate-45"></div>
              <div className="absolute bg-[#000000] w-[9px] h-[2px] top-[3.5px] transform -rotate-45"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Menu Bar */}
      {categories.length > 0 && (
        <div className="flex items-center border-b-4 border-[#6D6DD0] bg-[#000000] px-1 py-0.5">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-2 py-1 text-xs mr-1 text-[#6D6DD0] font-minecraft flex items-center leading-none ",
                activeCategory === category && "bg-[#000000] border-t-1 border-l-1 border-[#6D6DD0] border-r-1 border-b-1 border-[#6D6DD0] shadow-[inset_-2px_-2px_0_#6D6DD0,inset_2px_2px_0_#6D6DD0]"
              )}
            >
              {category.length > 0 ? (
                <>
                  <span className="underline">{category[0]}</span>
                  {category.slice(1)}
                </>
              ) : category}
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden border-t-1 border-l-1 border-[#6D6DD0] bg-[#000000] shadow-[inset_2px_2px_0_#6D6DD0] font-minecraft">
        {activeCategory ? (
          <Gallery 
            category={getFolderName(folderType)} 
            subcategory={getFolderName(activeCategory)}
          />
        ) : (
          <Gallery 
            category={getFolderName(folderType)} 
            subcategory=""
          />
        )}
      </div>
      
      {/* Resize Handles - Only shown when not maximized */}
      {!isMaximized && (
        <>
          <div 
            className="absolute right-0 top-0 bottom-0 w-1 cursor-e-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "e")}
          ></div>
          <div 
            className="absolute left-0 right-0 bottom-0 h-1 cursor-s-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "s")}
          ></div>
          <div 
            className="absolute right-0 bottom-0 w-3 h-3 cursor-se-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "se")}
          ></div>
          <div 
            className="absolute left-0 top-0 bottom-0 w-1 cursor-w-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "w")}
          ></div>
          <div 
            className="absolute left-0 right-0 top-0 h-1 cursor-n-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "n")}
          ></div>
          <div 
            className="absolute left-0 bottom-0 w-3 h-3 cursor-sw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
          ></div>
          <div 
            className="absolute right-0 top-0 w-3 h-3 cursor-ne-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
          ></div>
          <div 
            className="absolute left-0 top-0 w-3 h-3 cursor-nw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
          ></div>
        </>
      )}
    </div>
  );
} 