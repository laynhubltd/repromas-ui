/**
 * Decorative background pattern for the auth illustration panel.
 * Education-themed: graduation caps, books, pencils, atoms, stars.
 * All elements use semi-transparent white so they work on any primaryColor.
 */
export function AuthPanelPattern() {
  const fill = "rgba(255,255,255,0.07)";
  const stroke = "rgba(255,255,255,0.12)";
  const dot = "rgba(255,255,255,0.15)";

  return (
    <svg
      viewBox="0 0 500 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
      preserveAspectRatio="xMidYMid slice"
    >
      {/* ── Graduation cap top-left ── */}
      <g transform="translate(40, 60) rotate(-10)">
        {/* board */}
        <polygon points="0,-18 22,0 0,18 -22,0" fill={fill} stroke={stroke} strokeWidth="1.5" />
        {/* top */}
        <rect x="-6" y="-26" width="12" height="10" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
        {/* tassel */}
        <line x1="22" y1="0" x2="34" y2="12" stroke={stroke} strokeWidth="1.5" />
        <circle cx="34" cy="14" r="3" fill={dot} />
      </g>

      {/* ── Open book top-right ── */}
      <g transform="translate(420, 90) rotate(12)">
        <path d="M0,0 Q-30,-8 -55,0 L-55,45 Q-30,37 0,45 Z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <path d="M0,0 Q30,-8 55,0 L55,45 Q30,37 0,45 Z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <line x1="0" y1="0" x2="0" y2="45" stroke={stroke} strokeWidth="1" />
        {/* text lines */}
        <line x1="-42" y1="14" x2="-14" y2="12" stroke={stroke} strokeWidth="1" opacity="0.7" />
        <line x1="-42" y1="22" x2="-14" y2="20" stroke={stroke} strokeWidth="1" opacity="0.7" />
        <line x1="-42" y1="30" x2="-20" y2="28" stroke={stroke} strokeWidth="1" opacity="0.7" />
        <line x1="14" y1="14" x2="42" y2="12" stroke={stroke} strokeWidth="1" opacity="0.7" />
        <line x1="14" y1="22" x2="42" y2="20" stroke={stroke} strokeWidth="1" opacity="0.7" />
        <line x1="14" y1="30" x2="36" y2="28" stroke={stroke} strokeWidth="1" opacity="0.7" />
      </g>

      {/* ── Pencil mid-left ── */}
      <g transform="translate(60, 280) rotate(-30)">
        <rect x="-5" y="-40" width="10" height="70" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <polygon points="-5,30 5,30 0,46" fill={dot} />
        <rect x="-5" y="-40" width="10" height="12" rx="2" fill={dot} />
      </g>

      {/* ── Compass / geometry mid-right ── */}
      <g transform="translate(440, 300)">
        {/* hinge */}
        <circle cx="0" cy="-4" r="5" fill={dot} stroke={stroke} strokeWidth="1.5" />
        {/* left leg */}
        <line x1="-2" y1="0" x2="-18" y2="38" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        {/* right leg */}
        <line x1="2" y1="0" x2="18" y2="38" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        {/* pencil tip on right leg */}
        <polygon points="14,34 22,34 18,44" fill={dot} />
        {/* arc drawn by compass */}
        <path d="M -28 46 A 34 34 0 0 1 28 46" stroke={stroke} strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
      </g>

      {/* ── Stack of books lower-left ── */}
      <g transform="translate(55, 500)">
        <rect x="0" y="0" width="80" height="16" rx="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="-4" y="16" width="88" height="16" rx="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="4" y="32" width="76" height="16" rx="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
        {/* spines */}
        <line x1="12" y1="0" x2="12" y2="16" stroke={stroke} strokeWidth="1" />
        <line x1="10" y1="16" x2="10" y2="32" stroke={stroke} strokeWidth="1" />
        <line x1="14" y1="32" x2="14" y2="48" stroke={stroke} strokeWidth="1" />
      </g>

      {/* ── Graduation cap lower-right ── */}
      <g transform="translate(430, 520) rotate(8)">
        <polygon points="0,-22 28,0 0,22 -28,0" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="-7" y="-32" width="14" height="12" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <line x1="28" y1="0" x2="42" y2="16" stroke={stroke} strokeWidth="1.5" />
        <circle cx="42" cy="18" r="4" fill={dot} />
      </g>

      {/* ── Light bulb / idea bottom-center ── */}
      <g transform="translate(250, 720)">
        <path d="M0,-30 C18,-30 28,-18 28,0 C28,14 18,22 12,28 L-12,28 C-18,22 -28,14 -28,0 C-28,-18 -18,-30 0,-30 Z"
          fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="-10" y="28" width="20" height="6" rx="2" fill={fill} stroke={stroke} strokeWidth="1" />
        <rect x="-8" y="34" width="16" height="6" rx="2" fill={fill} stroke={stroke} strokeWidth="1" />
        {/* filament lines */}
        <line x1="-8" y1="8" x2="8" y2="8" stroke={stroke} strokeWidth="1" opacity="0.6" />
        <line x1="-10" y1="16" x2="10" y2="16" stroke={stroke} strokeWidth="1" opacity="0.6" />
      </g>

      {/* ── Scattered dots / stars ── */}
      <circle cx="160" cy="40" r="3" fill={dot} />
      <circle cx="320" cy="160" r="2.5" fill={dot} />
      <circle cx="90" cy="190" r="2" fill={dot} />
      <circle cx="460" cy="440" r="3" fill={dot} />
      <circle cx="130" cy="650" r="2.5" fill={dot} />
      <circle cx="370" cy="680" r="2" fill={dot} />
      <circle cx="200" cy="820" r="3" fill={dot} />
      <circle cx="400" cy="800" r="2" fill={dot} />

      {/* ── Subtle connecting curves ── */}
      <path d="M40 80 Q200 200 440 300" stroke={stroke} strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M60 500 Q250 600 430 520" stroke={stroke} strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M160 40 Q300 400 250 720" stroke={stroke} strokeWidth="1" fill="none" opacity="0.3" />
    </svg>
  );
}
