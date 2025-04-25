import React, { useEffect, useRef, useState } from 'react';

interface WelcomeNotificationProps {
  onClose: () => void;
}

export function WelcomeNotification({ onClose }: WelcomeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Set a timeout to trigger the animation
    setTimeout(() => {
      setIsVisible(true);
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.error("Error playing audio:", err));
      }
    }, 500);
    
    // Auto-close the notification after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 500); // Animation duration
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 500); // Animation duration
  };
  
  return (
    <>
      <audio ref={audioRef} src="/audio/notification.mp3"></audio>
      
      <div 
        className={`fixed bottom-0 right-4 w-80 bg-[#ECE9D8] border border-[#0055E5] shadow-lg transition-all duration-500 z-50 ${
          isVisible ? 'transform translate-y-0' : 'transform translate-y-full'
        }`}
      >
        <div className="flex items-center bg-[#0055E5] text-white p-1">
          <div className="flex-1 text-sm font-semibold pl-2">Welcome</div>
          <button 
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center text-lg hover:bg-red-500 hover:text-white"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 flex items-start">
          <div className="mr-3">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="2" y="2" width="20" height="20" fill="#0055E5" />
              <path
                d="M12 7V13"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="square"
              />
              <rect x="11" y="15" width="2" height="2" fill="white" />
            </svg>
          </div>
          <div>
            <div className="font-semibold mb-1">Welcome to Lillulette's Art Portfolio</div>
            <div className="text-sm">
              Thanks for visiting! Feel free to explore my work and projects.
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 