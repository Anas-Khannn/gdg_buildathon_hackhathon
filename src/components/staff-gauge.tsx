"use client";

import React, { useState, useEffect } from "react";

interface StaffGaugeProps {
  areaName: string;
  daysToFix: number; // e.g. 3.2, 9.5, 14.2
  totalReports: number;
  fixedReports: number;
  maxDays?: number; // scale maximum, e.g. 20 days
  onClick?: () => void;
  selected?: boolean;
}

export function StaffGauge({
  areaName,
  daysToFix,
  totalReports,
  fixedReports,
  maxDays = 20,
  onClick,
  selected = false,
}: StaffGaugeProps) {
  const [animatedHeight, setAnimatedHeight] = useState(0);

  // Height percentage calculation: higher water level = slower area
  const percentage = Math.min(Math.max((daysToFix / maxDays) * 100, 8), 100);

  useEffect(() => {
    // Animate once on initial mount
    const timer = setTimeout(() => {
      setAnimatedHeight(percentage);
    }, 150);
    return () => clearTimeout(timer);
  }, [percentage]);

  // Determine speed tier & water color
  const isFast = daysToFix <= 5;
  const isModerate = daysToFix > 5 && daysToFix <= 10;
  const isSlow = daysToFix > 10;

  const waterColor = isFast ? "#2E7D4F" : isModerate ? "#D9622B" : "#C8321F";
  const badgeLabel = isFast ? "Fast" : isModerate ? "Moderate" : "Slow";

  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center p-3 rounded-2xl border transition-all cursor-pointer ${
        selected
          ? "bg-white border-[#0E6B73] shadow-lg ring-2 ring-[#0E6B73]/20"
          : "bg-white/80 hover:bg-white border-[#C9D4DA] hover:border-[#0E6B73]/40 shadow-sm"
      }`}
    >
      {/* Days number pill */}
      <div className="mb-2 text-center">
        <span
          className="text-lg font-bold font-heading px-2.5 py-0.5 rounded-full inline-block"
          style={{
            backgroundColor: `${waterColor}18`,
            color: waterColor,
          }}
        >
          {daysToFix.toFixed(1)} d
        </span>
      </div>

      {/* The River Staff Gauge Pole (SVG) */}
      <div className="relative w-14 h-48 flex items-center justify-center my-1">
        <svg
          width="56"
          height="192"
          viewBox="0 0 56 192"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="select-none"
        >
          <defs>
            <clipPath id={`gauge-clip-${areaName.replace(/\s+/g, "-")}`}>
              <rect x="18" y="6" width="20" height="180" rx="4" />
            </clipPath>
          </defs>

          {/* Measuring Pole Body */}
          <rect
            x="18"
            y="6"
            width="20"
            height="180"
            rx="4"
            fill="#EAF0F2"
            stroke="#12263A"
            strokeWidth="2.5"
          />

          {/* Water Fill Level (higher = slower area) */}
          <g clipPath={`url(#gauge-clip-${areaName.replace(/\s+/g, "-")})`}>
            <rect
              x="18"
              y={186 - (180 * (animatedHeight / 100))}
              width="20"
              height={180 * (animatedHeight / 100)}
              fill={waterColor}
              className="transition-all duration-1000 ease-out"
            />
            {/* Water Surface Line */}
            <line
              x1="18"
              y1={186 - (180 * (animatedHeight / 100))}
              x2="38"
              y2={186 - (180 * (animatedHeight / 100))}
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </g>

          {/* Tick marks every 5 days along the staff gauge */}
          {/* Day 0 (Bottom) */}
          <line x1="10" y1="184" x2="18" y2="184" stroke="#12263A" strokeWidth="2" />
          <text x="6" y="187" fill="#4B6073" fontSize="8" fontWeight="bold" textAnchor="end">0</text>

          {/* Day 5 */}
          <line x1="12" y1="140" x2="18" y2="140" stroke="#12263A" strokeWidth="1.5" />
          <text x="8" y="143" fill="#4B6073" fontSize="8" textAnchor="end">5d</text>

          {/* Day 10 */}
          <line x1="10" y1="96" x2="18" y2="96" stroke="#12263A" strokeWidth="2" />
          <text x="6" y="99" fill="#4B6073" fontSize="8" fontWeight="bold" textAnchor="end">10d</text>

          {/* Day 15 */}
          <line x1="12" y1="52" x2="18" y2="52" stroke="#12263A" strokeWidth="1.5" />
          <text x="8" y="55" fill="#4B6073" fontSize="8" textAnchor="end">15d</text>

          {/* Day 20 (Top) */}
          <line x1="10" y1="8" x2="18" y2="8" stroke="#12263A" strokeWidth="2" />
          <text x="6" y="11" fill="#4B6073" fontSize="8" fontWeight="bold" textAnchor="end">20d</text>

          {/* Alternating River Staff Stripes for High Contrast Outdoors */}
          <line x1="38" y1="140" x2="43" y2="140" stroke="#12263A" strokeWidth="1.5" />
          <line x1="38" y1="96" x2="45" y2="96" stroke="#12263A" strokeWidth="2" />
          <line x1="38" y1="52" x2="43" y2="52" stroke="#12263A" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Area Name & Statistics */}
      <div className="text-center mt-2 w-full">
        <h4 className="text-xs sm:text-sm font-bold text-[#12263A] leading-tight truncate">
          {areaName}
        </h4>
        <div className="flex items-center justify-center gap-1.5 mt-1 text-[11px] text-[#4B6073]">
          <span>{fixedReports}/{totalReports} fixed</span>
        </div>
        <span
          className="mt-1.5 inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            backgroundColor: `${waterColor}15`,
            color: waterColor,
          }}
        >
          {badgeLabel}
        </span>
      </div>
    </div>
  );
}
