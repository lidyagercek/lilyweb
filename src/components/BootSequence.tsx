import React, { useState, useEffect, useRef } from 'react';

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [stage, setStage] = useState<'bios' | 'loading' | 'login'>('bios');
  const [biosText, setBiosText] = useState<string[]>([]);
  const [dotsCount, setDotsCount] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  const bootAudioRef = useRef<HTMLAudioElement | null>(null);
  const loginAudioRef = useRef<HTMLAudioElement | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const folderOpenAudioRef = useRef<HTMLAudioElement | null>(null);
  const buttonClickAudioRef = useRef<HTMLAudioElement | null>(null);
  const formSubmitAudioRef = useRef<HTMLAudioElement | null>(null);
  const imageOpenAudioRef = useRef<HTMLAudioElement | null>(null);

  // BIOS boot sequence text
  const biosLines = [
    "AWARD BIOS (c) 1997 AWARD Software Inc.",
    "MAIN BIOS Checksum: E10A",
    "AWDBEIOS 4.51PG",
    "04-12-1998-I440BX-W977-2A6LMT3DC-00",
    "",
    "CPU: Intel(R) Pentium(R) II Processor 300MHz",
    "Memory Test: 16384K OK",
    "",
    "Detecting IDE drives...",
    "Primary Master: QUANTUM FIREBALL CX 6.4GB",
    "Primary Slave: SONY CD-ROM CDU701",
    "Secondary Master: None",
    "Secondary Slave: None",
    "",
    "Initializing Hard Drives...",
    "Initializing CD-ROM drive...",
    "",
    "CMOS Setup Utility - Copyright (C) 1984-1998",
    "",
    "ART PORTFOLIO SYSTEM",
    "VERSION 1.0",
    "Copyright (C) 2023 Lillulette",
    "",
    "Loading System"
  ];

  // Simulate BIOS text typing effect
  useEffect(() => {
    if (stage !== 'bios') return;
    
    let currentLine = 0;
    let dotsTimer: NodeJS.Timeout | null = null;
    
    const timer = setInterval(() => {
      if (currentLine < biosLines.length) {
        setBiosText(prev => [...prev, biosLines[currentLine]]);
        currentLine++;
        
        // When we reach the last line, setup dots animation
        if (currentLine === biosLines.length) {
          // Start dots animation immediately and keep it running
          dotsTimer = setInterval(() => {
            setDotsCount(prev => prev % 3 + 1);
          }, 500);
          
          // Play boot sound
          if (bootAudioRef.current) {
            bootAudioRef.current.play().catch(err => console.error("Error playing audio:", err));
          }
          
          // Keep dots animation running during waiting period, only clear on transition
          setTimeout(() => {
            if (dotsTimer) clearInterval(dotsTimer);
            setStage('loading');
          }, 4000);
        }
      } else {
        clearInterval(timer);
      }
    }, 150);
    
    return () => {
      clearInterval(timer);
      if (dotsTimer) clearInterval(dotsTimer);
    };
  }, [stage]);

  // Simulate loading progress with uneven timing
  useEffect(() => {
    if (stage !== 'loading') return;
    
    let lastProgress = 0;
    
    const progressWithDelay = () => {
      // Create uneven progress with random pauses
      const randomIncrement = Math.floor(Math.random() * 8) + 3; // 3-10
      const newProgress = Math.min(lastProgress + randomIncrement, 100);
      
      setLoadingProgress(newProgress);
      lastProgress = newProgress;
      
      if (newProgress < 80) {
        // Random delay between progress increments (100-500ms)
        const delay = Math.random() * 400 + 100;
        setTimeout(progressWithDelay, delay);
      } else if (newProgress < 100) {
        // Last 20% movement is slower but still quick
        setTimeout(progressWithDelay, 300);
      } else {
        // Done loading, transition to login after delay
        setTimeout(() => {
          setStage('login');
        }, 1500);
      }
    };
    
    // Start the progress animation
    progressWithDelay();
  }, [stage]);

  // Handle login
  const handleUserSelect = (user: string) => {
    setSelectedUser(user);
    // Play login sound
    if (loginAudioRef.current) {
      loginAudioRef.current.play().catch(err => console.error("Error playing audio:", err));
    }
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  // Helper function to play sound effects (can be exported for use in other components)
  const playSound = (soundType: 'folder' | 'button' | 'form' | 'image') => {
    let audioRef: React.RefObject<HTMLAudioElement> | null = null;
    
    switch (soundType) {
      case 'folder':
        audioRef = folderOpenAudioRef;
        break;
      case 'button':
        audioRef = buttonClickAudioRef;
        break;
      case 'form':
        audioRef = formSubmitAudioRef;
        break;
      case 'image':
        audioRef = imageOpenAudioRef;
        break;
    }
    
    if (audioRef?.current) {
      // Reset audio to start if it's already playing
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.error("Error playing audio:", err));
    }
  };

  // Expose the playSound function to window so other components can use it
  useEffect(() => {
    // @ts-ignore
    window.playSound = playSound;
    
    return () => {
      // @ts-ignore
      delete window.playSound;
    };
  }, []);

  // Render BIOS screen
  const renderBiosScreen = () => (
    <div className="font-mono text-white bg-black p-2 w-full h-screen overflow-hidden relative">
      {/* Windows logo in top right */}
      <div className="absolute top-2 right-2">
        <img 
          src="/images/icons/windows.png" 
          alt="Windows" 
          className="w-8 h-8"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>
      
      <div className="whitespace-pre">
        {biosText.map((line, index) => (
          <div key={index}>
            {/* For the last line, add the animated dots */}
            {line === "Loading System" ? (
              <span>
                {line}
                <span className="inline-block ml-1">{".".repeat(dotsCount)}</span>
              </span>
            ) : (line || <br />)}
          </div>
        ))}
      </div>
    </div>
  );

  // Render Windows 98/XP style loading screen
  const renderLoadingScreen = () => (
    <div className="flex flex-col items-center justify-center h-screen"
      style={{
        backgroundColor: 'black'
      }}
    >
      {/* Center blue rectangle with gradient borders */}
      <div className="w-full max-w-3xl px-6 py-12 relative">
        {/* Top gradient border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#245edb] to-transparent"></div>
        
        <div className="flex flex-col items-center justify-center">
          <img 
            src="/images/icons/windows.png" 
            alt="Windows" 
            className="h-16 mb-10"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `
                <div class="text-white text-2xl font-bold mb-10">Windows XP</div>
              `;
            }}
          />
          
          {/* Loading bar with small squares */}
          <div className="w-64 h-4 bg-[#111] border border-[#333] p-0.5 mb-4">
            <div className="h-full flex">
              {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i}
                  className={`h-full w-3 mr-0.5 ${i < Math.floor(loadingProgress / 5) ? 'bg-[#245edb]' : 'bg-transparent'}`}
                ></div>
              ))}
            </div>
          </div>
          
          <div className="text-white font-semibold">
            Loading Art Portfolio System...
          </div>
        </div>
        
        {/* Bottom gradient border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#245edb] to-transparent"></div>
      </div>
    </div>
  );

  // Render Windows XP style login screen
  const renderLoginScreen = () => (
    <div 
      className="h-screen w-full flex flex-col"
      style={{
        backgroundImage: 'linear-gradient(to bottom, #245edb 0%, #7ca5e6 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Windows XP Logo at top */}
      <div className="flex items-center justify-center mt-8">
        <img 
          src="/images/windows-xp-logo.png" 
          alt="Windows XP" 
          className="h-16"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.parentElement!.innerHTML = `
              <div class="text-white text-2xl font-bold">Windows XP</div>
            `;
          }}
        />
      </div>

      {/* Login instruction */}
      <div className="text-white text-center font-semibold text-lg mt-4">
        To begin, click your user name
      </div>

      {/* Main content rectangle - spans full width */}
      <div className="flex-1 flex justify-center items-center">
        <div className="w-full relative h-64 mx-4 border-t border-b border-[#3a70d4]">
          {/* Top gradient border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#3a70d4] to-transparent -translate-y-1"></div>
          
          {/* 60/40 split content area */}
          <div className="flex h-full">
            {/* Left section (60%) */}
            <div className="w-3/5 h-full bg-gradient-to-b from-[#3a70d4] to-[#245edb] flex justify-end items-center relative pr-12">
              <div className="text-white flex flex-col items-center">
                <img 
                  src="/images/icons/windows.png" 
                  alt="Windows" 
                  className="w-16 h-16 mb-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="text-lg font-semibold">Welcome to Art Portfolio</div>
              </div>

              {/* Vertical separator with gradient */}
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#3a70d4] to-transparent"></div>
            </div>

            {/* Right section (40%) */}
            <div className="w-2/5 h-full bg-gradient-to-b from-[#3a70d4] to-[#245edb] flex justify-start items-start pt-8 pl-10">
              <div
                onClick={() => handleUserSelect('Lillulette')}
                className="flex items-center cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-16 h-16 rounded-md overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src="/images/about-me/about/profile.png"
                    alt="Lillulette"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-[#245edb]">
                          <span class="text-white text-2xl">L</span>
                        </div>
                      `;
                    }}
                  />
                </div>
                <span className="text-white font-semibold text-lg drop-shadow-md ml-3">User</span>
              </div>
            </div>
          </div>
          
          {/* Bottom gradient border */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#3a70d4] to-transparent translate-y-1"></div>
        </div>
      </div>

      {/* Footer area with buttons */}
      <div className="h-16 bg-[#245edb] flex items-center px-4 border-t border-[#3a70d4]">
        <div className="flex items-center text-white">
          <div className="flex items-center bg-red-600 hover:bg-red-700 px-2 py-1 rounded cursor-pointer mr-4">
            <img 
              src="/images/icons/power_icon.png" 
              alt="Power"
              className="w-4 h-4 mr-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <span className="text-white text-sm">Turn off computer</span>
          </div>
        </div>
        <div className="flex-1"></div>
        <div className="text-white text-xs text-right">
          <div>After you log on, you can add or change accounts.</div>
          <div>Just go to Control Panel and click User Accounts.</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50">
      {/* Audio elements */}
      <audio ref={bootAudioRef} src="/audio/windows-95-startup.mp3"></audio>
      <audio ref={loginAudioRef} src="/audio/windows-xp-login.mp3"></audio>
      <audio ref={notificationAudioRef} src="/audio/notification.mp3"></audio>
      
      {/* New audio elements for interactions */}
      <audio ref={folderOpenAudioRef} src="/audio/folder-open.mp3"></audio>
      <audio ref={buttonClickAudioRef} src="/audio/button-click.mp3"></audio>
      <audio ref={formSubmitAudioRef} src="/audio/form-submit.mp3"></audio>
      <audio ref={imageOpenAudioRef} src="/audio/image-open.mp3"></audio>

      {/* Render appropriate stage */}
      {stage === 'bios' && renderBiosScreen()}
      {stage === 'loading' && renderLoadingScreen()}
      {stage === 'login' && renderLoginScreen()}
    </div>
  );
} 