import { colors } from "@/config/theme";
import { useToken } from "@/hooks/useToken";
import React from "react";

/**
 * Professional and attractive book pattern for the left side branding.
 * Abstractly represents knowledge, learning, and academic themes.
 */
export const StudentIllustration: React.FC = () => {
  const t = useToken();
  const c = t.colorPrimary as string;
  const cLight = colors.primaryLight;
  const cDark = colors.primaryDark;

  // Using theme colors for a cohesive book pattern
  const bookColor1 = colors.primary;
  const bookColor2 = colors.primaryLight;
  const bookColor3 = colors.primaryDark;
  const accentColor = colors.info;

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
        <linearGradient id="background-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={c} stopOpacity={0.1} />
          <stop offset="100%" stopColor={c} stopOpacity={0} />
        </linearGradient>
        <filter id="shadow-book" x="-15%" y="-5%" width="130%" height="110%">
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="10"
            floodColor={c}
            floodOpacity="0.12"
          />
        </filter>
      </defs>

      {/* Background subtle gradient */}
      <rect x="0" y="0" width="300" height="340" fill="url(#background-gradient)" />

      <g filter="url(#shadow-book)">
        {/* Stack of books 1 */}
        <rect x="40" y="80" width="100" height="30" rx="5" fill={bookColor1} opacity="0.9" />
        <rect x="50" y="105" width="100" height="30" rx="5" fill={bookColor2} opacity="0.9" transform="rotate(5 50 105)" />
        <rect x="45" y="130" width="110" height="30" rx="5" fill={bookColor3} opacity="0.9" transform="rotate(-3 45 130)" />

        {/* Stack of books 2 */}
        <rect x="160" y="120" width="90" height="25" rx="5" fill={bookColor2} opacity="0.9" />
        <rect x="170" y="140" width="90" height="25" rx="5" fill={bookColor1} opacity="0.9" transform="rotate(7 170 140)" />
        
        {/* Open book element */}
        <path d="M80 200 Q150 180 220 200 L220 280 Q150 300 80 280 Z" fill="#FFFFFF" opacity="0.9" stroke={cDark} strokeWidth="2" />
        <path d="M150 190 L150 290" stroke={cLight} strokeWidth="1" opacity="0.7" />
        <rect x="90" y="210" width="50" height="50" fill={accentColor} opacity="0.3" />
        <rect x="160" y="210" width="50" height="50" fill={accentColor} opacity="0.3" />

        {/* Abstract knowledge symbols */}
        <circle cx="240" cy="80" r="10" fill={cLight} opacity="0.4" />
        <rect x="230" y="270" width="20" height="20" rx="3" fill={cDark} opacity="0.3" transform="rotate(15 230 270)" />
        <polygon points="60,250 70,260 80,250 70,240" fill={accentColor} opacity="0.2" />
      </g>
    </svg>
  );
};
