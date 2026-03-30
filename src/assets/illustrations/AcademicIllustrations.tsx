type IllustrationProps = {
  /** Primary color (e.g. theme.colorPrimary) */
  color?: string;
  /** Opacity 0–1 */
  opacity?: number;
  /** Width/height for inline use */
  size?: number;
  className?: string;
};

import { DEFAULT_PRIMARY } from "@/app/theme/themeConfig";
const defaultColor = DEFAULT_PRIMARY;
const defaultOpacity = 0.9;

/**
 * Academic-themed SVG illustrations for reuse across auth, dashboard, and feature pages.
 * Use with theme token for color consistency.
 */
export function GraduationCapIcon({
  color = defaultColor,
  opacity = defaultOpacity,
  size = 48,
  className,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M24 8L4 18l20 10 20-10L24 8z" fill={color} opacity={opacity} />
      <path
        d="M12 22v12l12 6 12-6V22"
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity={opacity}
      />
      <path
        d="M24 28v10M18 26l6 2 6-2"
        stroke={color}
        strokeWidth="1.5"
        opacity={opacity}
      />
    </svg>
  );
}

export function OpenBookIcon({
  color = defaultColor,
  opacity = defaultOpacity,
  size = 48,
  className,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M24 8c-4 0-12 2-12 10v20c0 4 4 6 12 8 8-2 12-4 12-8V18c0-8-8-10-12-10z"
        fill={color}
        opacity={opacity * 0.7}
      />
      <path
        d="M24 8c4 0 12 2 12 10v20c0 4-4 6-12 8"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        opacity={opacity}
      />
      <path
        d="M24 14v24"
        stroke={color}
        strokeWidth="1"
        opacity={opacity * 0.8}
      />
    </svg>
  );
}

export function DiplomaScrollIcon({
  color = defaultColor,
  opacity = defaultOpacity,
  size = 48,
  className,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="10"
        y="6"
        width="28"
        height="36"
        rx="2"
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity={opacity}
      />
      <path
        d="M16 14h16M16 20h16M16 26h10"
        stroke={color}
        strokeWidth="1"
        opacity={opacity * 0.8}
      />
      <circle cx="24" cy="34" r="3" fill={color} opacity={opacity * 0.6} />
    </svg>
  );
}

export function LaurelBranchIcon({
  color = defaultColor,
  opacity = defaultOpacity,
  size = 48,
  className,
}: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M24 40c-6-4-10-12-10-20 0-8 4-14 10-14s10 6 10 14c0 8-4 16-10 20z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity={opacity}
      />
      <path
        d="M18 20q4-2 6 2M30 20q-4-2-6 2"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        opacity={opacity * 0.8}
      />
    </svg>
  );
}
