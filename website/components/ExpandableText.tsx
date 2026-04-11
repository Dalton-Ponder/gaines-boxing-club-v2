"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";

export function ExpandableText({ 
  text, 
  clamp = 2,
  className = "",
  colorClass = "text-slate-300"
}: { 
  text: string; 
  clamp?: number; 
  className?: string;
  colorClass?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Use useLayoutEffect to check for truncation before the browser paints
  // but only when we are in the "clamped" state.
  useLayoutEffect(() => {
    if (!isExpanded) {
      const checkTruncation = () => {
        if (textRef.current) {
          const isTruncated = textRef.current.scrollHeight > textRef.current.clientHeight;
          setCanExpand(isTruncated);
        }
      };

      // Initial check
      checkTruncation();

      // Resilience for fonts loading or layout shifts
      const timer = setTimeout(checkTruncation, 100);
      
      window.addEventListener('resize', checkTruncation);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', checkTruncation);
      };
    }
  }, [text, clamp, isExpanded]);

  return (
    <div className={className}>
      <p 
        ref={textRef}
        className={`${colorClass} leading-relaxed font-light`}
        style={!isExpanded ? {
          display: '-webkit-box',
          WebkitLineClamp: clamp,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        } : {}}
      >
        {text}
      </p>
      {canExpand && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary text-[10px] font-black uppercase tracking-widest mt-1 hover:underline cursor-pointer"
        >
          {isExpanded ? "Show Less" : "Read More"}
        </button>
      )}
    </div>
  );
}
