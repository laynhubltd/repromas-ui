type GraduateAvatarProps = {
  /** Centre of the illustration in the parent SVG's coordinates. */
  cx: number;
  cy: number;
  /** Ring class, so the parent can highlight it (e.g. when the journey passes through the centre). */
  ringClassName?: string;
  haloClassName?: string;
};

/**
 * A large, prominent open MacBook displaying an SVG recreation of the REPROMAS Institutional Analytics Dashboard
 * in the brand purple (#2E1065 / #6D28D9) and warm academic gold (#FBBF24) palette.
 */
export function GraduateAvatar({ cx, cy, ringClassName, haloClassName }: GraduateAvatarProps) {
  return (
    <g transform={`translate(${cx} ${cy})`} aria-hidden="true">
      {/* Compact centre circle so the enlarged MacBook pops out past the ring */}
      <circle className={haloClassName} r={90} />
      <circle r={70} fill="#EDE9FE" />
      <circle className={ringClassName} r={70} />

      {/* Enlarged MacBook breaking out of the 70-unit circle */}
      <g transform="scale(1.26)">
        {/* Elevated drop shadow beneath the MacBook */}
        <ellipse cx={0} cy={49} rx={74} ry={6.5} fill="#140630" fillOpacity={0.22} />

        {/* MacBook lid / screen bezel */}
        <rect
          x={-68}
          y={-52}
          width={136}
          height={88}
          rx={7}
          fill="#140630"
          stroke="#2E1065"
          strokeWidth={2}
        />
        {/* Outer aluminum rim highlight */}
        <rect
          x={-69}
          y={-53}
          width={138}
          height={90}
          rx={8}
          fill="none"
          stroke="#C4B5FD"
          strokeOpacity={0.55}
          strokeWidth={1}
        />
        {/* Camera notch */}
        <rect x={-11} y={-52} width={22} height={3.8} rx={1.6} fill="#090218" />
        <circle cx={0} cy={-50.1} r={1} fill="#8B5CF6" />

        {/* Screen viewport: Vector SVG of REPROMAS Institutional Analytics Dashboard in Brand Colors */}
        <g>
          <clipPath id="repromas-macbook-screen">
            <rect x={-63} y={-46.5} width={126} height={77} rx={3.5} />
          </clipPath>
          <g clipPath="url(#repromas-macbook-screen)">
            {/* Main dashboard canvas background */}
            <rect x={-63} y={-46.5} width={126} height={77} fill="#F8FAFC" />

            {/* ================= LEFT NAVIGATION SIDEBAR (Brand Deep Purple) ================= */}
            <rect x={-63} y={-46.5} width={25} height={77} fill="#2E1065" />
            {/* Subtle decorative circle watermark inside sidebar (matches real REPROMAS sidebar) */}
            <circle cx={-42} cy={-16} r={11} fill="#3B1578" fillOpacity={0.65} />
            <circle cx={-56} cy={18} r={9} fill="#3B1578" fillOpacity={0.5} />

            {/* Institution Logo Lockup (White square badge + REPROMAS Admin title) */}
            <rect x={-60} y={-43.5} width={6} height={6} rx={1.4} fill="#FFFFFF" />
            <rect x={-58.6} y={-41.8} width={3.2} height={0.9} rx={0.4} fill="#6D28D9" />
            <rect x={-58.6} y={-40.2} width={2.2} height={0.9} rx={0.4} fill="#F4B740" />
            <rect x={-52.5} y={-42.6} width={10} height={2.2} rx={0.9} fill="#FFFFFF" />
            <rect x={-52.5} y={-39.4} width={6.5} height={1.4} rx={0.7} fill="#C4B5FD" />

            {/* Active Sidebar Pill: Dashboard (Crisp white card pill with brand purple icon & text) */}
            <rect x={-61.2} y={-34.5} width={21.4} height={6.2} rx={1.8} fill="#FFFFFF" />
            {/* 2x2 Grid Icon */}
            <rect x={-59.2} y={-32.8} width={1.2} height={1.2} rx={0.3} fill="#6D28D9" />
            <rect x={-57.6} y={-32.8} width={1.2} height={1.2} rx={0.3} fill="#6D28D9" />
            <rect x={-59.2} y={-31.2} width={1.2} height={1.2} rx={0.3} fill="#6D28D9" />
            <rect x={-57.6} y={-31.2} width={1.2} height={1.2} rx={0.3} fill="#F4B740" />
            <rect x={-54.8} y={-32.3} width={11.5} height={1.9} rx={0.9} fill="#2E1065" />

            {/* Inactive Sidebar Navigation Items */}
            {/* Staff */}
            <circle cx={-58.2} cy={-24.8} r={1.1} fill="#C4B5FD" />
            <rect x={-54.8} y={-25.6} width={8.5} height={1.6} rx={0.8} fill="#DDD6FE" fillOpacity={0.85} />
            {/* Students */}
            <circle cx={-58.2} cy={-19.8} r={1.1} fill="#C4B5FD" />
            <rect x={-54.8} y={-20.6} width={10.5} height={1.6} rx={0.8} fill="#DDD6FE" fillOpacity={0.85} />
            {/* Admission Candidates */}
            <circle cx={-58.2} cy={-14.8} r={1.1} fill="#C4B5FD" />
            <rect x={-54.8} y={-15.6} width={14} height={1.6} rx={0.8} fill="#DDD6FE" fillOpacity={0.85} />
            {/* Faculty & Departments */}
            <circle cx={-58.2} cy={-9.8} r={1.1} fill="#C4B5FD" />
            <rect x={-54.8} y={-10.6} width={13.5} height={1.6} rx={0.8} fill="#DDD6FE" fillOpacity={0.85} />
            {/* Program */}
            <circle cx={-58.2} cy={-4.8} r={1.1} fill="#C4B5FD" />
            <rect x={-54.8} y={-5.6} width={9.5} height={1.6} rx={0.8} fill="#DDD6FE" fillOpacity={0.85} />
            {/* Courses */}
            <circle cx={-58.2} cy={0.2} r={1.1} fill="#C4B5FD" />
            <rect x={-54.8} y={-0.6} width={9} height={1.6} rx={0.8} fill="#DDD6FE" fillOpacity={0.85} />
            {/* Course Registration */}
            <circle cx={-58.2} cy={5.2} r={1.1} fill="#C4B5FD" />
            <rect x={-54.8} y={4.4} width={12.8} height={1.6} rx={0.8} fill="#DDD6FE" fillOpacity={0.85} />
            {/* Assessment */}
            <circle cx={-58.2} cy={10.2} r={1.1} fill="#C4B5FD" />
            <rect x={-54.8} y={9.4} width={10.2} height={1.6} rx={0.8} fill="#DDD6FE" fillOpacity={0.85} />

            {/* Sidebar Configuration Divider */}
            <line x1={-60.5} y1={14.5} x2={-40.5} y2={14.5} stroke="#4C1D95" strokeWidth={0.7} />
            <rect x={-60} y={16.8} width={11} height={1.2} rx={0.6} fill="#A78BFA" fillOpacity={0.7} />
            {/* Grading Config & Admission Config */}
            <circle cx={-58.2} cy={21} r={1} fill="#C4B5FD" />
            <rect x={-54.8} y={20.2} width={11} height={1.5} rx={0.7} fill="#DDD6FE" fillOpacity={0.8} />
            <circle cx={-58.2} cy={25.5} r={1} fill="#C4B5FD" />
            <rect x={-54.8} y={24.7} width={12} height={1.5} rx={0.7} fill="#DDD6FE" fillOpacity={0.8} />

            {/* ================= TOP APP HEADER BAR ================= */}
            <rect x={-38} y={-46.5} width={101} height={7.2} fill="#FFFFFF" />
            <line x1={-38} y1={-39.3} x2={63} y2={-39.3} stroke="#E2E8F0" strokeWidth={0.7} />
            {/* Sidebar toggle icon & breadcrumb */}
            <rect
              x={-34.5}
              y={-44.2}
              width={2.6}
              height={2.4}
              rx={0.5}
              fill="none"
              stroke="#64748B"
              strokeWidth={0.6}
            />
            <line x1={-30.2} y1={-44.4} x2={-30.2} y2={-41.6} stroke="#E2E8F0" strokeWidth={0.6} />
            <rect x={-28.2} y={-43.6} width={9.5} height={1.4} rx={0.7} fill="#64748B" />

            {/* Right User Profile Pill (Warm Gold Avatar + System Administrator) */}
            <circle cx={43} cy={-42.9} r={2.3} fill="#FEF3C7" stroke="#F4B740" strokeWidth={0.5} />
            <circle cx={43} cy={-42.9} r={0.9} fill="#B45309" />
            <rect x={46.5} y={-44.3} width={12.5} height={1.4} rx={0.7} fill="#1E1B4B" />
            <rect x={46.5} y={-42.1} width={9.5} height={1.1} rx={0.5} fill="#94A3B8" />

            {/* ================= DASHBOARD HEADING & FILTER BAR ================= */}
            {/* "Institutional Analytics Dashboard" */}
            <rect x={-34.5} y={-36.2} width={36} height={2.5} rx={1.1} fill="#1E1B4B" />
            <rect x={-34.5} y={-32.7} width={44} height={1.3} rx={0.6} fill="#94A3B8" />

            {/* Filter button + Academic Session Pill ("2025/2026 • First Semester") */}
            <rect
              x={-34.5}
              y={-29.5}
              width={11.5}
              height={4}
              rx={1}
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth={0.6}
            />
            <rect x={-32} y={-28.1} width={6.8} height={1.2} rx={0.6} fill="#334155" />

            {/* Brand Purple Academic Session Badge */}
            <rect x={-21.5} y={-29.3} width={22} height={3.6} rx={1.2} fill="#EDE9FE" />
            <circle cx={-19.3} cy={-27.5} r={0.9} fill="#6D28D9" />
            <rect x={-17.2} y={-28.1} width={15.8} height={1.2} rx={0.6} fill="#6D28D9" />

            {/* Right "Updated Just now" */}
            <rect x={46} y={-28.1} width={10} height={1.2} rx={0.6} fill="#94A3B8" />
            <circle cx={58} cy={-27.5} r={1} fill="none" stroke="#64748B" strokeWidth={0.6} />

            {/* ================= 4 KPI OVERVIEW CARDS ================= */}
            {/* Card 1: Enrolled Headcount */}
            <rect
              x={-34.5}
              y={-23.8}
              width={22}
              height={15.2}
              rx={1.8}
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth={0.6}
            />
            <rect x={-32.5} y={-21.6} width={13} height={1.5} rx={0.7} fill="#1E1B4B" />
            <rect x={-32.5} y={-19.2} width={16} height={1.1} rx={0.5} fill="#94A3B8" />
            <line x1={-34.5} y1={-16.6} x2={-12.5} y2={-16.6} stroke="#F1F5F9" strokeWidth={0.6} />
            <rect x={-32.5} y={-14.5} width={9.5} height={2.2} rx={0.8} fill="#1E1B4B" />
            <rect x={-32.5} y={-11.4} width={8} height={1.1} rx={0.5} fill="#64748B" />
            <rect x={-19.2} y={-15.2} width={5} height={5} rx={1.2} fill="#EDE9FE" />
            <circle cx={-16.7} cy={-12.7} r={1.3} fill="#6D28D9" />

            {/* Card 2: Academic Good Standing */}
            <rect
              x={-10.7}
              y={-23.8}
              width={22}
              height={15.2}
              rx={1.8}
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth={0.6}
            />
            <rect x={-8.7} y={-21.6} width={15} height={1.5} rx={0.7} fill="#1E1B4B" />
            <rect x={-8.7} y={-19.2} width={13} height={1.1} rx={0.5} fill="#94A3B8" />
            <line x1={-10.7} y1={-16.6} x2={11.3} y2={-16.6} stroke="#F1F5F9" strokeWidth={0.6} />
            <rect x={-8.7} y={-14.5} width={8.5} height={2.2} rx={0.8} fill="#1E1B4B" />
            <rect x={-8.7} y={-11.4} width={9.5} height={1.1} rx={0.5} fill="#6D28D9" />
            <rect x={4.6} y={-15.2} width={5} height={5} rx={1.2} fill="#EDE9FE" />
            <circle cx={7.1} cy={-12.7} r={1.4} fill="none" stroke="#6D28D9" strokeWidth={0.8} />

            {/* Card 3: Faculties */}
            <rect
              x={13.1}
              y={-23.8}
              width={22}
              height={15.2}
              rx={1.8}
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth={0.6}
            />
            <rect x={15.1} y={-21.6} width={9.5} height={1.5} rx={0.7} fill="#1E1B4B" />
            <rect x={15.1} y={-19.2} width={14.5} height={1.1} rx={0.5} fill="#94A3B8" />
            <line x1={13.1} y1={-16.6} x2={35.1} y2={-16.6} stroke="#F1F5F9" strokeWidth={0.6} />
            <rect x={15.1} y={-14.5} width={10.5} height={2.2} rx={0.8} fill="#1E1B4B" />
            <rect x={15.1} y={-11.4} width={9} height={1.1} rx={0.5} fill="#64748B" />
            <rect x={28.4} y={-15.2} width={5} height={5} rx={1.2} fill="#FEF3C7" />
            <rect x={29.7} y={-13.9} width={2.4} height={2.4} rx={0.5} fill="#D97706" />

            {/* Card 4: Curriculum Versions */}
            <rect
              x={36.9}
              y={-23.8}
              width={22.1}
              height={15.2}
              rx={1.8}
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth={0.6}
            />
            <rect x={38.9} y={-21.6} width={14} height={1.5} rx={0.7} fill="#1E1B4B" />
            <rect x={38.9} y={-19.2} width={12.5} height={1.1} rx={0.5} fill="#94A3B8" />
            <line x1={36.9} y1={-16.6} x2={59} y2={-16.6} stroke="#F1F5F9" strokeWidth={0.6} />
            <rect x={38.9} y={-14.5} width={9.5} height={2.2} rx={0.8} fill="#1E1B4B" />
            <rect x={38.9} y={-11.4} width={10.5} height={1.1} rx={0.5} fill="#64748B" />
            <rect x={52.2} y={-15.2} width={5} height={5} rx={1.2} fill="#EDE9FE" />
            <rect x={53.6} y={-14} width={2.2} height={2.6} rx={0.4} fill="#6D28D9" />

            {/* ================= BOTTOM ANALYTICS PANELS ================= */}
            {/* Left Panel: Student Standing & Academic Risk */}
            <rect
              x={-34.5}
              y={-6.6}
              width={45.5}
              height={34}
              rx={2}
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth={0.6}
            />
            <rect x={-32} y={-3.8} width={24} height={1.7} rx={0.8} fill="#1E1B4B" />
            <rect x={0.5} y={-3.6} width={8} height={1.3} rx={0.6} fill="#94A3B8" />
            <line x1={-34.5} y1={-0.6} x2={11} y2={-0.6} stroke="#F1F5F9" strokeWidth={0.6} />

            {/* Brand-colored Standing Breakdown Bar (Royal Purple + Warm Gold + Soft Violet) */}
            <rect x={-32} y={2.2} width={40.5} height={3} rx={1.5} fill="#EDE9FE" />
            <rect x={-32} y={2.2} width={27} height={3} rx={1.5} fill="#6D28D9" />
            <rect x={-6.5} y={2.2} width={10.5} height={3} rx={1.2} fill="#FBBF24" />

            {/* Standing Legend Items */}
            <circle cx={-31} cy={8.5} r={1} fill="#6D28D9" />
            <rect x={-28.8} y={7.8} width={13} height={1.4} rx={0.7} fill="#334155" />

            <circle cx={-9} cy={8.5} r={1} fill="#FBBF24" />
            <rect x={-6.8} y={7.8} width={13} height={1.4} rx={0.7} fill="#334155" />

            <circle cx={-31} cy={12.5} r={1} fill="#8B5CF6" />
            <rect x={-28.8} y={11.8} width={17} height={1.4} rx={0.7} fill="#334155" />

            <line x1={-32} y1={16.2} x2={8.5} y2={16.2} stroke="#F1F5F9" strokeWidth={0.6} />
            <rect x={-32} y={18.2} width={19} height={1.2} rx={0.6} fill="#94A3B8" />
            <rect x={-32} y={21} width={9.5} height={3.2} rx={1} fill="#EDE9FE" />
            <rect x={-30.2} y={22} width={6} height={1.2} rx={0.6} fill="#4C1D95" />

            {/* Right Panel: Student Distribution by Level */}
            <rect
              x={13}
              y={-6.6}
              width={46}
              height={34}
              rx={2}
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth={0.6}
            />
            <rect x={15.5} y={-3.8} width={23} height={1.7} rx={0.8} fill="#1E1B4B" />
            <rect x={47.5} y={-3.6} width={9} height={1.3} rx={0.6} fill="#94A3B8" />
            <line x1={13} y1={-0.6} x2={59} y2={-0.6} stroke="#F1F5F9" strokeWidth={0.6} />

            {/* 100 Level Progress Bar (Royal Purple #6D28D9) */}
            <rect x={15.5} y={2.2} width={8.5} height={1.4} rx={0.7} fill="#1E1B4B" />
            <rect x={49.5} y={2.2} width={7} height={1.4} rx={0.7} fill="#4C1D95" />
            <rect x={15.5} y={4.8} width={41} height={2.4} rx={1.2} fill="#F1F5F9" />
            <rect x={15.5} y={4.8} width={35} height={2.4} rx={1.2} fill="#6D28D9" />

            {/* 200 Level Progress Bar (Vibrant Violet #8B5CF6) */}
            <rect x={15.5} y={9.8} width={8.5} height={1.4} rx={0.7} fill="#1E1B4B" />
            <rect x={49.5} y={9.8} width={7} height={1.4} rx={0.7} fill="#6D28D9" />
            <rect x={15.5} y={12.4} width={41} height={2.4} rx={1.2} fill="#F1F5F9" />
            <rect x={15.5} y={12.4} width={26} height={2.4} rx={1.2} fill="#8B5CF6" />

            {/* 300 Level Progress Bar (Warm Academic Gold #F4B740) */}
            <rect x={15.5} y={17.4} width={8.5} height={1.4} rx={0.7} fill="#1E1B4B" />
            <rect x={49.5} y={17.4} width={7} height={1.4} rx={0.7} fill="#B45309" />
            <rect x={15.5} y={20} width={41} height={2.4} rx={1.2} fill="#F1F5F9" />
            <rect x={15.5} y={20} width={18} height={2.4} rx={1.2} fill="#F4B740" />
          </g>
        </g>

        {/* MacBook aluminum base / keyboard deck */}
        <rect
          x={-80}
          y={34.5}
          width={160}
          height={6}
          rx={2}
          fill="#E2E8F0"
          stroke="#94A3B8"
          strokeWidth={1}
        />
        {/* Trackpad thumb notch */}
        <path d="M-13 34.5 H13 Q12 37.8 9.5 37.8 H-9.5 Q-12 37.8 -13 34.5 Z" fill="#94A3B8" />
        {/* Tapered bottom chassis */}
        <path d="M-80 39.8 Q-77 46 -65 46 H65 Q77 46 80 39.8 Z" fill="#94A3B8" />
      </g>
    </g>
  );
}
