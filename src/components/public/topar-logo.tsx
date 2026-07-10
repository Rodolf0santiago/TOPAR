import React from 'react';

export default function TopArLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 bg-white hover:scale-105 transition-transform duration-300 px-4.5 py-2.5 rounded-2xl shadow-xl shadow-black/5 border border-slate-200/50 ${className}`}>
      {/* SVG Pinwheel Logo */}
      <svg viewBox="0 0 100 100" className="w-11 h-11 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
        <defs>
          {/* Curved arrow pointing to center (0,0) */}
          <path
            id="arrow-head"
            d="M -35,-5 C -25,-18 -15,-15 -8,-8 L -15,-3 L -6,-6 L -3,-15 Z"
          />
        </defs>
        {/* White circle background to match brand layout */}
        <circle cx="50" cy="50" r="46" fill="#FFFFFF" />
        
        <g transform="translate(50,50)">
          {/* 6 Blue Arrows */}
          <use href="#arrow-head" fill="#1A3B68" transform="rotate(0)" />
          <use href="#arrow-head" fill="#1A3B68" transform="rotate(90)" />
          <use href="#arrow-head" fill="#1A3B68" transform="rotate(180)" />
          <use href="#arrow-head" fill="#1A3B68" transform="rotate(270)" />
          <use href="#arrow-head" fill="#1A3B68" transform="rotate(135)" />
          <use href="#arrow-head" fill="#1A3B68" transform="rotate(315)" />
          
          {/* 2 Orange/Red Arrows (Opposite Diagonals) */}
          <use href="#arrow-head" fill="#F26522" transform="rotate(45)" />
          <use href="#arrow-head" fill="#F26522" transform="rotate(225)" />
        </g>
      </svg>
      
      {/* Text Logo */}
      <div className="flex flex-col justify-center leading-none select-none">
        <div className="flex items-baseline">
          <span className="text-2xl font-black tracking-tight text-[#F26522]">TOP</span>
          <span className="text-2xl font-black tracking-tight text-[#1A3B68] ml-0.5">AR</span>
        </div>
        <span className="text-[7.5px] font-black tracking-[0.28em] text-[#F26522] uppercase mt-1">
          Climatização
        </span>
      </div>
    </div>
  );
}
