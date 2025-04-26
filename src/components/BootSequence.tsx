import React, { useState, useEffect, useRef } from 'react';

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [stage, setStage] = useState<'bios' | 'loading'>('bios');
  const [biosText, setBiosText] = useState<string[]>([]);
  const [dotsCount, setDotsCount] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const bootAudioRef = useRef<HTMLAudioElement | null>(null);
  const folderOpenAudioRef = useRef<HTMLAudioElement | null>(null);
  const buttonClickAudioRef = useRef<HTMLAudioElement | null>(null);
  const formSubmitAudioRef = useRef<HTMLAudioElement | null>(null);
  const imageOpenAudioRef = useRef<HTMLAudioElement | null>(null);

  // BIOS boot sequence text
  const biosLines = [
    "LILY BIOS (c) 2001 LILY Software Inc.",
    "MAIN BIOS Checksum: L14Y4",
    "LIBEIOS 4.51PG",
    "05-04-2001-I440LN-G277-2A6LMT3DC-00",
    "",
    "CPU: Intel(R) Pentium(R) II Processor 300MHz",
    "Memory Test: 16384K OK",
    "",
    "Detecting IDE drives...",
    "Primary Master: FOUND... 6.4GB",
    "Primary Slave: FOUND... CD-ROM",
    "Secondary Master: None",
    "Secondary Slave: None",
    "",
    "Initializing Hard Drives...",
    "Initializing CD-ROM drive...",
    "",
    "CMOS Setup Utility - Copyright (C) 2001-2025",
    "",
    "LILY OPERATING SYSTEM",
    "VERSION 1.0",
    "Copyright (C) 2001 Lily",
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
        // Done loading, transition to completion (no login screen)
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    };
    
    // Start the progress animation
    progressWithDelay();
  }, [stage, onComplete]);

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
    <div className="font-mono text-white bg-black p-2 w-full h-screen overflow-hidden relative cursor-default">
      {/* Windows logo in top right - 250% bigger */}
      <div className="absolute top-2 right-2">
        <img 
          src="/images/icons/windows.png" 
          alt="Windows" 
          className="w-20 h-20" /* Increased from w-8 h-8 by 250% */
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

  // Render loading screen - with icon reduced by 50%
  const renderLoadingScreen = () => (
    <div className="flex flex-col items-center justify-center h-screen cursor-default"
      style={{
        backgroundColor: 'black'
      }}
    >
      {/* Center blue rectangle with gradient borders */}
      <div className="w-full max-w-3xl px-6 py-12 relative">
        {/* Top gradient border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#6D6DD0] to-transparent"></div>
        
        <div className="flex flex-col items-center justify-center">
          <img 
            src="/images/icons/windows.png" 
            alt="Windows" 
            className="h-16 w-16 mb-10" /* Adjusted from h-14 w-14 to be larger */
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `
                <div class="text-white text-2xl font-bold mb-10">Windows XP</div>
              `;
            }}
          />
          
          {/* Loading bar with small squares */}
          <div className="w-64 h-4 bg-[#111] border border-[#6D6DD0] p-0.5 mb-4">
            <div className="h-full flex">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-full w-3 mr-0.5 ${i < Math.floor(loadingProgress / 5) ? 'bg-[#6D6DD0]' : 'bg-transparent'}`}
                ></div>
              ))}
            </div>
          </div>
          
        </div>
        
        {/* Bottom gradient border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#6D6DD0] to-transparent"></div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 cursor-default">
      {/* Audio elements */}
      <audio ref={bootAudioRef} src="/audio/windows-95-startup.mp3"></audio>
      
      {/* New audio elements for interactions */}
      <audio ref={folderOpenAudioRef} src="/audio/folder-open.mp3"></audio>
      <audio ref={buttonClickAudioRef} src="/audio/button-click.mp3"></audio>
      <audio ref={formSubmitAudioRef} src="/audio/form-submit.mp3"></audio>
      <audio ref={imageOpenAudioRef} src="/audio/image-open.mp3"></audio>

      {/* Render appropriate stage */}
      {stage === 'bios' && renderBiosScreen()}
      {stage === 'loading' && renderLoadingScreen()}
    </div>
  );
} 