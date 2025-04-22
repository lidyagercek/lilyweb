import { useState, useEffect, useRef } from 'react';
import { FolderIcon } from "./components/FolderIcon";
import { RetroWindow } from "./components/RetroWindow";
import { TaskBar } from "./components/TaskBar";
import "./index.css"

export default function App() {
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [activeWindows, setActiveWindows] = useState<string[]>([]);
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [maximizedWindow, setMaximizedWindow] = useState<string | null>(null);
  const [windowZIndices, setWindowZIndices] = useState<Record<string, number>>({});
  const [topZIndex, setTopZIndex] = useState(10);

  const startMenuRef = useRef<HTMLDivElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  // Function to bring a window to the front
  const bringToFront = (windowId: string) => {
    const newZIndex = topZIndex + 1;
    setWindowZIndices(prev => ({
      ...prev,
      [windowId]: newZIndex
    }));
    setTopZIndex(newZIndex);
  };

  // Function to handle opening a window
  const openWindow = (windowId: string) => {
    if (!activeWindows.includes(windowId)) {
      setActiveWindows(prev => [...prev, windowId]);
      // Set initial z-index for new window
      bringToFront(windowId);
    } else {
      // If window already exists, just bring it to front
      bringToFront(windowId);
    }
    
    // Remove from minimized if it was minimized
    if (minimizedWindows.includes(windowId)) {
      setMinimizedWindows(prev => prev.filter(id => id !== windowId));
    }
    
    setActiveWindow(windowId);
  };

  // Function to handle window click (to bring it to front)
  const handleWindowClick = (windowId: string) => {
    setActiveWindow(windowId);
    bringToFront(windowId);
  };

  // Function to handle closing a window
  const closeWindow = (windowId: string) => {
    console.log("Closing window:", windowId);
    
    // Remove from active windows
    setActiveWindows(prev => {
      const filtered = prev.filter(id => id !== windowId);
      console.log("New active windows:", filtered);
      return filtered;
    });
    
    // Also remove from minimized if it was there
    if (minimizedWindows.includes(windowId)) {
      setMinimizedWindows(prev => prev.filter(id => id !== windowId));
    }
    
    // Also remove from maximized if it was maximized
    if (maximizedWindow === windowId) {
      setMaximizedWindow(null);
    }
    
    // If this was the active window, select another window
    if (activeWindow === windowId) {
      // Find another visible window to activate
      const visibleWindows = activeWindows.filter(
        id => id !== windowId && !minimizedWindows.includes(id)
      );
      
      if (visibleWindows.length > 0) {
        // Set the last visible window as active
        const lastWindow = visibleWindows[visibleWindows.length - 1];
        setActiveWindow(lastWindow);
        bringToFront(lastWindow);
      } else {
        setActiveWindow(null);
      }
    }
    
    // Remove z-index entry
    setWindowZIndices(prev => {
      const newZIndices = {...prev};
      delete newZIndices[windowId];
      return newZIndices;
    });
  };

  // Function to handle minimizing a window
  const minimizeWindow = (windowId: string) => {
    if (!minimizedWindows.includes(windowId)) {
      setMinimizedWindows(prev => [...prev, windowId]);
    }
    
    // If this was the active window, set active to another window
    if (activeWindow === windowId) {
      const otherOpenWindows = activeWindows.filter(
        id => id !== windowId && !minimizedWindows.includes(id)
      );
      
      if (otherOpenWindows.length > 0) {
        const lastWindow = otherOpenWindows[otherOpenWindows.length - 1];
        setActiveWindow(lastWindow);
        bringToFront(lastWindow);
      } else {
        setActiveWindow(null);
      }
    }
    
    // If this was maximized, unmaximize it
    if (maximizedWindow === windowId) {
      setMaximizedWindow(null);
    }
  };
  
  // Function to handle maximizing a window
  const maximizeWindow = (windowId: string) => {
    // Toggle maximized state
    if (maximizedWindow === windowId) {
      setMaximizedWindow(null);
    } else {
      setMaximizedWindow(windowId);
    }
    
    // Ensure the window is active and on top
    setActiveWindow(windowId);
    bringToFront(windowId);
    
    // Ensure it's not minimized
    if (minimizedWindows.includes(windowId)) {
      setMinimizedWindows(prev => prev.filter(id => id !== windowId));
    }
  };

  // Function to toggle the start menu
  const toggleStartMenu = () => {
    setIsStartMenuOpen(prev => !prev);
  };

  // Get a list of all windows that are open but not minimized
  const visibleWindows = activeWindows.filter(id => !minimizedWindows.includes(id));
  
  // Close start menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isStartMenuOpen &&
        startMenuRef.current &&
        !startMenuRef.current.contains(event.target as Node) &&
        startButtonRef.current &&
        !startButtonRef.current.contains(event.target as Node)
      ) {
        setIsStartMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStartMenuOpen]);

  return (
    <div className="h-screen w-full flex flex-col bg-[#000000] p-4 overflow-hidden pb-10">
      <div className="flex-1 relative">
        {/* Desktop Icons */}
        <div className="w-64 ml-8">
          <div className="flex flex-col flex-wrap h-[740px] gap-7 mt-5 z-0">
            <FolderIcon 
              label="About Me" 
              selected={activeWindow === "about-me"}
              onClick={() => openWindow("about-me")}
              iconPath="/images/icons/lily_icon.png"
            />
            <FolderIcon 
              label="2D Arts" 
              selected={activeWindow === "2d-arts"}
              onClick={() => openWindow("2d-arts")}
              iconPath="/images/icons/2d_art_icon.png"
            />
            <FolderIcon 
              label="3D Works" 
              selected={activeWindow === "3d-works"}
              onClick={() => openWindow("3d-works")}
              iconPath="/images/icons/3d_art_icon.png"
            />
            <FolderIcon 
              label="Pixel Arts" 
              selected={activeWindow === "pixel-arts"}
              onClick={() => openWindow("pixel-arts")}
              iconPath="/images/icons/pixel_icon.png"
            />
            <FolderIcon 
              label="Animations" 
              selected={activeWindow === "animations"}
              onClick={() => openWindow("animations")}
              iconPath="/images/icons/animation_icon.png"
            />
            <FolderIcon 
              label="Tattoos" 
              selected={activeWindow === "tattoos"}
              onClick={() => openWindow("tattoos")}
              iconPath="/images/icons/tattoo_icon.png"
            />
          </div>
        </div>

        {/* Windows */}
        {activeWindows.includes("2d-arts") && !minimizedWindows.includes("2d-arts") && (
          <RetroWindow 
            title="2D Arts" 
            categories={["Illustrations", "Sketches", "Character/Concept Designs", "Casual Arts"]}
            onClose={() => closeWindow("2d-arts")}
            onMinimize={() => minimizeWindow("2d-arts")}
            onMaximize={() => maximizeWindow("2d-arts")}
            initialPosition={{ x: 100, y: 50 }}
            initialSize={{ width: 600, height: 400 }}
            folderType="2d-arts"
            isActive={activeWindow === "2d-arts"}
            onClick={() => handleWindowClick("2d-arts")}
            zIndex={windowZIndices["2d-arts"] || 1}
          />
        )}

        {activeWindows.includes("3d-works") && !minimizedWindows.includes("3d-works") && (
          <RetroWindow 
            title="3D Works" 
            categories={["Renders", "Models"]}
            onClose={() => closeWindow("3d-works")}
            onMinimize={() => minimizeWindow("3d-works")}
            onMaximize={() => maximizeWindow("3d-works")}
            initialPosition={{ x: 150, y: 80 }}
            initialSize={{ width: 520, height: 380 }}
            folderType="3d-works"
            isActive={activeWindow === "3d-works"}
            onClick={() => handleWindowClick("3d-works")}
            zIndex={windowZIndices["3d-works"] || 1}
          />
        )}

        {activeWindows.includes("pixel-arts") && !minimizedWindows.includes("pixel-arts") && (
          <RetroWindow 
            title="Pixel Art Gallery" 
            categories={[]}
            onClose={() => closeWindow("pixel-arts")}
            onMinimize={() => minimizeWindow("pixel-arts")}
            onMaximize={() => maximizeWindow("pixel-arts")}
            initialPosition={{ x: 200, y: 110 }}
            initialSize={{ width: 460, height: 340 }}
            folderType="pixel-arts"
            isActive={activeWindow === "pixel-arts"}
            onClick={() => handleWindowClick("pixel-arts")}
            zIndex={windowZIndices["pixel-arts"] || 1}
          />
        )}

        {activeWindows.includes("animations") && !minimizedWindows.includes("animations") && (
          <RetroWindow 
            title="Animations" 
            categories={["Live2D", "2D Animations", "Pixel Animations", "3D Animations"]}
            onClose={() => closeWindow("animations")}
            onMinimize={() => minimizeWindow("animations")}
            onMaximize={() => maximizeWindow("animations")}
            initialPosition={{ x: 250, y: 140 }}
            initialSize={{ width: 560, height: 400 }}
            folderType="animations"
            isActive={activeWindow === "animations"}
            onClick={() => handleWindowClick("animations")}
            zIndex={windowZIndices["animations"] || 1}
          />
        )}

        {activeWindows.includes("tattoos") && !minimizedWindows.includes("tattoos") && (
          <RetroWindow 
            title="Tattoo Designs" 
            categories={["Tattoos", "Available Designs", "Fake Skins"]}
            onClose={() => closeWindow("tattoos")}
            onMinimize={() => minimizeWindow("tattoos")}
            onMaximize={() => maximizeWindow("tattoos")}
            initialPosition={{ x: 300, y: 170 }}
            initialSize={{ width: 500, height: 370 }}
            folderType="tattoos"
            isActive={activeWindow === "tattoos"}
            onClick={() => handleWindowClick("tattoos")}
            zIndex={windowZIndices["tattoos"] || 1}
          />
        )}

        {activeWindows.includes("about-me") && !minimizedWindows.includes("about-me") && (
          <RetroWindow 
            title="About Me" 
            categories={["About", "Skills", "Programs", "Work Experience", "Socials", "Contact"]}
            onClose={() => closeWindow("about-me")}
            onMinimize={() => minimizeWindow("about-me")}
            onMaximize={() => maximizeWindow("about-me")}
            initialPosition={{ x: 350, y: 150 }}
            initialSize={{ width: 550, height: 400 }}
            folderType="about-me"
            isActive={activeWindow === "about-me"}
            onClick={() => handleWindowClick("about-me")}
            zIndex={windowZIndices["about-me"] || 1}
          />
        )}
      </div>

      {/* Start Menu */}
      {isStartMenuOpen && (
        <div 
          ref={startMenuRef}
          className="fixed bottom-10 left-1 w-48 bg-[#000000] border-4 border-[#6D6DD0] shadow-md z-50 p-1"
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-[#000000] text-[#6D6DD0] p-2 flex items-center h-10 border-1 border-[#6D6DD0]">
            <span className="font-bold rotate-[270deg] text-lg mr-2">▼</span>
            <span className="font-bold text-sm font-minecraft flex items-center leading-none pt-2 -mt-10 relative top-4">Art Portfolio</span>
          </div>
          <div className="border-t-4 border-[#6D6DD0] mt-1 pt-1">
            {["About Me", "2D Arts", "3D Works", "Pixel Arts", "Animations", "Tattoos"].map((name, index) => (
              <button 
                key={index}
                className="w-full text-left p-1 hover:bg-[#6D6DD0] hover:text-[#000000] flex items-center text-[#6D6DD0] font-minecraft"
                onClick={(e) => {
                  e.stopPropagation();
                  const windowId = name.toLowerCase().replace(/\s+/g, '-');
                  openWindow(windowId);
                  setIsStartMenuOpen(false);
                }}
              >
                <div className="w-5 h-5 mr-2 bg-[#252547] border-2 border-[#6D6DD0]"></div>
                <span className="flex items-center leading-none pt-2">{name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Taskbar */}
      <TaskBar 
        activeWindows={activeWindows}
        currentWindow={activeWindow}
        minimizedWindows={minimizedWindows}
        onWindowSelect={openWindow}
        openStartMenu={toggleStartMenu}
      />
    </div>
  )
}
