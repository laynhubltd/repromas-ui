import { DEFAULT_PRIMARY, hexToRgba } from "@/app/theme/themeConfig";

type Props = {
  className?: string;
  /** Width for responsive scaling; height scales proportionally */
  width?: number;
};

/**
 * Full-width splash illustration for the Settings banner: layered SVG shapes,
 * gear, calendar, and soft gradients for a polished hero look.
 */
export function SettingsBannerSvg({ className, width = 320 }: Props) {
  const primary = DEFAULT_PRIMARY;
  const primarySoft = hexToRgba(primary, 0.06);
  const primaryDot = hexToRgba(primary, 0.2);

  return (
    <svg
      width={width}
      height={width * 0.5}
      viewBox="0 0 320 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient
          id="settings-banner-grad1"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={primary} stopOpacity="0.08" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="settings-banner-grad2"
          x1="100%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor={primary} stopOpacity="0.06" />
          <stop offset="100%" stopColor={primary} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient
          id="settings-banner-circle"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={primary} stopOpacity="0.15" />
          <stop offset="100%" stopColor={primary} stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* Soft background shapes */}
      <ellipse
        cx="260"
        cy="80"
        rx="100"
        ry="70"
        fill="url(#settings-banner-grad1)"
      />
      <path
        d="M320 0v160h-80c0-44 36-80 80-80V0z"
        fill="url(#settings-banner-grad2)"
      />
      <circle
        cx="280"
        cy="40"
        r="48"
        fill="url(#settings-banner-circle)"
      />
      <ellipse
        cx="200"
        cy="130"
        rx="60"
        ry="24"
        fill={primarySoft}
        opacity="0.6"
      />

      {/* Decorative dots */}
      <circle cx="248" cy="56" r="4" fill={primaryDot} />
      <circle cx="272" cy="72" r="3" fill={primaryDot} />
      <circle cx="256" cy="100" r="3" fill={primaryDot} />
      <circle cx="296" cy="88" r="2.5" fill={primaryDot} />

      {/* Large gear (right side) */}
      <g transform="translate(228, 68)">
        <circle
          cx="32"
          cy="32"
          r="14"
          stroke={primary}
          strokeWidth="2.5"
          fill="none"
          opacity="0.9"
        />
        <path
          d="M32 14v4M32 50v4M14 32h-4M50 32h4M20 20l2.8 2.8M41 41l2.8 2.8M20 44l2.8-2.8M41 23l2.8-2.8"
          stroke={primary}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.85"
        />
        <circle cx="32" cy="32" r="6" fill={primary} opacity="0.25" />
      </g>

      {/* Calendar / grid (sessions & semesters) */}
      <g transform="translate(268, 88)">
        <rect
          x="0"
          y="0"
          width="36"
          height="36"
          rx="4"
          stroke={primary}
          strokeWidth="1.8"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M0 12h36M12 0v12M24 0v12"
          stroke={primary}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <circle cx="8" cy="22" r="2" fill={primary} opacity="0.6" />
        <circle cx="8" cy="30" r="2" fill={primary} opacity="0.4" />
      </g>

      {/* Small floating circle accent */}
      <circle
        cx="240"
        cy="120"
        r="20"
        fill={primarySoft}
        stroke={primary}
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
}
