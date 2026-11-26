"use client";

import React from "react";
import Image from "next/image";

interface BothwayLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  subtext?: string;
  inverted?: boolean;
}

export function BothwayLogo({
  size = 32,
  className = "",
  showWordmark = false,
  subtext,
  inverted = false,
}: BothwayLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="relative shrink-0 rounded-full overflow-hidden flex items-center justify-center transition-transform hover:scale-105"
        style={{ width: size, height: size }}
      >
        <Image
          src="/brand/bothway-icon.svg"
          alt="Bothway Official Logo"
          width={size}
          height={size}
          className="w-full h-full object-contain"
          unoptimized
          priority
        />
      </div>

      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <span
            className={`text-sm font-extrabold tracking-wider ${
              inverted ? "text-white" : "text-slate-900"
            }`}
          >
            BOTHWAY
          </span>
          {subtext && (
            <span
              className={`text-[9px] font-semibold tracking-widest uppercase mt-0.5 ${
                inverted ? "text-slate-300" : "text-slate-400"
              }`}
            >
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
