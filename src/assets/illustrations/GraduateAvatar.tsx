type GraduateAvatarProps = {
  /** Centre of the avatar in the parent SVG's coordinates. */
  cx: number;
  cy: number;
  /** Ring class, so the parent can highlight it (e.g. when the journey passes through the centre). */
  ringClassName?: string;
  haloClassName?: string;
};

const SKIN = "#8B5A2B";
const FEATURES = "#2B1A10";
const GOWN = "#2E1065";
const CAP = "#140630";
const GOLD = "#F4B740";
const BACKDROP = "#EDE9FE";

/**
 * A graduate in cap, gown and gold stole: the student at the centre of the hero journey.
 * Drawn around (0, 0) in a 44-unit circle and moved into place, so it scales with the parent SVG.
 */
export function GraduateAvatar({ cx, cy, ringClassName, haloClassName }: GraduateAvatarProps) {
  return (
    <g transform={`translate(${cx} ${cy})`} aria-hidden="true">
      <defs>
        <clipPath id="graduate-avatar-clip">
          <circle r={44} />
        </clipPath>
      </defs>
      <circle className={haloClassName} r={56} />
      <g clipPath="url(#graduate-avatar-clip)">
        <circle r={44} fill={BACKDROP} />
        {/* gown, shirt collar and stole */}
        <path d="M-44 46C-40 21-22 14 0 14S40 21 44 46Z" fill={GOWN} />
        <path d="M-8 14L0 25 8 14Z" fill="#FFFFFF" />
        <path d="M-10 16-14 46M10 16 14 46" stroke={GOLD} strokeWidth={5} strokeLinecap="round" />
        {/* neck, head and face */}
        <rect x={-6} y={1} width={12} height={15} rx={4} fill={SKIN} />
        <circle cy={-6} r={13} fill={SKIN} />
        <circle cx={-4.5} cy={-5} r={1.5} fill={FEATURES} />
        <circle cx={4.5} cy={-5} r={1.5} fill={FEATURES} />
        <path d="M-4 0Q0 3.5 4 0" fill="none" stroke={FEATURES} strokeWidth={1.5} strokeLinecap="round" />
        {/* mortarboard and tassel */}
        <path d="M-13 -13V-19H13V-13Q0 -9-13 -13Z" fill={CAP} />
        <path d="M-28 -21 0 -32 28 -21 0 -10Z" fill={CAP} />
        <path d="M-28 -21 0 -32 28 -21" fill="none" stroke="#3B2A7A" strokeWidth={1} />
        <circle cy={-21} r={2.2} fill={GOLD} />
        <path d="M0 -21 22 -18V-5" fill="none" stroke={GOLD} strokeWidth={1.6} strokeLinecap="round" />
        <rect x={20} y={-6} width={4} height={9} rx={1.5} fill={GOLD} />
      </g>
      <circle className={ringClassName} r={44} />
    </g>
  );
}
