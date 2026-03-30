import React from "react";

/**
 * Professional and attractive book pattern for the illustration panel.
 * Abstractly represents knowledge, learning, and academic themes.
 * Colors use white/semi-transparent constants so the illustration is
 * visible on a solid primaryColor panel background.
 */
export const StudentIllustration: React.FC = () => {

  // White-tinted palette — works on any primaryColor hue
  const bookColor1 = "#ffffff";
  const bookColor2 = "rgba(255,255,255,0.75)";
  const bookColor3 = "rgba(255,255,255,0.55)";
  const accentColor = "rgba(255,255,255,0.35)";

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 300 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: 280, width: "100%", height: "auto" }}
    >
      <defs>
        <filter id="shadow-book" x="-15%" y="-5%" width="130%" height="110%">
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="10"
            floodColor="rgba(0,0,0,0.25)"
            floodOpacity="1"
          />
        </filter>
      </defs>

      <g filter="url(#shadow-book)">
        {/* Stack of books 1 */}
        <rect x="40" y="80" width="100" height="30" rx="5" fill={bookColor1} opacity="0.9" />
        <rect x="50" y="105" width="100" height="30" rx="5" fill={bookColor2} opacity="0.9" transform="rotate(5 50 105)" />
        <rect x="45" y="130" width="110" height="30" rx="5" fill={bookColor3} opacity="0.9" transform="rotate(-3 45 130)" />

        {/* Stack of books 2 */}
        <rect x="160" y="120" width="90" height="25" rx="5" fill={bookColor2} opacity="0.9" />
        <rect x="170" y="140" width="90" height="25" rx="5" fill={bookColor1} opacity="0.9" transform="rotate(7 170 140)" />

        {/* Open book element */}
        <path
          d="M80 200 Q150 180 220 200 L220 280 Q150 300 80 280 Z"
          fill="rgba(255,255,255,0.15)"
          opacity="1"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="2"
        />
        <path d="M150 190 L150 290" stroke="rgba(255,255,255,0.6)" strokeWidth="1" opacity="0.7" />
        <rect x="90" y="210" width="50" height="50" fill={accentColor} opacity="0.3" />
        <rect x="160" y="210" width="50" height="50" fill={accentColor} opacity="0.3" />

        {/* Decorative shapes */}
        <circle cx="240" cy="80" r="10" fill="rgba(255,255,255,0.3)" opacity="1" />
        <rect x="230" y="270" width="20" height="20" rx="3" fill="rgba(255,255,255,0.2)" opacity="1" transform="rotate(15 230 270)" />
        <polygon points="60,250 70,260 80,250 70,240" fill="rgba(255,255,255,0.25)" opacity="1" />
      </g>
    </svg>
  );
};
