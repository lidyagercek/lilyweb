import React from 'react';

export function StartButton({ showStartMenu, onClick }) {
  return (
    <button
      className={`h-full px-2 py-1 flex items-center font-bold text-sm
        border-t border-l border-white border-r border-b border-[#868a8e]
        bg-[#c0c0c0] active:bg-[#c0c0c0] focus:outline-none
        ${showStartMenu ? "shadow-[inset_-1px_-1px_0_#ffffff,inset_1px_1px_0_#868a8e] bg-[#c0c0c0]" : ""}`}
      onClick={onClick}
      aria-label="Start Menu"
    >
      <div className="flex items-center">
        <div className="w-4 h-4 mr-1 flex items-center justify-center bg-[#008080]">
          <span className="text-white text-xs font-bold">W</span>
        </div>
        <span>Start</span>
      </div>
    </button>
  );
} 