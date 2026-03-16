type IllustrationProps = {
  color?: string;
  opacity?: number;
  size?: number;
  className?: string;
};

import { colors } from "@/config/theme";
const defaultColor = colors.primary;
const defaultOpacity = 0.9;

/**
 * Settings-themed SVG illustrations for the Settings module banner.
 */
export function SettingsGearIcon({
  color = defaultColor,
  opacity = defaultOpacity,
  size = 56,
  className,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M28 34a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity={opacity}
      />
      <path
        d="M28 12v4M28 40v4M12 28h-4M44 28h4M16.5 16.5l2.8 2.8M36.7 36.7l2.8 2.8M16.5 39.5l2.8-2.8M36.7 19.3l2.8-2.8"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity={opacity * 0.9}
      />
      <path
        d="M28 8l-1.5 4.5L22 11l2.5 4.5L28 16l3.5-1L34 11l-4.5 1.5L28 8z"
        fill={color}
        opacity={opacity * 0.7}
      />
      <path
        d="M28 48l1.5-4.5L34 45l-2.5-4.5L28 40l-3.5 1L22 45l4.5-1.5L28 48z"
        fill={color}
        opacity={opacity * 0.7}
      />
    </svg>
  );
}

/** Calendar + list: sessions and semesters. */
export function SessionConfigIcon({
  color = defaultColor,
  opacity = defaultOpacity,
  size = 56,
  className,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="10"
        y="8"
        width="22"
        height="22"
        rx="3"
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity={opacity}
      />
      <path
        d="M10 16h22M16 8v6M26 8v6M36 14h10M36 20h10M36 26h7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={opacity * 0.9}
      />
      <circle cx="15" cy="22" r="1.5" fill={color} opacity={opacity * 0.8} />
      <circle cx="15" cy="28" r="1.5" fill={color} opacity={opacity * 0.6} />
    </svg>
  );
}
