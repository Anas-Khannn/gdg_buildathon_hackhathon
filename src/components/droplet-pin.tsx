import React from "react";

export type SeverityType = "ankle" | "knee" | "danger" | "fixed";

interface DropletPinProps {
  severity: SeverityType;
  size?: number;
  className?: string;
  showRipple?: boolean;
}

export function DropletPin({
  severity,
  size = 38,
  className = "",
  showRipple = false,
}: DropletPinProps) {
  const config = {
    ankle: {
      color: "#E0A100",
      gradient: ["#FBBF24", "#D97706"],
      fillHeight: 14,
      symbol: null,
      label: "Ankle-deep",
    },
    knee: {
      color: "#D9622B",
      gradient: ["#FB923C", "#EA580C"],
      fillHeight: 26,
      symbol: null,
      label: "Knee-deep",
    },
    danger: {
      color: "#C8321F",
      gradient: ["#EF4444", "#DC2626"],
      fillHeight: 44,
      symbol: "!",
      label: "Danger",
    },
    fixed: {
      color: "#2E7D4F",
      gradient: ["#22C55E", "#16A34A"],
      fillHeight: 0,
      symbol: "✓",
      label: "Fixed",
    },
  }[severity] || {
    color: "#4B6073",
    gradient: ["#94A3B8", "#475569"],
    fillHeight: 10,
    symbol: null,
    label: "Unknown",
  };

  const idSuffix = React.useId().replace(/:/g, "");

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size * 1.25 }}
    >
      {/* Danger Pulsing Ring */}
      {severity === "danger" && (
        <div className="absolute inset-0 rounded-full animate-ripple pointer-events-none -m-1" style={{ backgroundColor: "rgba(200, 50, 31, 0.25)" }} />
      )}

      <svg
        width={size}
        height={size * 1.25}
        viewBox="0 0 36 45"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_4px_8px_rgba(18,38,58,0.28)] transition-transform duration-200 hover:scale-110 select-none"
      >
        <defs>
          <clipPath id={`drop-clip-${idSuffix}`}>
            <path d="M18 2 C22 10, 34 22, 34 31 C34 38.7, 26.8 45, 18 45 C9.2 45, 2 38.7, 2 31 C2 22, 14 10, 18 2 Z" />
          </clipPath>
          <linearGradient id={`drop-grad-${idSuffix}`} x1="18" y1="0" x2="18" y2="45" gradientUnits="userSpaceOnUse">
            <stop stopColor={config.gradient[0]} />
            <stop offset="1" stopColor={config.gradient[1]} />
          </linearGradient>
        </defs>

        {/* Droplet Glass/Shell Container */}
        <path
          d="M18 2 C22 10, 34 22, 34 31 C34 38.7, 26.8 45, 18 45 C9.2 45, 2 38.7, 2 31 C2 22, 14 10, 18 2 Z"
          fill="#FFFFFF"
          stroke="#12263A"
          strokeWidth="2.5"
        />

        {/* Liquid Fill Level */}
        {config.fillHeight > 0 && (
          <g clipPath={`url(#drop-clip-${idSuffix})`}>
            <rect
              x="0"
              y={45 - config.fillHeight}
              width="36"
              height={config.fillHeight}
              fill={`url(#drop-grad-${idSuffix})`}
            />
            {/* Liquid Surface Line */}
            <line
              x1="2"
              y1={45 - config.fillHeight}
              x2="34"
              y2={45 - config.fillHeight}
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeOpacity="0.9"
            />
          </g>
        )}

        {/* Interior Symbol */}
        {config.symbol && (
          <text
            x="18"
            y={severity === "danger" ? "32" : "33"}
            fill={severity === "danger" ? "#FFFFFF" : config.color}
            fontSize={severity === "danger" ? "18" : "20"}
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {config.symbol}
          </text>
        )}

        {/* Glass reflection streak on top left */}
        <path
          d="M12 10 C10 14, 7 20, 6 26"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.75"
        />

        {/* Measurement Tick Marks on side (Gauge Pole look) */}
        <line x1="6" y1="31" x2="11" y2="31" stroke="#12263A" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="8" y1="21" x2="13" y2="21" stroke="#12263A" strokeWidth="1.5" strokeOpacity="0.4" />
      </svg>
    </div>
  );
}

// Generate high-resolution SVG string for Leaflet DivIcon
export function getDropletSvgString(severity: SeverityType, uniqueUid?: string): string {
  const uid = uniqueUid || Math.random().toString(36).substring(2, 8);
  const config = {
    ankle: {
      color: "#E0A100",
      gradTop: "#FBBF24",
      gradBot: "#D97706",
      fillHeight: 15,
      symbol: "",
    },
    knee: {
      color: "#D9622B",
      gradTop: "#FB923C",
      gradBot: "#EA580C",
      fillHeight: 27,
      symbol: "",
    },
    danger: {
      color: "#C8321F",
      gradTop: "#EF4444",
      gradBot: "#DC2626",
      fillHeight: 45,
      symbol: "!",
    },
    fixed: {
      color: "#2E7D4F",
      gradTop: "#22C55E",
      gradBot: "#16A34A",
      fillHeight: 0,
      symbol: "✓",
    },
  }[severity] || {
    color: "#4B6073",
    gradTop: "#94A3B8",
    gradBot: "#475569",
    fillHeight: 12,
    symbol: "",
  };

  const symbolHtml = config.symbol
    ? `<text x="18" y="32" fill="${severity === "danger" ? "#FFFFFF" : config.color}" font-size="18" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" dominant-baseline="central">${config.symbol}</text>`
    : "";

  const fillHtml =
    config.fillHeight > 0
      ? `<g clip-path="url(#drop-mask-${uid})">
          <rect x="0" y="${45 - config.fillHeight}" width="36" height="${config.fillHeight}" fill="url(#grad-${uid})" />
          <line x1="2" y1="${45 - config.fillHeight}" x2="34" y2="${45 - config.fillHeight}" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.9" />
        </g>`
      : "";

  return `
    <div style="width: 36px; height: 45px; position: relative; filter: drop-shadow(0 6px 12px rgba(18, 38, 58, 0.35)); cursor: pointer; transition: transform 0.2s ease;">
      ${severity === "danger" ? `<div style="position: absolute; inset: -6px; border-radius: 9999px; background: rgba(200, 50, 31, 0.25); animation: water-ripple 2s infinite; pointer-events: none;"></div>` : ""}
      <svg width="36" height="45" viewBox="0 0 36 45" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="drop-mask-${uid}">
            <path d="M18 2 C22 10, 34 22, 34 31 C34 38.7, 26.8 45, 18 45 C9.2 45, 2 38.7, 2 31 C2 22, 14 10, 18 2 Z" />
          </clipPath>
          <linearGradient id="grad-${uid}" x1="18" y1="0" x2="18" y2="45" gradientUnits="userSpaceOnUse">
            <stop stop-color="${config.gradTop}" />
            <stop offset="1" stop-color="${config.gradBot}" />
          </linearGradient>
        </defs>

        <!-- White Droplet Shell -->
        <path d="M18 2 C22 10, 34 22, 34 31 C34 38.7, 26.8 45, 18 45 C9.2 45, 2 38.7, 2 31 C2 22, 14 10, 18 2 Z" fill="#FFFFFF" stroke="#12263A" stroke-width="2.5" />

        ${fillHtml}
        ${symbolHtml}

        <!-- Gloss highlight -->
        <path d="M12 9 C10 13, 7 19, 6 25" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-opacity="0.75" />

        <!-- River gauge measuring ticks -->
        <line x1="6" y1="31" x2="11" y2="31" stroke="#12263A" stroke-width="1.5" stroke-opacity="0.4" />
        <line x1="8" y1="21" x2="13" y2="21" stroke="#12263A" stroke-width="1.5" stroke-opacity="0.4" />
      </svg>
    </div>
  `;
}
