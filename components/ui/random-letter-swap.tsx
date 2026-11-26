"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface RandomLetterSwapProps {
  label: string;
  href: string;
  className?: string;
  duration?: number;
  onClick?: () => void;
  active?: boolean;
}

const CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * RandomLetterSwap
 *
 * Editorial character scramble link for high-end navigation.
 * Progressively staggers and resolves individual characters back into original letters.
 * Fully accessible with screen reader labels, keyboard focus, and prefers-reduced-motion fallback.
 */
export const RandomLetterSwap: React.FC<RandomLetterSwapProps> = ({
  label,
  href,
  className = "",
  duration = 520,
  onClick,
  active = false,
}) => {
  const [displayText, setDisplayText] = useState(label);
  const [isHovered, setIsHovered] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Sync display text if label prop changes
  useEffect(() => {
    setDisplayText(label);
  }, [label]);

  const stopAnimation = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    startTimeRef.current = null;
    setDisplayText(label);
  }, [label]);

  const startAnimation = useCallback(() => {
    // Respect prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplayText(label);
      return;
    }

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const chars = label.split("");
    const length = chars.length;
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);

      const nextChars = chars.map((origChar, index) => {
        // Keep spaces and symbols untouched
        if (origChar === " " || /[^a-zA-Z0-9]/.test(origChar)) {
          return origChar;
        }

        // Stagger resolve window from left to right
        const charStartFraction = (index / length) * 0.45;
        const charEndFraction = charStartFraction + 0.45;

        if (progress >= charEndFraction) {
          return origChar;
        }

        if (progress >= charStartFraction) {
          // Rapidly scramble before locking
          const randomChar = CHARACTERS.charAt(
            Math.floor(Math.random() * CHARACTERS.length)
          );
          // Preserve case flavor
          return origChar === origChar.toUpperCase()
            ? randomChar.toUpperCase()
            : randomChar.toLowerCase();
        }

        // Hasn't started scrambling or slight initial jitter
        if (Math.random() > 0.4) {
          return CHARACTERS.charAt(
            Math.floor(Math.random() * CHARACTERS.length)
          );
        }
        return origChar;
      });

      setDisplayText(nextChars.join(""));

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayText(label);
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [label, duration]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    startAnimation();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    stopAnimation();
  };

  const handleFocus = () => {
    setIsHovered(true);
    startAnimation();
  };

  const handleBlur = () => {
    setIsHovered(false);
    stopAnimation();
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={`relative inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium tracking-tight transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-tide-teal/50 ${
        active || isHovered
          ? "text-[#087F80] bg-stone-100/60"
          : "text-stone-700 hover:text-[#087F80]"
      } ${className}`}
    >
      {/* Screen reader clean static name */}
      <span className="sr-only">{label}</span>

      {/* Visual character container with fixed layout stability */}
      <span
        aria-hidden="true"
        className="inline-block whitespace-nowrap font-medium"
      >
        {displayText}
      </span>
    </Link>
  );
};

export default RandomLetterSwap;
