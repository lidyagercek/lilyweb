import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Gallery } from "./Gallery";
import { AboutContent } from "./AboutContent";

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
  onSelectItem?: (path: string) => void;
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
  zIndex = 1,
  onSelectItem
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
    
    // Add cursor-move class to body when dragging
    document.body.classList.add('cursor-move');
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
    
    // Add resize cursor class to body based on direction
    if (direction.includes('n') && direction.includes('s')) {
      document.body.classList.add('cursor-ns-resize');
    } else if (direction.includes('e') && direction.includes('w')) {
      document.body.classList.add('cursor-ew-resize');
    } else if ((direction.includes('n') && direction.includes('w')) || 
               (direction.includes('s') && direction.includes('e'))) {
      document.body.classList.add('cursor-nwse-resize');
    } else if ((direction.includes('n') && direction.includes('e')) || 
               (direction.includes('s') && direction.includes('w'))) {
      document.body.classList.add('cursor-nesw-resize');
    } else if (direction.includes('n') || direction.includes('s')) {
      document.body.classList.add('cursor-ns-resize');
    } else if (direction.includes('e') || direction.includes('w')) {
      document.body.classList.add('cursor-ew-resize');
    }
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
        // Compute deltas
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        // Starting values
        let newWidth = dragRef.current.startWidth;
        let newHeight = dragRef.current.startHeight;
        let newX = position.x;
        let newY = position.y;
        const taskbarHeight = 40;
        // East
        if (resizing.includes("e")) {
          newWidth = Math.min(
            window.innerWidth - position.x,
            Math.max(200, dragRef.current.startWidth + dx)
          );
        }
        // South
        if (resizing.includes("s")) {
          newHeight = Math.min(
            window.innerHeight - position.y - taskbarHeight,
            Math.max(150, dragRef.current.startHeight + dy)
          );
        }
        // West
        if (resizing.includes("w")) {
          newWidth = Math.max(200, dragRef.current.startWidth - dx);
          const calcX = dragRef.current.startPosX + dragRef.current.startWidth - newWidth;
          if (calcX >= 0) newX = calcX;
        }
        // North
        if (resizing.includes("n")) {
          newHeight = Math.max(150, dragRef.current.startHeight - dy);
          const calcY = dragRef.current.startPosY + dragRef.current.startHeight - newHeight;
          if (calcY >= 0) newY = calcY;
        }
        // Apply updates together (supports diagonal)
        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setResizing(null);
      
      // Remove all cursor classes from body
      document.body.classList.remove(
        'cursor-move', 
        'cursor-ns-resize', 
        'cursor-ew-resize', 
        'cursor-nwse-resize', 
        'cursor-nesw-resize'
      );
    };
    
    if (isDragging || resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Clean up cursor classes when component unmounts
      document.body.classList.remove(
        'cursor-move', 
        'cursor-ns-resize', 
        'cursor-ew-resize', 
        'cursor-nwse-resize', 
        'cursor-nesw-resize'
      );
    };
  }, [isDragging, resizing, position, size]);

  // Convert category name to folder name (lowercase, replace spaces with hyphens)
  const getFolderName = (cat: string) => {
    console.log(`[RetroWindow Debug] getFolderName input: "${cat}"`);
    
    // Handle special case for "Character/Concept Designs"
    if (cat.toLowerCase() === "character/concept designs") {
      console.log(`[RetroWindow Debug] Matched special case for character-concept-designs`);
      return "character-concept-designs";
    }
    
    // Handle multi-level subcategories with slashes
    if (cat.includes("/")) {
      const result = cat.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-");
      console.log(`[RetroWindow Debug] Processed slash-containing name to: "${result}"`);
      return result;
    }
    
    // Handle special case categories (exact matches only)
    const specialCases: Record<string, string> = {
      // 2D arts subcategories
      "illustrations": "illustrations",
      "Illustrations": "illustrations",
      "sketches": "sketches",
      "Sketches": "sketches",
      "casual arts": "casual-arts",
      "Casual Arts": "casual-arts",
      "traditional": "traditional",
      "Traditional": "traditional",
      
      // 3D works subcategories
      "renders": "renders",
      "Renders": "renders",
      "models": "models",
      "Models": "models",
      
      // Animation subcategories
      "live2d": "live2d",
      "Live2D": "live2d",
      "2d animations": "2d-animations",
      "2D Animations": "2d-animations",
      "pixel animations": "pixel-animations",
      "Pixel Animations": "pixel-animations",
      "3d animations": "3d-animations",
      "3D Animations": "3d-animations",
      
      // About me subcategories
      "about": "about",
      "About": "about",
      "skills": "skills",
      "Skills": "skills",
      "programs": "programs",
      "Programs": "programs",
      "work experience": "work-experience",
      "Work Experience": "work-experience",
      "socials": "socials",
      "Socials": "socials",
      "contact": "contact",
      "Contact": "contact",
      
      // Tattoo subcategories
      "tattoos subcategory": "tattoo",
      "Tattoos subcategory": "tattoo",
      "flashes": "flashes",
      "Flashes": "flashes",
      "fake skins": "fake-skin",
      "Fake Skins": "fake-skin",
      
      // Folder types
      "2d-arts": "2d-arts",
      "3d-works": "3d-works",
      "pixel-arts": "pixel-arts",
      "animations": "animations",
      "about-me": "about-me",
      "tattoos": "tattoos",
      "wallpapers": "wallpapers"
    };
    
    // Check if we have a special case mapping
    if (specialCases[cat]) {
      console.log(`[RetroWindow Debug] Matched special case: "${cat}" -> "${specialCases[cat]}"`);
      return specialCases[cat];
    }
    
    // Default: convert to lowercase and replace spaces with hyphens
    const result = cat.toLowerCase().replace(/\s+/g, '-');
    console.log(`[RetroWindow Debug] Default processing: "${cat}" -> "${result}"`);
    return result;
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
          !isMaximized && (isDragging ? "cursor-move" : "cursor-pointer")
        )}
        onMouseDown={handleTitleMouseDown}
      >
        <div className="flex items-center">
          <span className="ml-1 font-minecraft flex items-center leading-none ">{title}</span>
        </div>
        <div className="flex gap-1 relative z-20">
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
                activeCategory === category && "bg-[#000000] border-[#6D6DD0] border-2 border-[#6D6DD0]"
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
      <div className="flex-1 overflow-hidden border-t-1 border-l-1 border-[#6D6DD0] bg-[#000000] font-minecraft">
        {folderType === "about-me" ? (
          <AboutContent subcategory={activeCategory ? getFolderName(activeCategory) : ""} />
        ) : activeCategory ? (
          <Gallery 
            category={getFolderName(folderType)} 
            subcategory={getFolderName(activeCategory)}
            onSelectItem={onSelectItem}
          />
        ) : (
          <Gallery 
            category={getFolderName(folderType)} 
            subcategory=""
            onSelectItem={onSelectItem}
          />
        )}
      </div>
      
      {/* Resize Handles - Only shown when not maximized */}
      {!isMaximized && (
        <>
          {/* Right edge - exclude top 30px to avoid interfering with title bar buttons */}
          <div 
            className="absolute right-0 top-[30px] bottom-0 w-7 cursor-ew-resize"
            style={{ right: '-17px' }}
            onMouseDown={(e) => handleResizeMouseDown(e, "e")}
          ></div>
          <div 
            className="absolute left-0 right-0 bottom-0 h-7 cursor-ns-resize"
            style={{ bottom: '-17px' }}
            onMouseDown={(e) => handleResizeMouseDown(e, "s")}
          ></div>
          <div 
            className="absolute right-0 bottom-0 w-12 h-12 cursor-nwse-resize"
            style={{ right: '-17px', bottom: '-17px' }}
            onMouseDown={(e) => handleResizeMouseDown(e, "se")}
          ></div>
          <div 
            className="absolute left-0 top-0 bottom-0 w-7 cursor-ew-resize"
            style={{ left: '-17px' }}
            onMouseDown={(e) => handleResizeMouseDown(e, "w")}
          ></div>
          <div 
            className="absolute left-[30px] right-[30px] top-0 h-7 cursor-ns-resize"
            style={{ top: '-17px' }}
            onMouseDown={(e) => handleResizeMouseDown(e, "n")}
          ></div>
          <div 
            className="absolute left-0 bottom-0 w-12 h-12 cursor-nesw-resize"
            style={{ left: '-17px', bottom: '-17px' }}
            onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
          ></div>
          {/* Skip top-right corner completely to avoid interfering with close button */}
          {/* Only have resize handle on the far corner, away from buttons */}
          <div 
            className="absolute left-0 top-0 w-12 h-12 cursor-nwse-resize"
            style={{ left: '-17px', top: '-17px' }}
            onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
          ></div>
        </>
      )}
    </div>
  );
} 