import type { ReactElement } from "react";

/**
 * Flat tonal module illustrations for the public marketing site (Home module grid, Platform cards).
 * Uses the official REPROMAS Brand Kit monochromatic purple scale (src/assets/brand-kit/README.txt).
 */
export type MarketingIconId =
  | "admission-cycles"
  | "matric-numbers"
  | "fee-events"
  | "invoices"
  | "online-payments"
  | "course-registration"
  | "curriculum-versions"
  | "score-entry"
  | "grading-systems"
  | "approval-workflows"
  | "result-broadsheet"
  | "academic-standing"
  | "degree-classification"
  | "senate-transitions"
  | "audit-trail"
  | "roles-permissions"
  | "student-portal";

const I = "#2E1065";  // Deep purple (primary)
const GD = "#4C1D95"; // Royal purple
const V = "#6D28D9";  // Violet
const G = "#8B5CF6";  // Bright violet
const M = "#A78BFA";  // Lilac
const L = "#C4B5FD";  // Pale lilac
const S = "#8B5CF6";  // Bright violet (tonal pair)
const C = "#DDD6FE";  // Mist
const T = "#EDE9FE";  // Shell (light surface)

const ICONS: Record<MarketingIconId, ReactElement> = {
  "admission-cycles": (
    <>
      <rect x="14" y="8" width="38" height="50" rx="7" fill={L} />
      <rect x="21" y="18" width="24" height="4" rx="2" fill="#fff" />
      <rect x="21" y="27" width="18" height="4" rx="2" fill="#fff" />
      <circle cx="50" cy="50" r="13" fill={V} />
      <path d="M44 50l4 4 8-9" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  "matric-numbers": (
    <>
      <rect x="8" y="16" width="56" height="40" rx="8" fill={G} />
      <rect x="15" y="25" width="16" height="20" rx="4" fill={I} />
      <rect x="36" y="27" width="20" height="4" rx="2" fill="#fff" />
      <rect x="36" y="36" width="14" height="4" rx="2" fill={T} />
    </>
  ),
  "fee-events": (
    <>
      <rect x="6" y="18" width="60" height="36" rx="7" fill={GD} />
      <circle cx="36" cy="36" r="10" fill={T} />
      <text x="36" y="41" textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="800" fontSize="13" fill={I}>
        ₦
      </text>
      <circle cx="15" cy="36" r="3" fill={L} />
      <circle cx="57" cy="36" r="3" fill={L} />
    </>
  ),
  invoices: (
    <>
      <path d="M16 6h40v58l-6-4-6 4-6-4-6 4-6-4-6 4-4-3z" fill={L} />
      <rect x="23" y="18" width="26" height="4" rx="2" fill={V} />
      <rect x="23" y="28" width="20" height="4" rx="2" fill="#fff" />
      <rect x="23" y="38" width="22" height="4" rx="2" fill="#fff" />
    </>
  ),
  "online-payments": (
    <>
      <rect x="6" y="16" width="54" height="36" rx="7" fill={V} />
      <rect x="6" y="24" width="54" height="7" fill={I} />
      <rect x="13" y="38" width="12" height="7" rx="2" fill={G} />
      <circle cx="56" cy="52" r="12" fill={M} />
      <path d="M50 52l4 4 7-8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  "course-registration": (
    <>
      <rect x="14" y="10" width="44" height="54" rx="7" fill={S} />
      <rect x="26" y="5" width="20" height="10" rx="4" fill={I} />
      <path d="M24 36l7 7 15-16" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  "curriculum-versions": (
    <>
      <rect x="10" y="42" width="52" height="12" rx="3" fill={C} />
      <rect x="14" y="29" width="46" height="12" rx="3" fill={G} />
      <rect x="8" y="16" width="48" height="12" rx="3" fill={V} />
      <rect x="14" y="20" width="18" height="4" rx="2" fill="#fff" />
    </>
  ),
  "score-entry": (
    <>
      <rect x="8" y="10" width="46" height="50" rx="6" fill={T} />
      <path d="M8 24h46M8 36h46M8 48h46M24 10v50M38 10v50" stroke={L} strokeWidth="2" />
      <path d="M44 58l4-12 16-16 8 8-16 16z" fill={G} />
      <path d="M44 58l4-12 8 8z" fill={GD} />
    </>
  ),
  "grading-systems": (
    <>
      <circle cx="36" cy="32" r="22" fill={G} />
      <circle cx="36" cy="32" r="15" fill="#fff" />
      <text x="36" y="40" textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="800" fontSize="20" fill={V}>
        A
      </text>
      <path d="M24 50l-6 16 8-4 4 7 6-15M48 50l6 16-8-4-4 7-6-15" fill={V} />
    </>
  ),
  "approval-workflows": (
    <>
      <circle cx="14" cy="36" r="9" fill={L} />
      <circle cx="36" cy="18" r="9" fill={G} />
      <circle cx="36" cy="54" r="9" fill={S} />
      <circle cx="58" cy="36" r="9" fill={M} />
      <path d="M21 31l8-8M21 41l8 8M43 23l8 8M43 49l8-8" stroke={V} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  "result-broadsheet": (
    <>
      <rect x="6" y="12" width="60" height="48" rx="7" fill="#fff" stroke={L} strokeWidth="3" />
      <rect x="6" y="12" width="60" height="12" rx="7" fill={S} />
      <path d="M6 36h60M6 48h60M26 24v36M46 24v36" stroke={L} strokeWidth="2" />
    </>
  ),
  "academic-standing": (
    <>
      <path d="M8 50a28 28 0 0156 0" fill="none" stroke={T} strokeWidth="10" strokeLinecap="round" />
      <path d="M8 50a28 28 0 0140-25" fill="none" stroke={M} strokeWidth="10" strokeLinecap="round" />
      <path d="M36 50l14-18" stroke={I} strokeWidth="4" strokeLinecap="round" />
      <circle cx="36" cy="50" r="5" fill={I} />
    </>
  ),
  "degree-classification": (
    <>
      <path d="M4 28l32-14 32 14-32 14z" fill={I} />
      <path d="M18 35v12c8 7 28 7 36 0V35l-18 8z" fill={V} />
      <path d="M60 31v18" stroke={G} strokeWidth="3" />
      <circle cx="60" cy="52" r="4" fill={G} />
    </>
  ),
  "senate-transitions": (
    <>
      <path d="M6 26L36 8l30 18z" fill={V} />
      <rect x="10" y="28" width="52" height="5" fill={I} />
      <rect x="14" y="35" width="7" height="20" fill={L} />
      <rect x="26" y="35" width="7" height="20" fill={L} />
      <rect x="39" y="35" width="7" height="20" fill={L} />
      <rect x="51" y="35" width="7" height="20" fill={L} />
      <rect x="8" y="56" width="56" height="7" rx="2" fill={I} />
    </>
  ),
  "audit-trail": (
    <>
      <path d="M30 6l22 9v15c0 14-9 23-22 28C17 53 8 44 8 30V15z" fill={M} />
      <circle cx="48" cy="48" r="15" fill="#fff" stroke={V} strokeWidth="4" />
      <path d="M48 40v9l6 4" fill="none" stroke={V} strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),
  "roles-permissions": (
    <>
      <circle cx="24" cy="30" r="15" fill={G} />
      <circle cx="24" cy="30" r="6" fill="#fff" />
      <path d="M36 36l26 0 0 8-5 0 0 6-6 0 0-6-15 0z" fill={GD} />
    </>
  ),
  "student-portal": (
    <>
      <rect x="20" y="4" width="32" height="64" rx="8" fill={V} />
      <rect x="24" y="12" width="24" height="42" rx="3" fill="#fff" />
      <rect x="28" y="18" width="16" height="4" rx="2" fill={L} />
      <rect x="28" y="27" width="12" height="4" rx="2" fill={G} />
      <rect x="28" y="36" width="14" height="4" rx="2" fill={M} />
      <circle cx="36" cy="60" r="3" fill="#fff" />
    </>
  ),
};

export type MarketingModuleIconProps = {
  id: MarketingIconId;
  size?: number;
  className?: string;
};

export function MarketingModuleIcon({ id, size = 72, className }: MarketingModuleIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" className={className} aria-hidden="true" focusable="false">
      {ICONS[id]}
    </svg>
  );
}
