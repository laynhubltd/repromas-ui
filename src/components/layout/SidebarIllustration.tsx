/**
 * Decorative SVG for the primary-colored sidebar (same pattern as admission-ui).
 * Light tint so the pattern is visible on the dark sidebar.
 */
export function SidebarIllustration() {
  const fill = "rgba(255,255,255,0.06)";
  const stroke = "rgba(255,255,255,0.1)";

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 300 800"
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
    >
      <circle cx="50" cy="100" r="40" fill={fill} />
      <circle cx="250" cy="200" r="50" fill={fill} />
      <circle cx="80" cy="400" r="35" fill={fill} />
      <circle cx="220" cy="500" r="45" fill={fill} />
      <circle cx="60" cy="650" r="40" fill={fill} />
      <circle cx="240" cy="700" r="30" fill={fill} />
      <path
        d="M 50 100 Q 150 150, 250 200"
        stroke={stroke}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M 80 400 Q 150 450, 220 500"
        stroke={stroke}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M 60 650 Q 150 675, 240 700"
        stroke={stroke}
        strokeWidth="2"
        fill="none"
      />
      <circle cx="150" cy="300" r="3" fill={stroke} />
      <circle cx="100" cy="550" r="3" fill={stroke} />
      <circle cx="200" cy="600" r="3" fill={stroke} />
    </svg>
  );
}
